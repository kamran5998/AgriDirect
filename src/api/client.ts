import { ENV } from '../config/env';

/**
 * Standard API Response envelope conforming to FastAPI standard responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
  error?: string;
  details?: any;
}

/**
 * Standard Paginated Response for list endpoints
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Structured API Error class
 */
export class ApiError extends Error {
  status: number;
  data?: any;
  code?: string;

  constructor(message: string, status: number = 500, data?: any, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

/**
 * Request options extending standard Fetch RequestInit
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, any> | any;
  body?: any;
  timeout?: number;
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = ENV.API_BASE_URL) {
    // Strip trailing slash if present
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Retrieves the current stored JWT authentication token
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem(ENV.STORAGE_AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Builds the query string from an object of params
   */
  private buildQueryString(params?: Record<string, string | number | boolean | undefined | null>): string {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Core request executor with timeout and error parsing
   */
  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      params,
      body,
      timeout = ENV.API_TIMEOUT_MS,
      requiresAuth = true,
      headers = {},
      ...customConfig
    } = options;

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}${this.buildQueryString(params)}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    };

    // Attach JWT Bearer token if required and present
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...customConfig,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse JSON response safely
      let responseData: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          (typeof responseData === 'object' && (responseData?.detail || responseData?.message || responseData?.error)) ||
          `Request failed with status ${response.status}: ${response.statusText}`;

        throw new ApiError(
          errorMessage,
          response.status,
          responseData,
          responseData?.code
        );
      }

      // If backend wraps in { success: true, data: ... }
      if (responseData && typeof responseData === 'object' && 'data' in responseData && 'success' in responseData) {
        return responseData.data as T;
      }

      return responseData as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new ApiError(`Request to ${endpoint} timed out after ${timeout}ms`, 408, null, 'TIMEOUT');
      }

      if (error instanceof ApiError) {
        throw error;
      }

      // Network error (e.g. backend offline)
      throw new ApiError(
        error.message || 'Unable to connect to backend server. Please check your network connection.',
        0,
        null,
        'NETWORK_ERROR'
      );
    }
  }

  // Convenience HTTP methods
  public get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Multipart Form-Data file upload handler
   */
  public async upload<T = any>(endpoint: string, formData: FormData, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    const { params, timeout = 30000, requiresAuth = true, headers = {}, ...customConfig } = options;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}${this.buildQueryString(params)}`;

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...customConfig,
        method: 'POST',
        headers: requestHeaders, // Let browser set Content-Type with boundary for FormData
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data?.detail || data?.message || 'File upload failed', response.status, data);
      }

      return (data?.data ?? data) as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'File upload failed', 0);
    }
  }
}

// Singleton API client export
export const apiClient = new ApiClient();
export default apiClient;
