import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateNocPDF } from '../../utils/pdfGenerator';

interface NOCDocumentViewProps {
  nocId: string;
  onClose: () => void;
}

export const NOCDocumentView: React.FC<NOCDocumentViewProps> = ({ nocId, onClose }) => {
  const { nocs, settings } = useApp();

  const noc = nocs.find(n => n.id === nocId);
  if (!noc) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateNocPDF(noc, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Top Bar (Non-printed) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Official No Objection Clearance Certificate</span>
            <span className="font-mono text-xs text-blue-400 bg-slate-800 px-2 py-0.5 rounded">
              {noc.nocNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print A4
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Certificate Paper Sheet */}
        <div className="p-8 sm:p-12 max-w-[210mm] mx-auto bg-white text-slate-900 font-sans print:p-0 print:m-0 print:shadow-none">
          {/* Header Section */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-lg">
                  {settings.brandName ? settings.brandName.split(' ').map(w => w[0]).join('').slice(0, 2) : 'ZI'}
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-wider text-slate-900 uppercase">
                    {settings.companyName}
                  </h1>
                  <span className="text-[10px] tracking-tight font-medium text-slate-600 block">
                    Corporate Identity: {settings.cin || 'U72900DL2021PTC384912'} • GSTIN: {settings.gstin || '07AABCJ9482F1Z8'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 max-w-md leading-relaxed">
                {settings.address}, {settings.city}, {settings.state} - {settings.pinCode}, India
                <br />
                Phone: {settings.phone} • Email: {settings.email}
              </p>
            </div>

            <div className="text-right">
              <div className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block">
                REF: {noc.nocNumber}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Handover Date: <strong className="text-slate-800">{noc.handoverDate}</strong>
              </div>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center my-6">
            <h2 className="text-lg font-black tracking-wider text-slate-900 uppercase underline decoration-2 underline-offset-4">
              NO OBJECTION & ASSET CLEARANCE CERTIFICATE
            </h2>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
              TO WHOMSOEVER IT MAY CONCERN
            </p>
          </div>

          {/* Main Legal Declaration Text */}
          <div className="text-xs text-slate-800 leading-relaxed space-y-4">
            <p>
              This is to formally certify that <strong>{noc.employeeName}</strong>, holding Employee ID{' '}
              <strong className="font-mono">{noc.employeeEmpId}</strong>, previously serving as{' '}
              <strong>{noc.designationTitle}</strong> in the <strong>{noc.departmentName}</strong> Department, has officially completed the employee separation protocol and exit clearance on <strong>{noc.dateOfExit}</strong>.
            </p>

            <p>
              The Human Resources, Information Technology Administration, and Operations departments have conducted a thorough audit of all corporate assets, digital infrastructure credentials, hardware peripherals, and physical tools originally issued to the employee.
            </p>
          </div>

          {/* Returned Hardware Inventory Table */}
          <div className="my-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Return of Corporate Equipment:
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-700">
                  <tr>
                    <th className="px-3 py-2">Asset ID</th>
                    <th className="px-3 py-2">Equipment Description</th>
                    <th className="px-3 py-2">Serial / IMEI Number</th>
                    <th className="px-3 py-2">Return Condition</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {noc.assetRecords && noc.assetRecords.length > 0 ? (
                    noc.assetRecords.map((ast, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-mono font-bold text-blue-800">{ast.assetTag}</td>
                        <td className="px-3 py-2 font-medium text-slate-900">{ast.assetName}</td>
                        <td className="px-3 py-2 font-mono text-slate-700">{ast.serialNumber}</td>
                        <td className="px-3 py-2">{ast.condition}</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">{ast.returnStatus}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-center text-slate-500 italic">
                        No hardware custody on record; clean non-asset holder clearance.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Checklist Verification Bullet Points */}
          <div className="my-5 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 mb-1.5 text-[11px] uppercase tracking-wide">
              Exit Verification Matrix:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Physical IT Hardware Returned & Cleared
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Corporate Email & VPN Accounts Terminated
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Identity Card & Security Access Keys Surrendered
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> No Financial Dues / Zero Tool Liabilities
              </div>
            </div>
          </div>

          {/* Legal Non-Liability Disclaimer */}
          <p className="text-[11px] text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3 my-4">
            "{noc.declarationText || `The company confirms that ${noc.employeeName} holds zero outstanding hardware liabilities or property dues toward Jobulo India as of the date of this certificate. We wish the candidate success in future professional endeavors.`}"
          </p>

          {/* Signatures & Corporate Seal Section */}
          <div className="mt-12 pt-6 border-t border-slate-300 flex items-end justify-between">
            {/* Left Signatory */}
            <div className="text-center w-48">
              <div className="font-serif italic text-base text-slate-800 font-bold h-10 flex items-end justify-center">
                {noc.authorizedPersonName}
              </div>
              <div className="border-t border-slate-900 pt-1 text-xs font-bold text-slate-900">
                {noc.authorizedPersonName}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-tight">
                {noc.authorizedPersonDesignation}
              </div>
              <div className="text-[9px] text-slate-400">IT Infrastructure Authority</div>
            </div>

            {/* Center: Official Seal & Stamp */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-900 flex flex-col items-center justify-center text-center p-1 relative rotate-[-8deg] bg-blue-50/20">
                <span className="text-[8px] font-black text-blue-900 uppercase tracking-tight">
                  {settings.brandName || 'ZOVILO INDIA'}
                </span>
                <ShieldCheck className="w-5 h-5 text-blue-800 my-0.5" />
                <span className="text-[7px] font-bold text-blue-900 uppercase tracking-widest">
                  OFFICIAL SEAL
                </span>
                <span className="text-[6px] font-mono text-blue-800">
                  {noc.finalizedAt || noc.createdAt.split('T')[0]}
                </span>
              </div>
            </div>

            {/* Right Signatory */}
            <div className="text-center w-48">
              <div className="font-serif italic text-base text-slate-800 font-bold h-10 flex items-end justify-center">
                Sneha Sharma
              </div>
              <div className="border-t border-slate-900 pt-1 text-xs font-bold text-slate-900">
                Sneha Sharma
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-tight">
                Head - People & Culture
              </div>
              <div className="text-[9px] text-slate-400">Human Resources Division</div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-10 pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
            <span>Generated via {settings.companyName || 'Zovilo India'} Corporate Assets Engine</span>
            <span>Document Hash: {noc.id}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
