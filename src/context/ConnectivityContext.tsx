/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Connectivity Context & Hook for AgriDirect Pulse
 * Production-ready connectivity detection, offline queue management,
 * and automatic synchronization engine.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { offlineStorage, OfflineQueueItem } from '../services/offlineStorageService';
import { buyerApi } from '../api/buyerApi';
import { farmerApi } from '../api/farmerApi';
import { marketApi } from '../api/marketApi';
import { notificationApi } from '../api/notificationApi';

export type ConnectivityStatus = 'ONLINE' | 'OFFLINE' | 'RECONNECTING' | 'SYNCING';

export interface ConnectivityContextValue {
  status: ConnectivityStatus;
  isOnline: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  isReconnecting: boolean;
  lastOnlineTimestamp: number | null;
  lastSyncTimestamp: number | null;
  pendingSyncCount: number;
  checkConnection: () => Promise<boolean>;
  triggerSync: () => Promise<void>;
  enqueueAction: (actionType: OfflineQueueItem['actionType'], payload: any) => Promise<OfflineQueueItem>;
  cacheMetadata: Record<string, { lastUpdated: number; source: string; isStale: boolean }>;
  refreshCacheMetadata: () => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextValue | undefined>(undefined);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectivityStatus>(() => {
    return typeof navigator !== 'undefined' && navigator.onLine ? 'ONLINE' : 'OFFLINE';
  });

  const [lastOnlineTimestamp, setLastOnlineTimestamp] = useState<number | null>(() => {
    return typeof navigator !== 'undefined' && navigator.onLine ? Date.now() : null;
  });

  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(Date.now());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [cacheMetadata, setCacheMetadata] = useState<Record<string, { lastUpdated: number; source: string; isStale: boolean }>>({});

  const isSyncingRef = useRef<boolean>(false);
  const consecutiveFailuresRef = useRef<number>(0);

  // Update pending queue count and cache metadata
  const refreshCacheMetadata = useCallback(async () => {
    try {
      const meta = await offlineStorage.getAllCacheMetadata();
      setCacheMetadata(meta);

      const queue = await offlineStorage.getPendingQueueItems();
      setPendingSyncCount(queue.length);
    } catch (err) {
      console.warn('[Connectivity] Failed to refresh cache meta:', err);
    }
  }, []);

  /**
   * Active probe to verify internet reachability without faking
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('OFFLINE');
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        consecutiveFailuresRef.current = 0;
        setLastOnlineTimestamp(Date.now());
        return true;
      }
      consecutiveFailuresRef.current += 1;
      return false;
    } catch {
      consecutiveFailuresRef.current += 1;
      return false;
    }
  }, []);

  /**
   * Synchronization Engine: flushes offline mutation queue and refreshes core dataset caches
   */
  const triggerSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setStatus('SYNCING');

    try {
      // 1. Verify reachability first
      const isReachable = await checkConnection();
      if (!isReachable) {
        setStatus('OFFLINE');
        isSyncingRef.current = false;
        return;
      }

      // 2. Process pending offline mutations
      const pendingItems = await offlineStorage.getPendingQueueItems();
      for (const item of pendingItems) {
        try {
          if (item.actionType === 'SEND_BUYER_REQUEST') {
            await farmerApi.submitSupplyRequest(item.payload);
            await offlineStorage.markQueueItemSynced(item.id);
          } else if (item.actionType === 'COUNTER_OFFER') {
            await farmerApi.submitSupplyRequest(item.payload);
            await offlineStorage.markQueueItemSynced(item.id);
          } else if (item.actionType === 'POST_CROP_LISTING' || item.actionType === 'CREATE_CROP_LISTING') {
            await farmerApi.createListing(item.payload);
            await offlineStorage.markQueueItemSynced(item.id);
          }
        } catch (itemErr) {
          console.warn('[Connectivity] Failed to sync item:', item.id, itemErr);
          // Keep item in queue for next retry
        }
      }

      // 3. Refresh and cache core application datasets
      try {
        // Cache market prices & tickers
        const ticker = await marketApi.getLiveTicker();
        if (ticker && ticker.length > 0) {
          await offlineStorage.setCachedItem('live_ticker_crops', ticker, 'server_live');
        }

        const marketPrices = await marketApi.searchMarketPrices();
        if (marketPrices && marketPrices.length > 0) {
          await offlineStorage.setCachedItem('comprehensive_market_prices', marketPrices, 'server_live');
        }

        // Cache mandi directory
        const mandis = await marketApi.getMandiDirectory();
        if (mandis && mandis.length > 0) {
          await offlineStorage.setCachedItem('mandi_directory', mandis, 'server_live');
        }

        // Cache verified buyers
        const buyers = await buyerApi.getBuyers();
        if (buyers && buyers.length > 0) {
          await offlineStorage.setCachedItem('verified_buyers_list', buyers, 'server_live');
        }

        // Cache buyer requirements
        const reqs = await buyerApi.getRequirements();
        if (reqs && reqs.length > 0) {
          await offlineStorage.setCachedItem('buyer_requirements_list', reqs, 'server_live');
        }

        // Cache notifications
        const notifs = await notificationApi.getNotifications();
        if (notifs && notifs.length > 0) {
          await offlineStorage.setCachedItem('user_notifications', notifs, 'server_live');
        }

        // Cache farmer listings
        const listings = await farmerApi.getListings();
        if (listings && listings.length > 0) {
          await offlineStorage.setCachedItem('farmer_my_listings', listings, 'server_live');
        }
      } catch (cacheErr) {
        console.warn('[Connectivity] Non-fatal cache refresh issue during sync:', cacheErr);
      }

      setLastSyncTimestamp(Date.now());
      setLastOnlineTimestamp(Date.now());
      await refreshCacheMetadata();

      setStatus('ONLINE');
    } catch (err) {
      console.warn('[Connectivity] Sync encountered error:', err);
      setStatus('OFFLINE');
    } finally {
      isSyncingRef.current = false;
    }
  }, [checkConnection, refreshCacheMetadata]);

  /**
   * Safe Mutation Enqueuer
   */
  const enqueueAction = useCallback(async (actionType: OfflineQueueItem['actionType'], payload: any) => {
    const item = await offlineStorage.enqueueOfflineAction(actionType, payload);
    await refreshCacheMetadata();

    // If currently online, attempt immediate sync in background
    if (status === 'ONLINE') {
      triggerSync().catch(() => {});
    }

    return item;
  }, [status, triggerSync, refreshCacheMetadata]);

  // Initial seed and initial cache metadata load on startup
  useEffect(() => {
    refreshCacheMetadata();

    // Perform initial background sync if online to populate cache
    if (navigator.onLine) {
      triggerSync().catch(() => {});
    }
  }, [refreshCacheMetadata, triggerSync]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      setStatus('RECONNECTING');
      const isReachable = await checkConnection();
      if (isReachable) {
        await triggerSync();
      } else {
        setStatus('OFFLINE');
      }
    };

    const handleOffline = () => {
      setStatus('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Heartbeat probe every 20 seconds (or 8 seconds if reconnecting)
    const interval = setInterval(async () => {
      if (status === 'ONLINE') {
        const isReachable = await checkConnection();
        if (!isReachable) {
          if (consecutiveFailuresRef.current >= 2) {
            setStatus('OFFLINE');
          }
        }
      } else if (status === 'OFFLINE' && navigator.onLine) {
        setStatus('RECONNECTING');
        const isReachable = await checkConnection();
        if (isReachable) {
          await triggerSync();
        } else {
          setStatus('OFFLINE');
        }
      }
    }, status === 'RECONNECTING' ? 8000 : 20000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [status, checkConnection, triggerSync]);

  const value: ConnectivityContextValue = {
    status,
    isOnline: status === 'ONLINE',
    isOffline: status === 'OFFLINE',
    isSyncing: status === 'SYNCING',
    isReconnecting: status === 'RECONNECTING',
    lastOnlineTimestamp,
    lastSyncTimestamp,
    pendingSyncCount,
    checkConnection,
    triggerSync,
    enqueueAction,
    cacheMetadata,
    refreshCacheMetadata,
  };

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = (): ConnectivityContextValue => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};
