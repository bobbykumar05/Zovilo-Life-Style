import React, { useState } from 'react';
import {
  Laptop,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  ArrowRightLeft,
  Undo2,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CreateAssetModal } from './CreateAssetModal';
import { AssetDetailModal } from './AssetDetailModal';

export const AssetList: React.FC = () => {
  const {
    assets,
    categories,
    locations,
    deleteAsset,
    selectedAssetId,
    setSelectedAssetId,
    setActiveView
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailModalAssetId, setDetailModalAssetId] = useState<string | null>(selectedAssetId || null);

  // Filter logic
  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.currentHolderName && asset.currentHolderName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || asset.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || asset.status === selectedStatus;
    const matchesLocation = selectedLocation === 'ALL' || asset.locationId === selectedLocation;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Asset ID', 'Name', 'Category', 'Brand', 'Model', 'Serial Number', 'Status', 'Current Custodian', 'Location', 'Purchase Price'];
    const rows = filteredAssets.map(a => [
      a.assetId,
      `"${a.name}"`,
      a.categoryName,
      a.brand,
      a.model,
      `"${a.serialNumber}"`,
      a.status,
      `"${a.currentHolderName || 'None'}"`,
      a.locationName,
      a.purchasePrice
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jobulo_India_Assets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Company Asset Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of laptops, smartphones, CCTV, and equipment with physical serial tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Register Asset
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Asset ID, Serial, Name, Holder..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 text-xs"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500 bg-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available (Buffer)</option>
              <option value="Assigned">Assigned</option>
              <option value="In Repair">In Repair</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500 bg-white"
            >
              <option value="ALL">All Branch Locations</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.city})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Count & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Displaying <strong className="text-slate-900">{filteredAssets.length}</strong> of {assets.length} assets
          </span>
          {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedLocation !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setSelectedLocation('ALL');
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Asset ID & Title</th>
                <th className="px-4 py-3">Category & Type</th>
                <th className="px-4 py-3">Serial & Tag</th>
                <th className="px-4 py-3">Current Custodian</th>
                <th className="px-4 py-3">Location Depot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map(ast => (
                <tr key={ast.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          onClick={() => setDetailModalAssetId(ast.id)}
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                        >
                          {ast.name}
                        </div>
                        <div className="font-mono text-[10px] text-blue-600 font-bold">
                          {ast.assetId}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{ast.categoryName}</div>
                    <div className="text-[10px] text-slate-400">{ast.brand} • {ast.model}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-mono text-slate-800 font-semibold">{ast.serialNumber}</div>
                    <div className="text-[10px] font-mono text-slate-400">{ast.assetTag}</div>
                  </td>

                  <td className="px-4 py-3">
                    {ast.currentHolderName ? (
                      <div>
                        <div className="font-semibold text-slate-900">{ast.currentHolderName}</div>
                        <div className="text-[10px] text-slate-400">Assigned</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Unassigned (Buffer)</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-700">{ast.locationName}</div>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={ast.status} size="sm" />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDetailModalAssetId(ast.id)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                        title="View Asset Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {ast.status === 'Available' && (
                        <button
                          onClick={() => {
                            setSelectedAssetId(ast.id);
                            setActiveView('allocations-create');
                          }}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-bold transition-colors"
                          title="Allocate to Employee"
                        >
                          Allocate
                        </button>
                      )}

                      {ast.status === 'Assigned' && (
                        <button
                          onClick={() => {
                            setSelectedAssetId(ast.id);
                            setActiveView('returns-create');
                          }}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded text-[10px] font-bold transition-colors"
                          title="Return / Handover"
                        >
                          Handover
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Remove asset ${ast.name} (${ast.assetId})?`)) {
                            deleteAsset(ast.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialogs */}
      <CreateAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <AssetDetailModal
        assetId={detailModalAssetId}
        onClose={() => {
          setDetailModalAssetId(null);
          setSelectedAssetId(null);
        }}
        onOpenAllocate={ast => {
          setSelectedAssetId(ast.id);
          setActiveView('allocations-create');
        }}
        onOpenReturn={ast => {
          setSelectedAssetId(ast.id);
          setActiveView('returns-create');
        }}
      />
    </div>
  );
};
