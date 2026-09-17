import React, { useState, useEffect } from 'react';
import {
  Users,
  Sprout,
  Plus,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building,
  Package,
  Layers,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { FpoAggregatedLot } from '../../data/directMarketData';
import { farmerApi } from '../../api/farmerApi';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface FpoAggregationSectionProps {
  farmerDistrict?: string;
  farmerState?: string;
}

export const FpoAggregationSection: React.FC<FpoAggregationSectionProps> = ({
  farmerDistrict = 'Sehore',
  farmerState = 'Madhya Pradesh',
}) => {
  const [lots, setLots] = useState<FpoAggregatedLot[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [fpoName, setFpoName] = useState('Sehore Kisan Samriddhi FPO');
  const [cropName, setCropName] = useState('Wheat');
  const [variety, setVariety] = useState('Sharbati Lokwan Grade A');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [targetPrice, setTargetPrice] = useState('2950');
  const [myLotContribution, setMyLotContribution] = useState('80');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await farmerApi.getFpoLots();
      if (data && data.length > 0) {
        setLots(data);
      } else {
        // Fallback seed
        setLots([
          {
            id: 'FPO-LOT-2026-01',
            fpoName: 'Sehore Kisan Samriddhi Producer Co.',
            fpoDistrict: 'Sehore',
            fpoState: 'Madhya Pradesh',
            cropName: 'Wheat',
            variety: 'Sharbati Lokwan Grade A',
            qualityGrade: 'Grade A',
            totalAggregatedQuantity: 620,
            contributingFarmersCount: 8,
            targetPricePerQuintal: 2940,
            contributions: [
              { farmer_id: 1, farmer_name: 'Rajinder Singh', quantity: 120 },
              { farmer_id: 2, farmer_name: 'Devendra Gurjar', quantity: 150 },
              { farmer_id: 3, farmer_name: 'Mukesh Choudhary', quantity: 110 },
              { farmer_id: 4, farmer_name: 'Ramvilas Patel', quantity: 240 },
            ],
            status: 'OPEN_FOR_INSTITUTIONAL_BID',
            createdAt: '2026-08-20',
          },
          {
            id: 'FPO-LOT-2026-02',
            fpoName: 'Malwa Nimar Agro FPO Federation',
            fpoDistrict: 'Dewas',
            fpoState: 'Madhya Pradesh',
            cropName: 'Soybean',
            variety: 'Yellow Seed JS-9560',
            qualityGrade: 'Grade A',
            totalAggregatedQuantity: 480,
            contributingFarmersCount: 6,
            targetPricePerQuintal: 4820,
            contributions: [
              { farmer_id: 5, farmer_name: 'Kailash Verma', quantity: 180 },
              { farmer_id: 6, farmer_name: 'Shivpal Singh', quantity: 300 },
            ],
            status: 'OPEN_FOR_INSTITUTIONAL_BID',
            createdAt: '2026-08-21',
          },
        ]);
      }
    }
    loadData();
  }, []);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const qty = Number(myLotContribution) || 80;
      const res = await farmerApi.createFpoLot({
        fpoName,
        fpoDistrict: farmerDistrict,
        fpoState: farmerState,
        cropName,
        variety,
        qualityGrade,
        targetPricePerQuintal: Number(targetPrice) || 2950,
        contributions: [
          {
            farmer_id: 1,
            farmer_name: 'Rajinder Singh (You)',
            quantity: qty,
          },
        ],
      });

      if (res) {
        setLots((prev) => [res, ...prev]);
      }
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create FPO lot:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="sm">
              Collective Bargaining Power
            </Badge>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              FPO Lot Pooling
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight">
            Farmer Producer Organization (FPO) Collective Aggregation
          </h2>
          <p className="text-xs text-slate-500">
            Pool small harvest lots together to bid directly on bulk tenders (&gt;500 Quintals) for corporate food processors and export houses.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="font-bold shadow-md shadow-emerald-600/20 shrink-0"
        >
          Form Aggregated Lot
        </Button>
      </div>

      {/* Aggregated Lots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {lots.map((lot) => (
          <div
            key={lot.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-slate-300 transition-all"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-400 block">{lot.id}</span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{lot.fpoName}</h3>
                    <p className="text-xs text-slate-500">{lot.fpoDistrict}, {lot.fpoState}</p>
                  </div>
                </div>

                <Badge variant="purple" size="sm">
                  {lot.status === 'OPEN_FOR_INSTITUTIONAL_BID' ? 'Open for Bulk Tender' : 'Contracted'}
                </Badge>
              </div>

              {/* Lot Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Commodity</span>
                  <span className="font-bold text-slate-900">{lot.cropName}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{lot.qualityGrade}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Pooled Volume</span>
                  <span className="font-black text-slate-900 font-mono text-base">{lot.totalAggregatedQuantity}q</span>
                  <span className="text-[10px] text-slate-500 block">({lot.contributingFarmersCount} Farmers)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Target Price</span>
                  <span className="font-black text-emerald-700 font-mono text-base">₹{lot.targetPricePerQuintal}</span>
                  <span className="text-[10px] text-slate-400 block">/ Quintal</span>
                </div>
              </div>

              {/* Contributors Pill List */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600 block">Contributing Farmers in this Pool:</span>
                <div className="flex flex-wrap gap-1.5">
                  {lot.contributions.map((c, i) => (
                    <span key={i} className="text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 font-medium">
                      {c.farmer_name}: <strong>{c.quantity}q</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aggregated Escrow Payout
              </span>

              <button
                onClick={() => {
                  alert(`You joined ${lot.id}. Your listing lot has been linked to this bulk tender.`);
                }}
                className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold transition-colors cursor-pointer"
              >
                Join Lot Contribution
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE POOL MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Form Aggregated FPO Bulk Lot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Group harvest lots for high-value corporate tender negotiation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="p-6 space-y-4 text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">FPO Name</label>
                <input
                  type="text"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Mustard">Mustard</option>
                    <option value="Cotton">Cotton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Initial Contribution (q)</label>
                  <input
                    type="number"
                    min="10"
                    value={myLotContribution}
                    onChange={(e) => setMyLotContribution(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Price (₹/q)</label>
                  <input
                    type="number"
                    min="500"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting} className="font-bold shadow-xs">
                  Create Collective Lot
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
