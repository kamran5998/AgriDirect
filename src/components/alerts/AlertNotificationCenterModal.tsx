import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  MessageSquare,
  Smartphone,
  TrendingUp,
  Handshake,
  ShieldCheck,
  QrCode,
  CheckCheck,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight,
  Trash2,
  Volume2,
  VolumeX,
  ExternalLink,
  Zap,
  Info,
} from 'lucide-react';
import { Language } from '../farmer-app/types';
import { notificationApi, NotificationItem, AlertChannel } from '../../api/notificationApi';

interface AlertNotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigateTab?: (tab: string) => void;
  onOpenTrade?: (tradeId: number | string) => void;
  onOpenGatePass?: (gatePassId: string) => void;
  initialChannel?: 'WHATSAPP' | 'SMS';
}

export const AlertNotificationCenterModal: React.FC<AlertNotificationCenterModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigateTab,
  onOpenTrade,
  onOpenGatePass,
  initialChannel = 'WHATSAPP',
}) => {
  const [activeChannel, setActiveChannel] = useState<'WHATSAPP' | 'SMS'>(initialChannel);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  // Play audio chime for simulation
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleSimulate = async (scenario: 'price_spike' | 'buyer_offer' | 'payment_credit' | 'gate_pass') => {
    setSimulating(true);
    try {
      const item = await notificationApi.simulateAlert(scenario, 1);
      if (item) {
        setNotifications((prev) => [item, ...prev.filter((p) => p.id !== item.id)]);
        playAlertChime();
        if (item.channel === 'SMS' || item.channel === 'WHATSAPP') {
          setActiveChannel(item.channel);
        }
        setSimulationNotice(
          scenario === 'price_spike'
            ? '🔥 Price Surge Alert simulated and dispatched via WhatsApp/SMS!'
            : scenario === 'buyer_offer'
            ? '⚡ New Direct Purchase Offer alert simulated!'
            : scenario === 'payment_credit'
            ? '💰 Bank Escrow Credit settlement alert simulated!'
            : '🎟️ Electronic Gate Pass alert simulated!'
        );
        setTimeout(() => setSimulationNotice(null), 4000);
      }
    } catch {
      // Fallback
    } finally {
      setSimulating(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    await notificationApi.markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await notificationApi.markAllAsRead();
  };

  const handleDelete = async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await notificationApi.deleteNotification(id);
  };

  if (!isOpen) return null;

  // Filtered notifications
  const displayedNotifications = notifications.filter((n) => {
    if (filterType === 'price' && n.type !== 'price_alert') return false;
    if (filterType === 'offer' && n.type !== 'offer_alert' && n.type !== 'buyer_request') return false;
    if (filterType === 'payment' && n.type !== 'payment_alert') return false;
    if (filterType === 'gate_pass' && n.type !== 'gate_pass') return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-xs">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Simulated Price & Offer Alerts
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simulated real-time SMS & WhatsApp alerts for Mandi rates, buyer offers, and escrow clearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Disable Alert Chime' : 'Enable Alert Chime'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel View Toggle & Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Channel Selector */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveChannel('WHATSAPP')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChannel === 'WHATSAPP'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Format</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChannel('SMS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChannel === 'SMS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>SMS Feed Format</span>
            </button>
          </div>

          {/* Quick Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('price')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterType === 'price' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              📈 Price Alerts
            </button>
            <button
              type="button"
              onClick={() => setFilterType('offer')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterType === 'offer' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🤝 Offers
            </button>
            <button
              type="button"
              onClick={() => setFilterType('payment')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterType === 'payment' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              💳 Escrow
            </button>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read ({unreadCount})</span>
          </button>
        </div>

        {/* Simulation Action Bar */}
        <div className="px-4 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold">
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span>Live Trigger Simulator:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulate('price_spike')}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-amber-400 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>+₹90 Price Surge</span>
            </button>

            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulate('buyer_offer')}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-indigo-400 cursor-pointer"
            >
              <Handshake className="w-3.5 h-3.5 text-indigo-600" />
              <span>Direct Buyer Offer</span>
            </button>

            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulate('payment_credit')}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-emerald-400 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>₹4,08,800 Escrow Credit</span>
            </button>

            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulate('gate_pass')}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-purple-400 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-600" />
              <span>Gate Pass Issued</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert banner */}
        {simulationNotice && (
          <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-fadeIn shrink-0">
            <Sparkles className="w-4 h-4" />
            <span>{simulationNotice}</span>
          </div>
        )}

        {/* Main Feed Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100">
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Alerts Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Use the Live Trigger Simulator buttons above to generate simulated price surge or buyer offer notifications.
              </p>
            </div>
          ) : activeChannel === 'WHATSAPP' ? (
            /* WHATSAPP MOCKUP CHAT THREAD */
            <div className="max-w-xl mx-auto space-y-3">
              {/* WhatsApp Chat Header Bar */}
              <div className="bg-emerald-800 text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-sm border-2 border-emerald-400/40">
                    🌾
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black leading-tight">
                      AgriDirect Pulse • Verified Bot
                    </h4>
                    <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Official Price & Trade Dispatch Channel
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-700/60 px-2 py-0.5 rounded-full text-emerald-100 font-bold border border-emerald-600">
                  e-NAM Synced
                </span>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 pt-1">
                {displayedNotifications.map((notif) => {
                  const isPrice = notif.type === 'price_alert';
                  const isOffer = notif.type === 'offer_alert' || notif.type === 'buyer_request';
                  const isPayment = notif.type === 'payment_alert';
                  const isGatePass = notif.type === 'gate_pass';

                  return (
                    <div
                      key={notif.id}
                      className={`relative group bg-white rounded-2xl rounded-tl-xs p-4 shadow-sm border transition-all ${
                        !notif.isRead ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
                      }`}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                    >
                      {/* Message Content */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {isPrice ? '📈' : isOffer ? '🤝' : isPayment ? '💰' : isGatePass ? '🎟️' : '📢'}
                          </span>
                          <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                            {notif.title}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 font-medium">{notif.createdAt}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed whitespace-pre-line">
                        {notif.message}
                      </p>

                      {/* Interactive Buttons in WhatsApp Chat Bubble */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isOffer && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                                onClose();
                                if (onNavigateTab) onNavigateTab('buyers');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <span>Review Buyer Offer</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {isPrice && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                                onClose();
                                if (onNavigateTab) onNavigateTab('markets');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <span>View Mandi Rates</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}

                          {isPayment && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                                onClose();
                                if (onNavigateTab) onNavigateTab('buyers');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <span>Track Escrow Ledger</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {isGatePass && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                                onClose();
                                if (onOpenGatePass && notif.gatePassId) {
                                  onOpenGatePass(notif.gatePassId);
                                } else if (onNavigateTab) {
                                  onNavigateTab('buyers');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>Show QR Gate Pass</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-1 cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* SMS FEED MOCKUP FORMAT */
            <div className="max-w-xl mx-auto space-y-3">
              <div className="bg-slate-800 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span className="font-bold">Sender: VK-AGRIDIR (Govt APMC Service)</span>
                </div>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Carrier SMS</span>
              </div>

              {displayedNotifications.map((notif) => {
                const isPrice = notif.type === 'price_alert';
                const isOffer = notif.type === 'offer_alert' || notif.type === 'buyer_request';
                const isPayment = notif.type === 'payment_alert';
                const isGatePass = notif.type === 'gate_pass';

                return (
                  <div
                    key={notif.id}
                    className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                      !notif.isRead ? 'border-blue-300 ring-2 ring-blue-50' : 'border-slate-200'
                    }`}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-700">
                        {isPrice ? 'MANDI-ALERT' : isOffer ? 'TRADE-OFFER' : isPayment ? 'ESCROW-NEFT' : 'GATE-PASS'}
                      </span>
                      <span>{notif.createdAt}</span>
                    </div>

                    <h5 className="text-xs sm:text-sm font-black text-slate-900 mb-1">{notif.title}</h5>
                    <p className="text-xs text-slate-700 font-mono leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {notif.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif.id);
                          onClose();
                          if (isPrice && onNavigateTab) onNavigateTab('markets');
                          else if (onNavigateTab) onNavigateTab('buyers');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Details in App</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Delete SMS"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Alerts are generated in real-time based on live Mandi price swings and buyer proposals.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
          >
            Close Alert Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertNotificationCenterModal;
