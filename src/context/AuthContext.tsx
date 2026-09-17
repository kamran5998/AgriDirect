import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, FarmerProfile } from '../types';
import { authApi, AuthUser, LoginPayload, RegisterPayload } from '../api/authApi';
import { ENV } from '../config/env';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  sendOtp: (mobileNumber: string) => Promise<{ success: boolean; message: string; demoOtp?: string; otpTestHint?: string }>;
  verifyOtp: (mobileNumber: string, otp: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateFarmerProfile: (profile: Partial<FarmerProfile>) => void;
  clearError: () => void;
}

const DEFAULT_FARMER_PROFILE: FarmerProfile = {
  fullName: 'Rajinder Singh',
  mobileNumber: '+91 98765 43210',
  email: 'rajinder.singh@farmmail.in',
  kisanId: 'ADP-FMR-10001',
  platformId: 'ADP-FMR-10001',
  state: 'Madhya Pradesh',
  district: 'Sehore',
  village: 'Ashta',
  pincode: '466116',
  farmSize: '5-10 Acres',
  farmingType: 'Conventional High-Yield',
  experienceYears: '10+ Years',
  preferredLanguage: 'Hindi (हिन्दी)',
  selectedCrops: ['Wheat (Sharbati / Lokwan)', 'Soybean (Yellow Seed)'],
  harvestVolumes: { 'Wheat (Sharbati / Lokwan)': '150', 'Soybean (Yellow Seed)': '80' },
  selectedMandis: ['Sehore APMC Mandi', 'Indore Grain Market'],
  transportWillingness: 'Up to 100 km',
  hasWarehouseStorage: true,
  smsAlertsEnabled: true,
  whatsappAlertsEnabled: true,
};

const DEFAULT_USERS_BY_ROLE: Record<UserRole, AuthUser> = {
  farmer: {
    id: '1',
    platformId: 'ADP-FMR-10001',
    kisanId: 'ADP-FMR-10001',
    fullName: 'Rajinder Singh',
    mobileNumber: '+91 98765 43210',
    email: 'rajinder.singh@farmmail.in',
    role: 'farmer',
    isVerified: true,
    state: 'Madhya Pradesh',
    district: 'Sehore',
    farmerProfile: DEFAULT_FARMER_PROFILE,
    createdAt: '2025-06-12T00:00:00Z',
  },
  buyer: {
    id: '7',
    platformId: 'ADP-BYR-20001',
    buyerId: 'ADP-BYR-20001',
    fullName: 'Anil Agarwal',
    mobileNumber: '+91 98234 56789',
    email: 'procurement@patanjaliagro.com',
    role: 'buyer',
    isVerified: true,
    companyName: 'Patanjali Agro Processing Ltd',
    gstin: '23AAACP1234F1Z8',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    createdAt: '2025-05-10T00:00:00Z',
  },
  admin: {
    id: '11',
    platformId: 'ADP-ADM-00001',
    fullName: 'Dr. Vivek Sharma',
    mobileNumber: '+91 98111 22233',
    email: 'admin.ops@agridirect.gov.in',
    role: 'admin',
    isVerified: true,
    state: 'National Operations',
    createdAt: '2025-01-01T00:00:00Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const isExplicitlyLoggedOut = localStorage.getItem('agridirect_logged_out') === 'true';
      if (isExplicitlyLoggedOut) return null;
      const stored = localStorage.getItem(ENV.STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USERS_BY_ROLE.farmer;
    } catch {
      return DEFAULT_USERS_BY_ROLE.farmer;
    }
  });

  const [role, setRole] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(ENV.STORAGE_ROLE_KEY) as UserRole;
      return stored && ['farmer', 'buyer', 'admin'].includes(stored) ? stored : 'farmer';
    } catch {
      return 'farmer';
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      const isExplicitlyLoggedOut = localStorage.getItem('agridirect_logged_out') === 'true';
      if (isExplicitlyLoggedOut) return null;
      return localStorage.getItem(ENV.STORAGE_AUTH_TOKEN_KEY) || 'demo-jwt-token';
    } catch {
      return 'demo-jwt-token';
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(ENV.STORAGE_USER_KEY, JSON.stringify(user));
        localStorage.setItem(ENV.STORAGE_ROLE_KEY, user.role || role);
      } else {
        localStorage.removeItem(ENV.STORAGE_USER_KEY);
      }
      if (token) {
        localStorage.setItem(ENV.STORAGE_AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ENV.STORAGE_AUTH_TOKEN_KEY);
      }
    } catch {
      // Ignore local storage errors in sandboxed iframes
    }
  }, [user, role, token]);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Log in user using the backend credentials
   */
  const login = useCallback(async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const selectedRole = payload.role || 'farmer';

    try {
      localStorage.removeItem('agridirect_logged_out');
      // Attempt backend API call
      const response = await authApi.login(payload);
      if (response && response.accessToken) {
        const resolvedRole = (response.user.role as UserRole) || selectedRole;
        const normalizedUser: AuthUser = {
          ...response.user,
          role: resolvedRole,
        };
        setToken(response.accessToken);
        setUser(normalizedUser);
        setRole(resolvedRole);
        try {
          localStorage.setItem(ENV.STORAGE_AUTH_TOKEN_KEY, response.accessToken);
          localStorage.setItem(ENV.STORAGE_ROLE_KEY, resolvedRole);
          localStorage.setItem(ENV.STORAGE_USER_KEY, JSON.stringify(normalizedUser));
        } catch {}
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (err: any) {
      console.warn('Backend login error:', err);
      // Surface authoritative error message from backend
      const errorMsg = err?.data?.error || err?.data?.message || err?.message || 'Login failed. Please verify your credentials.';
      setError(errorMsg);
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Request 4-digit demo OTP for farmer login
   */
  const sendOtp = useCallback(async (mobileNumber: string): Promise<{ success: boolean; message: string; demoOtp?: string; otpTestHint?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.sendOtp(mobileNumber);
      setIsLoading(false);
      return res;
    } catch (err: any) {
      setIsLoading(false);
      return { success: true, message: 'OTP sent to mobile (Demo OTP: 1234)', demoOtp: '1234', otpTestHint: '1234' };
    }
  }, []);

  /**
   * Verify 4-digit demo OTP and set active farmer session
   */
  const verifyOtp = useCallback(async (mobileNumber: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('agridirect_logged_out');
      const response = await authApi.verifyOtp(mobileNumber, otp);
      if (response && response.accessToken) {
        const normalizedUser: AuthUser = {
          ...response.user,
          role: 'farmer',
        };
        setToken(response.accessToken);
        setUser(normalizedUser);
        setRole('farmer');
        try {
          localStorage.setItem(ENV.STORAGE_AUTH_TOKEN_KEY, response.accessToken);
          localStorage.setItem(ENV.STORAGE_ROLE_KEY, 'farmer');
          localStorage.setItem(ENV.STORAGE_USER_KEY, JSON.stringify(normalizedUser));
        } catch {}
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      console.warn('Fallback local OTP verify session:', err.message);
      const clean = mobileNumber.replace(/\D/g, '');
      const fallbackUser: AuthUser = {
        id: `usr-kisan-${clean.slice(-4) || '01'}`,
        platformId: `ADP-FMR-10001`,
        kisanId: `ADP-FMR-10001`,
        fullName: clean === '9876543210' ? 'Rajinder Singh' : `Kisan Member (${clean.slice(-4)})`,
        mobileNumber,
        email: `${clean || 'farmer'}@farmmail.in`,
        role: 'farmer',
        isVerified: true,
        state: 'Madhya Pradesh',
        district: 'Sehore',
        farmerProfile: {
          ...DEFAULT_FARMER_PROFILE,
          fullName: clean === '9876543210' ? 'Rajinder Singh' : `Kisan Member (${clean.slice(-4)})`,
          mobileNumber,
        },
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      setRole('farmer');
      const fallbackToken = `jwt_token_farmer_1_${Date.now()}`;
      setToken(fallbackToken);
      try {
        localStorage.setItem(ENV.STORAGE_AUTH_TOKEN_KEY, fallbackToken);
        localStorage.setItem(ENV.STORAGE_ROLE_KEY, 'farmer');
        localStorage.setItem(ENV.STORAGE_USER_KEY, JSON.stringify(fallbackUser));
      } catch {}
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return true;
  }, []);

  /**
   * Register user with backend-generated unique platform ID
   */
  const register = useCallback(async (payload: RegisterPayload): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      localStorage.removeItem('agridirect_logged_out');
      const response = await authApi.register(payload);
      if (response && response.accessToken) {
        setToken(response.accessToken);
        setUser(response.user);
        setRole(response.user.role);
        try {
          localStorage.setItem(ENV.STORAGE_AUTH_TOKEN_KEY, response.accessToken);
          localStorage.setItem(ENV.STORAGE_ROLE_KEY, response.user.role);
          localStorage.setItem(ENV.STORAGE_USER_KEY, JSON.stringify(response.user));
        } catch {}
        setIsLoading(false);
        return { success: true, user: response.user };
      }
      setIsLoading(false);
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      console.warn('Backend registration error:', err);
      const errorMsg = err?.data?.error || err?.data?.message || err?.message || 'Registration failed. Please check your inputs.';
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Logout session
   */
  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    setUser(null);
    setToken(null);
    setRole('farmer');
    try {
      localStorage.removeItem(ENV.STORAGE_USER_KEY);
      localStorage.removeItem(ENV.STORAGE_AUTH_TOKEN_KEY);
      localStorage.removeItem(ENV.STORAGE_ROLE_KEY);
      localStorage.setItem('agridirect_logged_out', 'true');
    } catch {}
  }, []);

  /**
   * Fast Role Switching helper (for presentations and prototyping)
   */
  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
    setUser(DEFAULT_USERS_BY_ROLE[newRole]);
    const nextToken = newRole === 'buyer' ? 'jwt_token_buyer_7' : newRole === 'admin' ? 'jwt_token_admin_11' : 'jwt_token_farmer_1';
    setToken(nextToken);
    try {
      localStorage.setItem(ENV.STORAGE_AUTH_TOKEN_KEY, nextToken);
      localStorage.setItem(ENV.STORAGE_ROLE_KEY, newRole);
      localStorage.setItem(ENV.STORAGE_USER_KEY, JSON.stringify(DEFAULT_USERS_BY_ROLE[newRole]));
    } catch {}
  }, []);

  /**
   * Update farmer profile in state and local cache
   */
  const updateFarmerProfile = useCallback((profileUpdates: Partial<FarmerProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const currentFarmerProfile = prev.farmerProfile || DEFAULT_FARMER_PROFILE;
      return {
        ...prev,
        fullName: profileUpdates.fullName || prev.fullName,
        mobileNumber: profileUpdates.mobileNumber || prev.mobileNumber,
        email: profileUpdates.email || prev.email,
        state: profileUpdates.state || prev.state,
        district: profileUpdates.district || prev.district,
        farmerProfile: {
          ...currentFarmerProfile,
          ...profileUpdates,
        },
      };
    });
  }, []);

  const value = {
    user,
    role,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    error,
    login,
    sendOtp,
    verifyOtp,
    register,
    logout,
    switchRole,
    updateFarmerProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
