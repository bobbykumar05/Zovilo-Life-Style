import React, { useState } from 'react';
import { Plus, X, Navigation, Laptop, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssetCondition } from '../../types';

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAssetModal: React.FC<CreateAssetModalProps> = ({ isOpen, onClose }) => {
  const { categories, assetTypes, locations, addAsset, settings, assets } = useApp();

  const nextSeq = settings.nextAssetSequence;
  const autoAssetId = `${settings.assetIdPrefix}${String(nextSeq).padStart(6, '0')}`;

  const [formData, setFormData] = useState({
    name: '',
    categoryId: categories[0]?.id || '',
    typeId: assetTypes[0]?.id || '',
    brand: 'Dell',
    model: '',
    serialNumber: '',
    imeiNumber: '',
    assetTag: `TAG-${Math.floor(1000 + Math.random() * 9000)}`,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 65000,
    warrantyExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
    condition: 'New' as AssetCondition,
    locationId: locations[0]?.id || '',
    description: '',
    remarks: '',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=80'
  });

  const [currentGeo, setCurrentGeo] = useState<{ lat?: number; lng?: number; capturedAt?: string }>({});
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser geolocation is not available.');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsDetecting(false);
        setCurrentGeo({
          lat: parseFloat(pos.coords.latitude.toFixed(4)),
          lng: parseFloat(pos.coords.longitude.toFixed(4)),
          capturedAt: new Date().toISOString()
        });
      },
      err => {
        setIsDetecting(false);
        alert(`Location permission: ${err.message}. You can manually proceed.`);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.serialNumber) {
      setError('Please provide Asset Name and Serial Number.');
      return;
    }

    // Unique Serial Check
    const duplicate = assets.find(
      a => a.serialNumber.toLowerCase() === formData.serialNumber.toLowerCase()
    );
    if (duplicate) {
      setError(`Serial Number '${formData.serialNumber}' is already registered to asset ${duplicate.name} (${duplicate.assetId}). Serial numbers must be unique.`);
      return;
    }

    const cat = categories.find(c => c.id === formData.categoryId);
    const type = assetTypes.find(t => t.id === formData.typeId);
    const loc = locations.find(l => l.id === formData.locationId);

    addAsset({
      ...formData,
      categoryName: cat?.name || 'General',
      typeName: type?.name || 'Standard',
      locationName: loc?.name || 'Main Office',
      currentLocationGeo: currentGeo.lat
        ? {
            name: loc?.name,
            address: loc?.address,
            lat: currentGeo.lat,
            lng: currentGeo.lng,
            capturedAt: currentGeo.capturedAt || new Date().toISOString()
          }
        : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-600" /> Register Corporate Asset
            </h3>
            <p className="text-xs text-slate-500">
              Create an asset master record with automatic sequential identifier and unique serial validation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Top Identifier Preview Banner */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-900 uppercase">Generated Asset ID:</span>
              <span className="px-2.5 py-1 bg-white rounded-md border border-blue-300 font-mono font-bold text-blue-700 text-xs">
                {autoAssetId}
              </span>
            </div>
            <div className="text-[11px] text-blue-700">
              Initial Status: <strong className="text-emerald-700">Available (Buffer)</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Name / Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dell Latitude 5440 Core i7"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Tag *</label>
              <input
                type="text"
                required
                value={formData.assetTag}
                onChange={e => setFormData({ ...formData, assetTag: e.target.value.toUpperCase() })}
                placeholder="TAG-DL-900"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Type *</label>
              <select
                value={formData.typeId}
                onChange={e => setFormData({ ...formData, typeId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {assetTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand / Manufacturer *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Dell, HP, Apple, Cisco..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model Name / Number *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                placeholder="Latitude 5440"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Serial Number * <span className="text-[10px] text-blue-600">(Must be Unique)</span>
              </label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="DL5440-9921-IN"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IMEI Number (Telecom/Mobile)</label>
              <input
                type="text"
                value={formData.imeiNumber}
                onChange={e => setFormData({ ...formData, imeiNumber: e.target.value })}
                placeholder="869234051829..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Price (INR)</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Warranty Expiry Date</label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={e => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Physical Condition</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Branch Depot *</label>
              <select
                value={formData.locationId}
                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.city})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location GPS Stamp */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">Registration Geolocation Tagging</span>
              <span className="text-[11px] text-slate-500">
                {currentGeo.lat ? `Lat: ${currentGeo.lat}, Lng: ${currentGeo.lng}` : 'Optional browser GPS coordinates'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold text-[11px] flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              {isDetecting ? 'Detecting...' : 'Use Current Location'}
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technical Specifications & Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Processor, RAM, Storage, Screen size, or accessories included..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Save to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
