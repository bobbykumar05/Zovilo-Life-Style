import React, { useState } from 'react';
import {
  Undo2,
  Plus,
  Search,
  Laptop,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReturnList: React.FC = () => {
  const { returns, setActiveView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReturns = returns.filter(
    r =>
      r.returnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.receivedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Handover & Asset Return Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Documented asset handovers, physical condition inspections, and hardware check-ins into company inventory.
          </p>
        </div>

        <button
          onClick={() => setActiveView('returns-create')}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Process Handover / Return
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
            placeholder="Search by Return ID, Employee, Receiver..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-teal-600"
          />
        </div>

        <span className="text-xs text-slate-500">
          Completed Handovers: <strong className="text-slate-800">{returns.length}</strong>
        </span>
      </div>

      {/* Return Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
            <tr>
              <th className="px-4 py-3">Return Receipt #</th>
              <th className="px-4 py-3">Handing-Over Employee</th>
              <th className="px-4 py-3">Returned Assets</th>
              <th className="px-4 py-3">Return Date</th>
              <th className="px-4 py-3">Receiving Location</th>
              <th className="px-4 py-3">Received By</th>
              <th className="px-4 py-3 text-right">Clearance Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReturns.map(ret => (
              <tr key={ret.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-teal-700">
                  {ret.returnId}
                </td>

                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{ret.employeeName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{ret.employeeEmpId} • {ret.departmentName}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {ret.items.map(item => (
                      <div key={item.assetId} className="text-[11px] flex items-center gap-1.5">
                        <Laptop className="w-3 h-3 text-slate-400" />
                        <span className="font-medium text-slate-800">{item.assetName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          item.condition === 'Damaged' || item.returnStatus === 'Damaged'
                            ? 'bg-rose-100 text-rose-700'
                            : item.returnStatus === 'Lost'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.condition}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>

                <td className="px-4 py-3 text-slate-700">{ret.returnDate}</td>

                <td className="px-4 py-3 text-slate-700">{ret.locationName}</td>

                <td className="px-4 py-3 font-medium text-slate-800">{ret.receivedBy}</td>

                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ret.isFullHandover
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ret.isFullHandover ? 'Full Handover Cleared' : 'Partial Return'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
