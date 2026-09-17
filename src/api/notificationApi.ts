import { apiClient } from './client';

export type AlertChannel = 'SMS' | 'WHATSAPP' | 'IN_APP';
export type AlertType = 'price_alert' | 'offer_alert' | 'trade_alert' | 'payment_alert' | 'gate_pass' | 'system_notice' | string;

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: AlertType;
  channel?: AlertChannel;
  cropName?: string;
  mandiName?: string;
  priceChange?: number;
  tradeId?: number | string;
  gatePassId?: string;
  actionTab?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  /**
   * Get user notification stream
   * GET /api/notifications
   */
  async getNotifications(params?: { userId?: number; type?: string; channel?: string; unreadOnly?: boolean }): Promise<NotificationItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.userId) query.set('userId', String(params.userId));
      if (params?.type) query.set('type', params.type);
      if (params?.channel) query.set('channel', params.channel);
      if (params?.unreadOnly) query.set('unreadOnly', 'true');

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await apiClient.get<any[]>(`/notifications${queryString}`);
      if (Array.isArray(res)) {
        return res.map((n) => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          channel: n.channel || 'IN_APP',
          cropName: n.crop_name,
          mandiName: n.mandi_name,
          priceChange: n.price_change,
          tradeId: n.trade_id,
          gatePassId: n.gate_pass_id,
          actionTab: n.action_tab,
          isRead: Boolean(n.is_read),
          createdAt: n.created_at || 'Just now',
        }));
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 1,
        userId: 1,
        title: 'Indore Mandi Price Spike Alert: Wheat +₹80/Qtl',
        message: 'Indore APMC modal price surged to ₹2,920/Qtl (+₹80 over local benchmark). Demand index: High. Recommended selling window is active.',
        type: 'price_alert',
        channel: 'WHATSAPP',
        cropName: 'Wheat',
        mandiName: 'Indore APMC Mandi',
        priceChange: 80,
        actionTab: 'markets',
        isRead: false,
        createdAt: '15m ago',
      },
      {
        id: 2,
        userId: 1,
        title: 'Direct Purchase Proposal Received',
        message: 'ITC Foods Agri-Procurement sent direct offer of ₹2,920/Qtl for 140 Qtl Sharbati Wheat lot with assisted farm-gate loading.',
        type: 'offer_alert',
        channel: 'SMS',
        tradeId: 201,
        cropName: 'Wheat',
        actionTab: 'buyers',
        isRead: false,
        createdAt: '45m ago',
      },
      {
        id: 3,
        userId: 1,
        title: 'Digital Escrow Security Locked: ₹4,08,800',
        message: '100% trade value for Contract #REQ-201 is now held in RBI-regulated Digital Escrow bank clearing account. Gate Pass GP-SEH-4821 verified.',
        type: 'payment_alert',
        channel: 'WHATSAPP',
        tradeId: 201,
        gatePassId: 'GP-SEH-4821',
        actionTab: 'buyers',
        isRead: false,
        createdAt: '2h ago',
      },
    ];
  },

  /**
   * Trigger Simulated SMS/WhatsApp Alert
   * POST /api/notifications/simulate
   */
  async simulateAlert(scenario: 'price_spike' | 'buyer_offer' | 'payment_credit' | 'gate_pass' | 'mandi_dip', userId: number = 1): Promise<NotificationItem | null> {
    try {
      const res = await apiClient.post<any>('/notifications/simulate', { scenario, userId });
      const n = res?.notification || res?.data || res;
      if (n && n.id) {
        return {
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          channel: n.channel || 'IN_APP',
          cropName: n.crop_name,
          mandiName: n.mandi_name,
          priceChange: n.price_change,
          tradeId: n.trade_id,
          gatePassId: n.gate_pass_id,
          actionTab: n.action_tab,
          isRead: Boolean(n.is_read),
          createdAt: n.created_at || 'Just now',
        };
      }
    } catch {
      // Fallback local simulated notification
      const now = 'Just now';
      if (scenario === 'price_spike') {
        return {
          id: Date.now(),
          userId,
          title: '🔥 Live Mandi Alert: Indore Wheat Jumped +₹90/Qtl',
          message: 'Indore APMC modal rate increased to ₹2,940/Qtl (+₹90 over your baseline). High mill demand reported.',
          type: 'price_alert',
          channel: 'WHATSAPP',
          cropName: 'Wheat',
          mandiName: 'Indore APMC Mandi',
          priceChange: 90,
          actionTab: 'markets',
          isRead: false,
          createdAt: now,
        };
      }
    }
    return null;
  },

  /**
   * Mark notification as read
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(id: number): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      // Fallback
    }
  },

  /**
   * Batch mark all notifications as read
   * POST /api/notifications/read-all
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.post('/notifications/read-all');
    } catch {
      // Fallback
    }
  },

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(id: number): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch {
      // Fallback
    }
  },
};

export default notificationApi;
