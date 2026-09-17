import React, { useState } from 'react';
import { Sprout, X, Plus, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AVAILABLE_CROPS_LIST } from '../../data/locationData';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCrop: (cropName: string, quantityQuintals: string) => void;
  existingCrops: string[];
}

export const AddCropModal: React.FC<AddCropModalProps> = ({
  isOpen,
  onClose,
  onSaveCrop,
  existingCrops,
}) => {
  const [selectedCropName, setSelectedCropName] = useState<string>(
    AVAILABLE_CROPS_LIST[0].name
  );
  const [quantity, setQuantity] = useState('120');
  const [harvestDate, setHarvestDate] = useState('Ready for Immediate Sale');
  const [storageType, setStorageType] = useState('On-Farm Shaded Storage');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      onSaveCrop(selectedCropName, quantity);
      setSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add / Update Crop Inventory</h3>
            <p className="text-xs text-slate-500">Log new harvested produce for price matching and buyer alerts.</p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-900">Produce Added to Inventory!</h4>
            <p className="text-xs text-emerald-700">Your portfolio valuations and mandi alerts have been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Crop</label>
              <select
                value={selectedCropName}
                onChange={(e) => setSelectedCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {AVAILABLE_CROPS_LIST.map((crop) => (
                  <option key={crop.id} value={crop.name}>
                    {crop.icon} {crop.name} ({crop.season})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Quintals)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Status</label>
                <select
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Ready for Immediate Sale">Ready for Immediate Sale</option>
                  <option value="Harvesting in 7 Days">Harvesting in 7 Days</option>
                  <option value="Harvesting in 15-30 Days">Harvesting in 15-30 Days</option>
                  <option value="Stored in Warehouse">Stored in Warehouse</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Storage Condition</label>
              <select
                value={storageType}
                onChange={(e) => setStorageType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="On-Farm Shaded Storage">On-Farm Shaded Storage</option>
                <option value="WDRA Accredited Warehouse">WDRA Accredited Warehouse</option>
                <option value="Cold Storage Facility">Cold Storage Facility</option>
                <option value="Direct Field Loading">Direct Field Loading</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" size="md" onClick={onClose} className="w-1/3">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" className="w-2/3 font-bold">
                Save to My Crops
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
