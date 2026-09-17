/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Production-Quality IndexedDB & Local Storage Service for AgriDirect Pulse
 * Handles caching of market data, buyer directory, farmer profile, listings,
 * and queues offline mutations for safe synchronization when connectivity resumes.
 */

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  lastUpdated: number; // Unix timestamp in ms
  source: 'server_live' | 'local_seed' | 'user_draft' | 'fallback';
  version?: number;
  meta?: Record<string, any>;
}

export interface OfflineQueueItem {
  id: string;
  actionType: 'SEND_BUYER_REQUEST' | 'POST_CROP_LISTING' | 'CREATE_CROP_LISTING' | 'UPDATE_FARMER_PROFILE' | 'COUNTER_OFFER' | 'LOG_PRICE_ALERT';
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
}

const DB_NAME = 'agridirect_offline_db';
const DB_VERSION = 1;
const STORE_CACHE = 'dataset_cache';
const STORE_QUEUE = 'offline_mutation_queue';

// In-Memory fallback if IndexedDB is blocked
const memoryCache = new Map<string, CacheEntry>();
const memoryQueue = new Map<string, OfflineQueueItem>();

let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

function getDatabase(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error('IndexedDB is not available in this environment'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_CACHE)) {
          db.createObjectStore(STORE_CACHE, { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.onclose = () => {
          dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = (event) => {
        console.warn('[OfflineStorage] IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        dbPromise = null;
        reject((event.target as IDBOpenDBRequest).error);
      };
    } catch (err) {
      console.warn('[OfflineStorage] IndexedDB initialization error:', err);
      dbPromise = null;
      reject(err);
    }
  });

  return dbPromise;
}

export const offlineStorage = {
  /**
   * Save a dataset to cache with timestamp and source tracking
   */
  async setCachedItem<T = any>(
    key: string,
    data: T,
    source: 'server_live' | 'local_seed' | 'user_draft' | 'fallback' = 'server_live',
    meta?: Record<string, any>
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      data,
      lastUpdated: Date.now(),
      source,
      meta,
    };

    // 1. In-memory
    memoryCache.set(key, entry);

    // 2. localStorage backup
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`agri_cache_${key}`, JSON.stringify(entry));
      }
    } catch {
      // Ignore quota exceeded
    }

    // 3. IndexedDB Primary Store
    try {
      const db = await getDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_CACHE, 'readwrite');
        const store = tx.objectStore(STORE_CACHE);
        const req = store.put(entry);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // In-memory and localStorage handle this gracefully
    }
  },

  /**
   * Get a cached dataset with lastUpdated timestamp and source
   */
  async getCachedItem<T = any>(key: string): Promise<CacheEntry<T> | null> {
    // 1. Check IndexedDB
    try {
      const db = await getDatabase();
      const entry = await new Promise<CacheEntry<T> | null>((resolve) => {
        const tx = db.transaction(STORE_CACHE, 'readonly');
        const store = tx.objectStore(STORE_CACHE);
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result) {
            resolve(req.result as CacheEntry<T>);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });

      if (entry) {
        memoryCache.set(key, entry);
        return entry;
      }
    } catch {
      // Continue to local storage fallback
    }

    // 2. Check localStorage fallback
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(`agri_cache_${key}`);
        if (raw) {
          const parsed = JSON.parse(raw) as CacheEntry<T>;
          memoryCache.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // Continue to memory cache
    }

    // 3. In-memory cache
    if (memoryCache.has(key)) {
      return (memoryCache.get(key) as CacheEntry<T>) || null;
    }

    return null;
  },

  /**
   * Get metadata for all cached items
   */
  async getAllCacheMetadata(): Promise<Record<string, { lastUpdated: number; source: string; isStale: boolean }>> {
    const result: Record<string, { lastUpdated: number; source: string; isStale: boolean }> = {};
    const now = Date.now();
    const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

    try {
      const db = await getDatabase();
      const entries = await new Promise<CacheEntry[]>((resolve) => {
        const tx = db.transaction(STORE_CACHE, 'readonly');
        const store = tx.objectStore(STORE_CACHE);
        const req = store.getAll();

        req.onsuccess = () => resolve((req.result as CacheEntry[]) || []);
        req.onerror = () => resolve([]);
      });

      entries.forEach((e) => {
        result[e.key] = {
          lastUpdated: e.lastUpdated,
          source: e.source,
          isStale: now - e.lastUpdated > STALE_THRESHOLD_MS,
        };
      });
      return result;
    } catch {
      memoryCache.forEach((v, k) => {
        result[k] = {
          lastUpdated: v.lastUpdated,
          source: v.source,
          isStale: now - v.lastUpdated > STALE_THRESHOLD_MS,
        };
      });
      return result;
    }
  },

  /**
   * Queue an offline mutation (e.g. buyer trade request / counter offer)
   */
  async enqueueOfflineAction(actionType: OfflineQueueItem['actionType'], payload: any): Promise<OfflineQueueItem> {
    const id = `off_tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const queueItem: OfflineQueueItem = {
      id,
      actionType,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    memoryQueue.set(id, queueItem);

    try {
      const db = await getDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_QUEUE, 'readwrite');
        const store = tx.objectStore(STORE_QUEUE);
        const req = store.put(queueItem);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const current = JSON.parse(window.localStorage.getItem('agri_offline_queue') || '[]');
          current.push(queueItem);
          window.localStorage.setItem('agri_offline_queue', JSON.stringify(current));
        }
      } catch {
        // Handled in memory
      }
    }

    return queueItem;
  },

  /**
   * Get all pending queue items awaiting synchronization
   */
  async getPendingQueueItems(): Promise<OfflineQueueItem[]> {
    try {
      const db = await getDatabase();
      return await new Promise<OfflineQueueItem[]>((resolve) => {
        const tx = db.transaction(STORE_QUEUE, 'readonly');
        const store = tx.objectStore(STORE_QUEUE);
        const req = store.getAll();

        req.onsuccess = () => {
          const items = (req.result as OfflineQueueItem[]) || [];
          resolve(items.filter((item) => item.status === 'pending' || item.status === 'failed'));
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const items = JSON.parse(window.localStorage.getItem('agri_offline_queue') || '[]') as OfflineQueueItem[];
          return items.filter((item) => item.status === 'pending' || item.status === 'failed');
        }
      } catch {
        // Fallback
      }
      return Array.from(memoryQueue.values()).filter((item) => item.status === 'pending' || item.status === 'failed');
    }
  },

  /**
   * Mark a queued action as synced and remove or update it
   */
  async markQueueItemSynced(id: string): Promise<void> {
    memoryQueue.delete(id);

    try {
      const db = await getDatabase();
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_QUEUE, 'readwrite');
        const store = tx.objectStore(STORE_QUEUE);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const items = JSON.parse(window.localStorage.getItem('agri_offline_queue') || '[]') as OfflineQueueItem[];
          const filtered = items.filter((item) => item.id !== id);
          window.localStorage.setItem('agri_offline_queue', JSON.stringify(filtered));
        }
      } catch {
        // Handled
      }
    }
  },

  /**
   * Format last synced timestamp into user-friendly localized text
   */
  formatLastSynced(timestamp: number | null | undefined, lang: 'en' | 'hi' | 'mr' = 'en'): string {
    if (!timestamp) {
      return lang === 'hi' ? 'कभी नहीं' : lang === 'mr' ? 'कधीही नाही' : 'Never';
    }

    const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    
    if (diffSec < 60) {
      if (lang === 'hi') return 'अभी-अभी';
      if (lang === 'mr') return 'आत्ताच';
      return 'Just now';
    }

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      if (lang === 'hi') return `${diffMin} मिनट पहले`;
      if (lang === 'mr') return `${diffMin} मिनिटांपूर्वी`;
      return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    }

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      if (lang === 'hi') return `${diffHours} घंटे पहले`;
      if (lang === 'mr') return `${diffHours} तासांपूर्वी`;
      return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    }

    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (lang === 'hi') return `${day} ${month}, ${time}`;
    if (lang === 'mr') return `${day} ${month}, ${time}`;
    return `${day} ${month}, ${time}`;
  }
};
