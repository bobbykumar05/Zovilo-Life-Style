import React, { useState } from 'react';
import {
  X,
  Laptop,
  Calendar,
  DollarSign,
  Shield,
  MapPin,
  Clock,
  History,
  Barcode,
  ArrowRightLeft,
  Undo2,
  Wrench,
  CheckCircle2,
  ExternalLink,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface AssetDetailModalProps {
  assetId: string | null;
  onClose: () => void;
  onOpenAllocate: (asset: Asset) => void;
  onOpenReturn: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  assetId,
  onClose,
  onOpenAllocate,
  onOpenReturn
}) => {
  const { assets, settings, lifecycles } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'lifecycle' | 'history' | 'barcode'>('overview');

  const asset = assets.find(a => a.id === assetId);
  if (!asset) return null;

  const assetLifecycles = lifecycles.filter(l => l.assetId === asset.id);

  // Calculate Warranty Status
  const warrantyDate = new Date(asset.warrantyExpiry);
  const isWarrantyExpired = warrantyDate < new Date();
  const daysUntilWarranty = Math.ceil(
    (warrantyDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0 border border-blue-200">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{asset.name}</h2>
                <StatusBadge status={asset.status} size="sm" />
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="font-mono font-bold text-blue-600">{asset.assetId}</span>
                <span>•</span>
                <span>SN: <strong className="font-mono text-slate-700">{asset.serialNumber}</strong></span>
                <span>•</span>
                <span>{asset.categoryName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="mt-3.5 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-700">
            Current Custodian: <strong className="text-blue-700">{asset.currentHolderName || 'None (Buffer Depot)'}</strong>
          </div>

          <div className="flex items-center gap-2">
            {asset.status === 'Available' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAllocate(asset);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Allocate to Employee
              </button>
            )}

            {asset.status === 'Assigned' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReturn(asset);
                }}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Undo2 className="w-3.5 h-3.5" /> Process Handover / Return
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="mt-4 flex border-b border-slate-200 text-xs">
          {[
            { id: 'overview', label: 'Specification & Overview' },
            { id: 'lifecycle', label: 'Lifecycle State Flow' },
            { id: 'history', label: `Custody Ledger (${assetLifecycles.length})` },
            { id: 'barcode', label: 'Barcode & Tag' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Brand & Model</span>
                <span className="font-semibold text-slate-900 text-sm">{asset.brand} {asset.model}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Asset Tag</span>
                <span className="font-mono font-bold text-slate-900">{asset.assetTag}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Condition</span>
                <span className="font-semibold text-slate-900">{asset.condition}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Purchase Cost</span>
                <span className="font-bold text-slate-900 text-sm">
                  {settings.currencySymbol} {asset.purchasePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Capitalized: {asset.purchaseDate}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Warranty Status</span>
                <div className="font-semibold mt-0.5">
                  {isWarrantyExpired ? (
                    <span className="text-rose-600 font-bold">Expired</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">Active ({daysUntilWarranty}d left)</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block">Expires: {asset.warrantyExpiry}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Location</span>
                <span className="font-semibold text-slate-900">{asset.locationName}</span>
                {asset.currentLocationGeo && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${asset.currentLocationGeo.lat},${asset.currentLocationGeo.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    View Map Coordinates <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>

            {asset.imeiNumber && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950 text-xs">Telecom IMEI Identifier</span>
                  <span className="text-[11px] text-purple-700 block mt-0.5">Cellular Device Network ID</span>
                </div>
                <span className="font-mono font-bold text-purple-900 text-sm">{asset.imeiNumber}</span>
              </div>
            )}

            {asset.description && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Specifications & Peripherals</span>
                <p className="text-slate-700 leading-relaxed">{asset.description}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIFECYCLE STATE FLOW */}
        {activeTab === 'lifecycle' && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-1">Enterprise Asset State Transitions</h4>
            <p className="text-[11px] text-slate-500 mb-6">Visual governance track for this specific hardware item.</p>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div className="text-xs font-bold text-slate-900">Procurement & Tag Registration</div>
                <div className="text-[11px] text-slate-500">Asset purchased and registered with ID {asset.assetId} on {asset.purchaseDate}.</div>
              </div>

              <div className="relative">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${asset.status === 'Available' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-emerald-600 text-white'}`}>
                  ✓
                </div>
                <div className="text-xs font-bold text-slate-900">Buffer Inventory Stock</div>
                <div className="text-[11px] text-slate-500">Asset received in {asset.locationName} depot and prepared for allocation.</div>
              </div>

              <div className="relative">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${asset.status === 'Assigned' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : (assetLifecycles.length ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600')}`}>
                  {asset.status === 'Assigned' || assetLifecycles.length ? '✓' : '3'}
                </div>
                <div className="text-xs font-bold text-slate-900">Active Employee Custody</div>
                <div className="text-[11px] text-slate-500">
                  {asset.currentHolderName ? `Presently allocated to ${asset.currentHolderName}.` : 'Held in buffer awaiting assignment.'}
                </div>
              </div>

              <div className="relative">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${asset.status === 'In Repair' ? 'bg-amber-600 text-white ring-4 ring-amber-100' : (asset.status === 'Retired' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-500')}`}>
                  4
                </div>
                <div className="text-xs font-bold text-slate-900">Handover, Audit or Disposal</div>
                <div className="text-[11px] text-slate-500">Inspection on return, firmware wipe, and re-allocation or disposal certificate.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTODY HISTORY TIMELINE ("Who had this laptop before Harsh?") */}
        {activeTab === 'history' && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80 text-xs text-blue-900">
              <strong>Historical Chain of Custody:</strong> Every employee handover, allocation, inspection, and return is permanently recorded.
            </div>

            {assetLifecycles.length > 0 ? (
              <div className="space-y-3">
                {assetLifecycles.map((entry) => (
                  <div key={entry.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                          {entry.employeeName ? entry.employeeName[0] : 'S'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">{entry.employeeName || 'Depot Inventory'}</span>
                          <span className="text-slate-400 font-mono ml-2">[{entry.action}]</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {entry.action}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Action Timestamp</span>
                        <strong>{new Date(entry.timestamp).toLocaleDateString('en-IN')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Performed By</span>
                        <strong>{entry.performedBy}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Condition Recorded</span>
                        <strong>{entry.condition}</strong>
                      </div>
                    </div>

                    {entry.remarks && (
                      <div className="mt-2 text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                        "{entry.remarks}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No past allocation history recorded for this asset yet.
              </div>
            )}
          </div>
        )}

        
        {activeTab === 'barcode' && (
          <div className="mt-4 space-y-4">
            <div className="p-6 bg-slate-100 rounded-2xl border border-slate-300 flex flex-col items-center justify-center">
              {/* Asset Sticker Card */}
              <div className="w-80 bg-white p-4 rounded-xl border-2 border-slate-900 shadow-md text-slate-900">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <span className="font-extrabold text-xs tracking-wider">{settings.brandName || 'ZOVILO INDIA'}</span>
                  <span className="text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">
                    PROPERTY
                  </span>
                </div>

                <div className="py-3 text-center">
                  <div className="font-mono text-xl font-black tracking-widest">{asset.assetId}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-tight mt-0.5">
                    {asset.name} • {asset.brand}
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="py-2 flex flex-col items-center">
                  <div className="h-10 flex items-center gap-[2px]">
                    {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-950 h-full"
                        style={{ width: `${w * 2}px` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] font-semibold tracking-widest mt-1">
                    * {asset.serialNumber} *
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                  <span>Tag: {asset.assetTag}</span>
                  <span>{settings.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Physical Tag
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
