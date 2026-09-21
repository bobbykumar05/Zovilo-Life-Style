import React, { useState } from 'react';
import {
  FileCheck2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Download,
  Printer,
  Laptop
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateNocPDF } from '../../utils/pdfGenerator';
import { NOCDocumentView } from './NOCDocumentView';
import { NOC } from '../../types';

export const CreateNOC: React.FC = () => {
  const {
    employees,
    assets,
    createNoc,
    finalizeNoc,
    updateNoc,
    setActiveView,
    selectedEmployeeId,
    setSelectedEmployeeId,
    currentUser,
    settings,
    hasPermission,
    isSuperAdmin
  } = useApp();

  const canGenerate = hasPermission('canGenerateNOC');
  const canFinalize = hasPermission('canFinalizeNOC');

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    selectedEmployeeId || (employees[0]?.id || '')
  );

  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [authorizedBy, setAuthorizedBy] = useState(currentUser?.name || 'Rajesh Verma (IT VP)');
  const [authorizedDesignation, setAuthorizedDesignation] = useState('Vice President - Technology & Infrastructure');
  const [remarks, setRemarks] = useState('All company assets, power accessories, and identity cards received in good order. No financial dues.');

  // Interactive Checklist states
  const [checklist, setChecklist] = useState({
    hardwareReturned: true,
    accountsTerminated: true,
    idCardSurrendered: true,
    financeCleared: true
  });

  const [error, setError] = useState('');
  const [createdNoc, setCreatedNoc] = useState<NOC | null>(null);
  const [showCertificateView, setShowCertificateView] = useState(false);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);

  // Check if employee still holds any assigned assets
  const unreturnedAssets = assets.filter(
    a => a.currentHolderId === selectedEmpId && a.status === 'Assigned'
  );

  const hasBlockingAssets = unreturnedAssets.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canGenerate) {
      setError('Access Denied: You do not hold permissions to generate exit clearance documents. Controls are managed exclusively by the Super Admin.');
      return;
    }

    if (!selectedEmpId) {
      setError('Please select an employee.');
      return;
    }

    if (hasBlockingAssets) {
      setError(
        `Cannot issue NOC Clearance. ${selectedEmployee?.name} still holds ${unreturnedAssets.length} active company asset(s). Process a handover first.`
      );
      return;
    }

    if (!checklist.hardwareReturned || !checklist.accountsTerminated || !checklist.idCardSurrendered || !checklist.financeCleared) {
      setError('All mandatory exit clearance checklist items must be verified and checked.');
      return;
    }

    const res = createNoc(selectedEmpId);
    if (!res.success || !res.noc) {
      setError(res.error || 'Failed to initialize NOC draft.');
      return;
    }

    // Update with exit date and remarks
    updateNoc(res.noc.id, {
      dateOfExit: exitDate,
      handoverDate: exitDate,
      notes: remarks
    });

    // If role has finalize permission, seal the certificate
    if (canFinalize) {
      const finalizeRes = finalizeNoc(res.noc.id, authorizedBy, authorizedDesignation);
      if (!finalizeRes.success) {
        setError(finalizeRes.error || 'Failed to seal and finalize NOC.');
        return;
      }

      setCreatedNoc({
        ...res.noc,
        dateOfExit: exitDate,
        handoverDate: exitDate,
        authorizedPersonName: authorizedBy,
        authorizedPersonDesignation: authorizedDesignation,
        isLocked: true,
        status: 'Finalized',
        notes: remarks
      });
    } else {
      // Created draft NOC
      setCreatedNoc({
        ...res.noc,
        dateOfExit: exitDate,
        handoverDate: exitDate,
        isLocked: false,
        status: 'Draft',
        notes: remarks
      });
    }
  };

  if (createdNoc) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Official NOC Clearance Issued</h2>
          <p className="text-xs text-slate-500 mt-1">
            Certificate <strong className="font-mono text-emerald-800 font-bold">{createdNoc.nocNumber}</strong> has been sealed and logged into the compliance archive.
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Exited Employee:</span>
              <strong className="text-slate-900">{createdNoc.employeeName} ({createdNoc.employeeEmpId})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="text-slate-800">{createdNoc.departmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Authorized Signatory:</span>
              <span className="text-slate-800 font-semibold">{createdNoc.authorizedPersonName}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowCertificateView(true)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" /> View & Print Official A4 Certificate
            </button>
            <button
              onClick={() => generateNocPDF(createdNoc, settings)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={() => setActiveView('noc')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Return to NOC Registry
            </button>
          </div>
        </div>

        {showCertificateView && (
          <NOCDocumentView
            nocId={createdNoc.id}
            onClose={() => setShowCertificateView(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('noc')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to NOC Registry
        </button>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          ISSUE FORMAL CLEARANCE
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-700" /> Employee Exit Clearance & NOC Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct mandatory compliance checks and generate official locked No Objection Certificate.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 text-xs">
          {/* Section 1: Employee Selection */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-emerald-700">
              Step 1: Separating Employee
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Employee *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.empId}) - {emp.departmentName} [{emp.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Exit Date *
                </label>
                <input
                  type="date"
                  required
                  value={exitDate}
                  onChange={e => setExitDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* If employee has unreturned assets: Blocking Banner */}
            {hasBlockingAssets && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Strict Clearance Block: {unreturnedAssets.length} Unreturned Corporate Assets Detected!</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Enterprise policy prevents generating an NOC while hardware custody is unresolved. You must check in the following equipment:
                </p>
                <div className="space-y-1.5 pt-1">
                  {unreturnedAssets.map(ast => (
                    <div key={ast.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-3.5 h-3.5 text-amber-700" />
                        <span className="font-bold text-slate-900">{ast.name}</span>
                        <span className="text-slate-500 font-mono text-[10px]">[{ast.assetId}]</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-700">SN: {ast.serialNumber}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployeeId(selectedEmpId);
                      setActiveView('returns-create');
                    }}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-md text-xs font-bold transition-colors"
                  >
                    Go to Handover & Process Asset Return →
                  </button>
                </div>
              </div>
            )}

            {!hasBlockingAssets && selectedEmployee && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Clean Custody Verified:</strong> Zero active assets assigned. Ready for clearance issuance.</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
                  Passed
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Mandatory Exit Checklist */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-emerald-700">
              Step 2: Exit Verification Checklist Matrix
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.hardwareReturned}
                  onChange={e => setChecklist({ ...checklist, hardwareReturned: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="text-slate-800 font-medium">
                  1. All Assigned Hardware & Accessories Returned to Regional Depot
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.accountsTerminated}
                  onChange={e => setChecklist({ ...checklist, accountsTerminated: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="text-slate-800 font-medium">
                  2. Enterprise Email, Google Workspace, and VPN Access Revoked
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.idCardSurrendered}
                  onChange={e => setChecklist({ ...checklist, idCardSurrendered: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="text-slate-800 font-medium">
                  3. Corporate ID Card, Office Keys, and Entry RFID Badge Surrendered
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.financeCleared}
                  onChange={e => setChecklist({ ...checklist, financeCleared: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="text-slate-800 font-medium">
                  4. Finance & Travel Expense Accounts Audited with Zero Outstanding Dues
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Authorizing Authority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Signatory Official *
              </label>
              <input
                type="text"
                required
                value={authorizedBy}
                onChange={e => setAuthorizedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Signatory Designation *
              </label>
              <input
                type="text"
                required
                value={authorizedDesignation}
                onChange={e => setAuthorizedDesignation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Legal Certification Remarks
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveView('noc')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasBlockingAssets || !canGenerate}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <FileCheck2 className="w-4 h-4" /> {canFinalize ? 'Issue & Seal NOC Certificate' : 'Issue Draft NOC Clearance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
