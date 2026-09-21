import React from 'react';
import {
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  Users,
  FileCheck2,
  Plus,
  ArrowRightLeft,
  Undo2,
  FileText,
  Clock,
  TrendingUp,
  MapPin,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

export const DashboardOverview: React.FC = () => {
  const {
    assets,
    employees,
    nocs,
    returns,
    auditLogs,
    currentUser,
    setActiveView,
    setSelectedAssetId,
    setSelectedEmployeeId,
    setSelectedNocId
  } = useApp();

  // Compute Asset KPIs
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === 'Available').length;
  const assignedAssets = assets.filter(a => a.status === 'Assigned').length;
  const inRepairAssets = assets.filter(a => a.status === 'In Repair').length;
  const damagedAssets = assets.filter(a => a.status === 'Damaged').length;
  const lostAssets = assets.filter(a => a.status === 'Lost').length;
  const retiredAssets = assets.filter(a => a.status === 'Retired').length;

  // Compute Employee KPIs
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const resignedEmployees = employees.filter(e => e.status === 'Resigned' || e.status === 'Inactive').length;
  const employeesWithAssets = employees.filter(e =>
    assets.some(a => a.currentHolderId === e.id && a.status === 'Assigned')
  ).length;

  // NOC KPIs
  const totalNocs = nocs.length;
  const finalizedNocs = nocs.filter(n => n.status === 'Finalized').length;
  const pendingNocs = nocs.filter(n => n.status !== 'Finalized').length;

  // Resigned employees who still hold assets or need NOC
  const pendingExitHandovers = employees.filter(
    e => e.status === 'Resigned' && assets.some(a => a.currentHolderId === e.id)
  );

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Date */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Welcome back, {currentUser?.name || 'Administrator'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {currentUser?.role || 'SUPER_ADMIN'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {currentDateFormatted} • Corporate Asset Registry Live
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView('assets-create')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> New Asset
          </button>

          <button
            onClick={() => setActiveView('allocations-create')}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Allocate Assets
          </button>

          <button
            onClick={() => setActiveView('returns-create')}
            className="px-3 py-2 bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Undo2 className="w-3.5 h-3.5" /> Handover & Return
          </button>

          <button
            onClick={() => setActiveView('noc-create')}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" /> Generate NOC
          </button>
        </div>
      </div>

      {/* Asset KPI Cards Grid */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Asset Inventory Overview
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div
            onClick={() => setActiveView('assets')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="text-xs text-slate-500 font-medium">Total Assets</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalAssets}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">100% Tracked</div>
          </div>

          <div
            onClick={() => setActiveView('assets')}
            className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors"
          >
            <div className="text-xs text-emerald-800 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-1">{availableAssets}</div>
            <div className="text-[10px] text-emerald-700 mt-1 font-semibold">Ready to allocate</div>
          </div>

          <div
            onClick={() => setActiveView('assets')}
            className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/80 shadow-xs cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="text-xs text-blue-800 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Assigned
            </div>
            <div className="text-2xl font-black text-blue-950 mt-1">{assignedAssets}</div>
            <div className="text-[10px] text-blue-700 mt-1 font-semibold">Held by employees</div>
          </div>

          <div
            onClick={() => setActiveView('assets')}
            className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div className="text-xs text-amber-800 font-medium flex items-center gap-1">
              <Wrench className="w-3 h-3 text-amber-600" /> In Repair
            </div>
            <div className="text-2xl font-black text-amber-950 mt-1">{inRepairAssets}</div>
            <div className="text-[10px] text-amber-700 mt-1 font-semibold">Service center</div>
          </div>

          <div
            onClick={() => setActiveView('assets')}
            className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200/80 shadow-xs cursor-pointer hover:border-rose-400 transition-colors"
          >
            <div className="text-xs text-rose-800 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" /> Damaged
            </div>
            <div className="text-2xl font-black text-rose-950 mt-1">{damagedAssets}</div>
            <div className="text-[10px] text-rose-700 mt-1 font-semibold">Inspection log</div>
          </div>

          <div
            onClick={() => setActiveView('assets')}
            className="bg-red-50/50 p-3.5 rounded-xl border border-red-200/80 shadow-xs cursor-pointer hover:border-red-400 transition-colors"
          >
            <div className="text-xs text-red-800 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-600" /> Lost / Missing
            </div>
            <div className="text-2xl font-black text-red-950 mt-1">{lostAssets}</div>
            <div className="text-[10px] text-red-700 mt-1 font-semibold">FIR / Penalty</div>
          </div>

          <div
            onClick={() => setActiveView('assets')}
            className="bg-slate-100 p-3.5 rounded-xl border border-slate-300/80 shadow-xs cursor-pointer hover:border-slate-400 transition-colors"
          >
            <div className="text-xs text-slate-700 font-medium">Retired / Disposed</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{retiredAssets}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Scrapped</div>
          </div>
        </div>
      </div>

      {/* Employee & NOC Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveView('master-employees')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">Corporate Staff</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{totalEmployees} Employees</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">{activeEmployees} Active on payroll</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('allocations')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">Assigned Custodians</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{employeesWithAssets} Employees</div>
            <div className="text-xs text-blue-600 font-medium mt-0.5">Holding company equipment</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Laptop className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('noc')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">NOC Clearances</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{totalNocs} Issued</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">{finalizedNocs} Locked & Verified</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('returns')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">Handover Activity</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{returns.length} Handovers</div>
            <div className="text-xs text-teal-600 font-medium mt-0.5">Verified return records</div>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Undo2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Exits & Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Distribution & Allocation status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Allocations Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Assigned Equipment Snapshot</h3>
                <p className="text-xs text-slate-500">Recently allocated hardware and staff holders</p>
              </div>
              <button
                onClick={() => setActiveView('allocations')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all allocations →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {assets
                .filter(a => a.status === 'Assigned')
                .slice(0, 4)
                .map(ast => (
                  <div
                    key={ast.id}
                    onClick={() => {
                      setSelectedAssetId(ast.id);
                      setActiveView('assets');
                    }}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {ast.assetId.replace('JIA-', '')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{ast.name}</div>
                        <div className="text-[11px] text-slate-500">
                          SN: <span className="font-mono text-slate-700">{ast.serialNumber}</span> • {ast.categoryName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-900">
                        {ast.currentHolderName || 'Assigned'}
                      </div>
                      <div className="text-[11px] text-slate-500">{ast.locationName}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Asset Distribution by Category Bar Visualizer */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Asset Allocation by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Proportion of corporate hardware deployment</p>

            <div className="space-y-3">
              {[
                { name: 'IT Computing & Laptops', count: assets.filter(a => a.categoryId === 'cat_it').length, color: 'bg-blue-600' },
                { name: 'Mobile & Communication', count: assets.filter(a => a.categoryId === 'cat_telecom').length, color: 'bg-purple-600' },
                { name: 'Peripherals & Accessories', count: assets.filter(a => a.categoryId === 'cat_peripherals').length, color: 'bg-emerald-600' },
                { name: 'Surveillance & CCTV', count: assets.filter(a => a.categoryId === 'cat_security').length, color: 'bg-amber-600' },
                { name: 'Networking Equipment', count: assets.filter(a => a.categoryId === 'cat_network').length, color: 'bg-teal-600' }
              ].map(cat => {
                const percent = Math.round((cat.count / (totalAssets || 1)) * 100);
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {cat.count} items ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Handover Attention Alerts & Recent Audit Stream */}
        <div className="space-y-6">
          {/* Employee Exit Clearance Alert */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Exit Clearance Status
                </h3>
                <p className="text-[11px] text-slate-500">Separated personnel verification</p>
              </div>
            </div>

            {pendingExitHandovers.length > 0 ? (
              <div className="space-y-2.5">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <div className="font-semibold">Pending Asset Returns Detected:</div>
                  <div className="mt-1">
                    {pendingExitHandovers.map(e => (
                      <div key={e.id} className="mt-1 flex items-center justify-between">
                        <span>{e.name} ({e.empId})</span>
                        <button
                          onClick={() => {
                            setSelectedEmployeeId(e.id);
                            setActiveView('returns');
                          }}
                          className="font-bold underline hover:text-amber-950"
                        >
                          Process Return
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>All exited employees have completed asset handovers and hold verified clearance.</span>
              </div>
            )}

            {/* Quick NOC Checklist button */}
            <button
              onClick={() => setActiveView('noc')}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Open NOC Registry
            </button>
          </div>

          {/* Recent Audit Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Audit Trail Feed
              </h3>
              <button
                onClick={() => setActiveView('audit-logs')}
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                All Logs
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-3 py-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold text-slate-900">{log.action}</span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{log.details}</p>
                  <span className="text-[10px] text-slate-400 font-medium">By {log.userName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
