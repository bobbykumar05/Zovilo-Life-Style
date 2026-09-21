import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Download,
  Eye,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateNocPDF } from '../../utils/pdfGenerator';
import { NOCDocumentView } from './NOCDocumentView';
import { NOC } from '../../types';

export const NOCList: React.FC = () => {
  const { nocs, setActiveView, settings, hasPermission } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingNocId, setViewingNocId] = useState<string | null>(null);

  const canGenerate = hasPermission('canGenerateNOC');

  const filteredNocs = nocs.filter(
    n =>
      n.nocNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.employeeEmpId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = (noc: NOC) => {
    generateNocPDF(noc, settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">No Objection Clearance (NOC) Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official legal clearance certificates for employee exits, certifying complete return of company hardware and data.
          </p>
        </div>

        {canGenerate ? (
          <button
            onClick={() => setActiveView('noc-create')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Issue Exit Clearance NOC
          </button>
        ) : (
          <div
            className="px-3.5 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
            title="Issuing clearance certificates is restricted by the Super Admin's permission matrix."
          >
            <Lock className="w-3.5 h-3.5" /> Issue NOC (Restricted)
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by NOC #, Employee, Department..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-emerald-600"
          />
        </div>

        <span className="text-xs text-slate-500">
          Total Clearances: <strong className="text-slate-800">{nocs.length}</strong>
        </span>
      </div>

      {/* NOC Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
            <tr>
              <th className="px-4 py-3">NOC Certificate #</th>
              <th className="px-4 py-3">Employee Name</th>
              <th className="px-4 py-3">Department & Designation</th>
              <th className="px-4 py-3">Exit Date</th>
              <th className="px-4 py-3">Signatory Authority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Official Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredNocs.map(noc => (
              <tr key={noc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>{noc.nocNumber}</span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{noc.employeeName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{noc.employeeEmpId}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="text-slate-800">{noc.departmentName}</div>
                  <div className="text-[10px] text-slate-400">{noc.designationTitle}</div>
                </td>

                <td className="px-4 py-3 text-slate-700">{noc.dateOfExit}</td>

                <td className="px-4 py-3">
                  <div className="text-slate-800 font-medium">{noc.authorizedPersonName}</div>
                  <div className="text-[10px] text-slate-400">{noc.authorizedPersonDesignation}</div>
                </td>

                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                    noc.isLocked
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    <Lock className="w-2.5 h-2.5" /> {noc.isLocked ? 'Finalized & Sealed' : noc.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setViewingNocId(noc.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      title="View Official Certificate"
                    >
                      <Eye className="w-3 h-3" /> View A4
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(noc)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* A4 Document Modal */}
      {viewingNocId && (
        <NOCDocumentView
          nocId={viewingNocId}
          onClose={() => setViewingNocId(null)}
        />
      )}
    </div>
  );
};
