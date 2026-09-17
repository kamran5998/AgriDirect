import React, { useState } from 'react';
import { Sprout, Building, Shield, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { UserRole } from '../../types';

interface RoleSelectPageProps {
  onSelectRole: (role: UserRole) => void;
  onNavigateBack: () => void;
  userName?: string;
}

export const RoleSelectPage: React.FC<RoleSelectPageProps> = ({
  onSelectRole,
  onNavigateBack,
  userName = 'Farmer',
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>('farmer');

  const roles = [
    {
      id: 'farmer' as UserRole,
      title: 'Farmer / Producer (FPO)',
      badge: 'Recommended Experience',
      badgeVariant: 'emerald' as const,
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      tagline: 'For individual cultivators, tenant farmers, and agricultural cooperatives.',
      features: [
        'Track live prices across 2,400+ APMC mandis',
        'Predictive price surge and hold-or-sell advisories',
        'Direct connection to KYC-verified institutional millers',
        'Daily morning mandi rates via SMS & WhatsApp',
      ],
      ctaText: 'Continue as Farmer & Setup Crop Profile',
      isPrimary: true,
    },
    {
      id: 'buyer' as UserRole,
      title: 'Institutional Buyer / Miller',
      badge: 'Procurement Portal',
      badgeVariant: 'blue' as const,
      icon: <Building className="w-8 h-8 text-blue-600" />,
      tagline: 'For flour millers, oil extractors, food processors, and supermarket chains.',
      features: [
        'Post bulk procurement purchase tenders',
        'Direct gate sourcing from verified farmers and FPOs',
        'Standardized assay quality & moisture testing parameters',
        'Automated digital invoice & 24-hr escrow clearing',
      ],
      ctaText: 'Continue to Buyer Procurement Desk',
      isPrimary: false,
    },
    {
      id: 'admin' as UserRole,
      title: 'APMC Market Admin / Analyst',
      badge: 'Regulatory Oversight',
      badgeVariant: 'purple' as const,
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      tagline: 'For market secretaries, state agriculture departments, and commodity analysts.',
      features: [
        'Monitor regional arrival volumes & modal price curves',
        'Detect artificial hoarding and price manipulation',
        'Verify APMC electronic weighbridge records',
        'Generate policy & crop economics research reports',
      ],
      ctaText: 'Access Administrative Terminal',
      isPrimary: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12">
      
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 mb-8 flex items-center justify-between">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registration</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>STEP 1 OF ONBOARDING</span>
        </div>
      </div>

      {/* Main Role Selection Layout */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            Account Setup
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-['Outfit',sans-serif]">
            Welcome, {userName}! Select Your Platform Role
          </h2>
          <p className="text-sm text-slate-600">
            Customize your market intelligence experience based on how you participate in the agricultural value chain.
          </p>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {roles.map((role) => {
            const isSelected = activeRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between relative border ${
                  isSelected
                    ? 'bg-white border-emerald-600 shadow-xl ring-2 ring-emerald-500/20 -translate-y-1'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Highlight Pin for Farmer */}
                {role.isPrimary && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Primary Platform Flow
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-2xs">
                      {role.icon}
                    </div>
                    <Badge variant={role.badgeVariant} size="sm">
                      {role.badge}
                    </Badge>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {role.tagline}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 mb-6">
                    {role.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection Radio Circle */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {isSelected ? 'Role Selected' : 'Click to select'}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="text-center max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onSelectRole(activeRole)}
            className="w-full shadow-lg shadow-emerald-600/25 text-base font-bold py-3.5"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            {activeRole === 'farmer'
              ? 'Start 5-Step Farmer Onboarding'
              : `Proceed to ${activeRole === 'buyer' ? 'Buyer Procurement' : 'Admin Terminal'}`}
          </Button>
          <p className="text-xs text-slate-400 mt-2">
            You can modify your participant preferences at any time in Account Settings.
          </p>
        </div>

      </div>

    </div>
  );
};
