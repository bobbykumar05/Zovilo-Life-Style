import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Filter,
  DollarSign,
  Laptop,
  Users,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { assets, employees, allocations, returns, nocs, settings, categories, departments } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<
    'register' | 'allocations' | 'returns' | 'maintenance' | 'capitalization'
  >('register');

  const currencySymbol = settings.currencySymbol || '₹';

  // Compute Total Capitalized Assets Value
  const totalAssetValue = assets.reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);
  const assignedAssetValue = assets
    .filter(a => a.status === 'Assigned')
    .reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);
  const bufferAssetValue = assets
    .filter(a => a.status === 'Available')
    .reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);

  // CSV Export for current report
  const handleExportCurrent = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `Jobulo_Report_${activeReportTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReportTab === 'register') {
      headers = ['Asset ID', 'Name', 'Category', 'Brand', 'Model', 'Serial Number', 'Status', 'Current Custodian', 'Location', 'Purchase Price (INR)'];
      rows = assets.map(a => [
        a.assetId,
        `"${a.name}"`,
        a.categoryName,
        a.brand,
        a.model,
        `"${a.serialNumber}"`,
        a.status,
        `"${a.currentHolderName || 'Buffer'}"`,
        a.locationName,
        a.purchasePrice
      ]);
    } else if (activeReportTab === 'allocations') {
      headers = ['Voucher No', 'Employee Name', 'Emp ID', 'Department', 'Allocated Date', 'Purpose', 'Assets Count', 'Status'];
      rows = allocations.map(al => [
        al.allocationId,
        `"${al.employeeName}"`,
        al.employeeEmpId,
        al.departmentName,
        al.allocatedDate,
        `"${al.purpose}"`,
        al.assetIds.length,
        al.status
      ]);
    } else if (activeReportTab === 'returns') {
      headers = ['Return Receipt', 'Employee Name', 'Emp ID', 'Return Date', 'Received By', 'Item Count'];
      rows = returns.map(r => [
        r.returnId,
        `"${r.employeeName}"`,
        r.employeeEmpId,
        r.returnDate,
        `"${r.receivedBy}"`,
        r.items.length
      ]);
    } else if (activeReportTab === 'maintenance') {
      headers = ['Asset ID', 'Name', 'Serial', 'Status', 'Condition', 'Location', 'Remarks'];
      rows = assets
        .filter(a => ['In Repair', 'Damaged', 'Lost'].includes(a.status))
        .map(a => [
          a.assetId,
          `"${a.name}"`,
          `"${a.serialNumber}"`,
          a.status,
          a.condition,
          a.locationName,
          `"${a.remarks || ''}"`
        ]);
    } else if (activeReportTab === 'capitalization') {
      headers = ['Category', 'Item Count', 'Total Purchase Value (INR)'];
      rows = categories.map(cat => {
        const catAssets = assets.filter(a => a.categoryId === cat.id);
        const sum = catAssets.reduce((s, a) => s + a.purchasePrice, 0);
        return [cat.name, catAssets.length, sum];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Corporate Assets Analytics & Registers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade inventory registers, capital investment capitalization, and exit clearance summaries.
          </p>
        </div>

        <button
          onClick={handleExportCurrent}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" /> Export Selected Register (CSV)
        </button>
      </div>

      {/* Capitalization Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Capitalized Inventory Valuation</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {currencySymbol} {totalAssetValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{assets.length} Tracked Hardware Assets</div>
        </div>

        <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-200/80 shadow-xs">
          <div className="text-xs text-blue-900 font-medium">Deployed Hardware Value (Assigned)</div>
          <div className="text-2xl font-black text-blue-950 mt-1">
            {currencySymbol} {assignedAssetValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-blue-700 mt-1">
            {Math.round((assignedAssetValue / (totalAssetValue || 1)) * 100)}% of total asset base in active field use
          </div>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="text-xs text-emerald-900 font-medium">Buffer Depot Inventory Value</div>
          <div className="text-2xl font-black text-emerald-950 mt-1">
            {currencySymbol} {bufferAssetValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Available across branch offices for immediate allocation
          </div>
        </div>
      </div>

      {/* Reports Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'register', label: '1. Fixed Asset Master Register' },
          { id: 'allocations', label: '2. Employee Allocation Register' },
          { id: 'returns', label: '3. Handover & Return Receipts' },
          { id: 'maintenance', label: '4. Repair & Damaged Tracker' },
          { id: 'capitalization', label: '5. Category Valuation Breakdown' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeReportTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT CONTENT 1: FIXED ASSET REGISTER */}
      {activeReportTab === 'register' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Complete Corporate Fixed Asset Register (FAR)
            </h3>
            <span className="text-xs text-slate-500 font-mono">{assets.length} Assets Registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Asset ID</th>
                  <th className="px-4 py-3">Asset Title</th>
                  <th className="px-4 py-3">Serial Number</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Custodian</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Value (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-bold text-blue-600">{a.assetId}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{a.name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{a.serialNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600">{a.categoryName}</td>
                    <td className="px-4 py-2.5 text-slate-800">{a.currentHolderName || 'Buffer'}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-slate-800">{a.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                      ₹{a.purchasePrice.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 2: ALLOCATIONS */}
      {activeReportTab === 'allocations' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Official Allocation Vouchers Ledger
            </h3>
            <span className="text-xs text-slate-500 font-mono">{allocations.length} Vouchers</span>
          </div>
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Voucher #</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Items Count</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map(al => (
                <tr key={al.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-600">{al.allocationId}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{al.employeeName}</td>
                  <td className="px-4 py-2.5 text-slate-600">{al.departmentName}</td>
                  <td className="px-4 py-2.5 text-slate-700">{al.allocatedDate}</td>
                  <td className="px-4 py-2.5 font-mono font-bold">{al.assetIds.length} Asset(s)</td>
                  <td className="px-4 py-2.5 text-slate-600">{al.purpose}</td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-700">{al.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT CONTENT 3: RETURNS */}
      {activeReportTab === 'returns' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Handover & Return Audit Records
            </h3>
            <span className="text-xs text-slate-500 font-mono">{returns.length} Receipts</span>
          </div>
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Return Date</th>
                <th className="px-4 py-3">Received By</th>
                <th className="px-4 py-3">Item Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returns.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono font-bold text-teal-700">{r.returnId}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{r.employeeName}</td>
                  <td className="px-4 py-2.5 text-slate-700">{r.returnDate}</td>
                  <td className="px-4 py-2.5 text-slate-800">{r.receivedBy}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px]">
                    {r.items.map(i => i.assetName).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT CONTENT 4: MAINTENANCE & REPAIR */}
      {activeReportTab === 'maintenance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Equipment In Repair, Damaged or Lost
            </h3>
            <span className="text-xs text-rose-600 font-semibold font-mono">
              {assets.filter(a => ['In Repair', 'Damaged', 'Lost'].includes(a.status)).length} Flagged Items
            </span>
          </div>
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Asset ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Serial #</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Location Depot</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets
                .filter(a => ['In Repair', 'Damaged', 'Lost'].includes(a.status))
                .map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-bold text-rose-700">{a.assetId}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{a.name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{a.serialNumber}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'Lost'
                          ? 'bg-red-100 text-red-800'
                          : a.status === 'Damaged'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-800">{a.condition}</td>
                    <td className="px-4 py-2.5 text-slate-700">{a.locationName}</td>
                    <td className="px-4 py-2.5 text-slate-500 italic">{a.remarks || 'No notes'}</td>
                  </tr>
                ))}
              {assets.filter(a => ['In Repair', 'Damaged', 'Lost'].includes(a.status)).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-xs">
                    All company hardware is operational and in good working condition.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT CONTENT 5: CATEGORY VALUATION BREAKDOWN */}
      {activeReportTab === 'capitalization' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Category Capitalization & Asset Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total: ₹{totalAssetValue.toLocaleString('en-IN')}
            </span>
          </div>
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Total Assets Count</th>
                <th className="px-4 py-3">Currently Assigned</th>
                <th className="px-4 py-3">Buffer Stock</th>
                <th className="px-4 py-3 text-right">Capital Value (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => {
                const catAssets = assets.filter(a => a.categoryId === cat.id);
                const assignedCount = catAssets.filter(a => a.status === 'Assigned').length;
                const bufferCount = catAssets.filter(a => a.status === 'Available').length;
                const sumValue = catAssets.reduce((acc, a) => acc + (a.purchasePrice || 0), 0);

                return (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{cat.name}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{catAssets.length}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{assignedCount}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{bufferCount}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ₹{sumValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
