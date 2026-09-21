import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Download,
  Laptop
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateAllocationPDF } from '../../utils/pdfGenerator';
import { Allocation } from '../../types';

export const AllocationList: React.FC = () => {
  const { allocations, setActiveView, settings, employees, assets } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAllocations = allocations.filter(
    a =>
      a.allocationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = (alloc: Allocation) => {
    const emp = employees.find(e => e.id === alloc.employeeId);
    if (!emp) return;
    const allocatedAssets = assets.filter(a => alloc.assetIds.includes(a.id));
    generateAllocationPDF(alloc, emp, allocatedAssets, settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Asset Allocation Vouchers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal assignment records of corporate hardware to employees with signed digital acknowledgement vouchers.
          </p>
        </div>

        <button
          onClick={() => setActiveView('allocations-create')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Issue New Allocation
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Voucher ID, Employee, Department..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
          />
        </div>

        <span className="text-xs text-slate-500">
          Total Vouchers: <strong className="text-slate-800">{allocations.length}</strong>
        </span>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
            <tr>
              <th className="px-4 py-3">Voucher #</th>
              <th className="px-4 py-3">Assigned Employee</th>
              <th className="px-4 py-3">Allocated Hardware</th>
              <th className="px-4 py-3">Issuance Date</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Official Voucher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAllocations.map(item => {
              const allocatedAssets = assets.filter(a => item.assetIds.includes(a.id));

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-blue-600">{item.allocationId}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{item.employeeName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.employeeEmpId} • {item.departmentName}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {allocatedAssets.map(subItem => (
                        <div key={subItem.id} className="flex items-center gap-1 text-[11px]">
                          <Laptop className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-slate-800">{subItem.name}</span>
                          <span className="text-slate-400 font-mono">[{subItem.serialNumber}]</span>
                        </div>
                      ))}
                      {allocatedAssets.length === 0 && (
                        <span className="text-slate-400 italic font-mono text-[11px]">
                          {item.assetIds.length} Asset ID(s)
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    <div>{item.allocatedDate}</div>
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {item.purpose}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'Active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownloadPDF(item)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Voucher PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
