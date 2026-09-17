import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
  TrendingUp,
  FileText,
  Filter,
  Check,
  Bell,
} from 'lucide-react';
import { AdminSystemAlert, ADMIN_SYSTEM_ALERTS } from '../../data/adminData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const AdminSystemActivity: React.FC = () => {
  const [alerts, setAlerts] = useState<AdminSystemAlert[]>(ADMIN_SYSTEM_ALERTS);
  const [filterSeverity, setFilterSeverity] = useState('All');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'All' && a.severity !== filterSeverity) return false;
    return true;
  });

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="red" size="sm">Critical Anomaly</Badge>;
      case 'warning':
        return <Badge variant="amber" size="sm">Warning Trigger</Badge>;
      case 'success':
        return <Badge variant="emerald" size="sm">Verified Success</Badge>;
      default:
        return <Badge variant="blue" size="sm">System Notice</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm">Audit Stream</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            System Events & Market Volatility Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated anomaly detection, Agmarknet ingestion heartbeats, buyer KYC submissions, and bank escrow reconciliations.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
          {['All', 'warning', 'info', 'success'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {sev === 'All' ? 'All Events' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              alert.resolved
                ? 'bg-slate-50/60 border-slate-200 text-slate-700 opacity-80'
                : alert.severity === 'warning'
                ? 'bg-amber-50/30 border-amber-200 text-slate-900'
                : 'bg-white border-slate-200 shadow-xs text-slate-900'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {alert.id} • {alert.timestamp}
                </span>
                {getSeverityBadge(alert.severity)}
                {alert.entityRef && (
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {alert.entityRef}
                  </span>
                )}
                {alert.resolved && (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Resolved
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{alert.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              {!alert.resolved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolve(alert.id)}
                  icon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                  className="font-bold text-xs"
                >
                  Acknowledge
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
