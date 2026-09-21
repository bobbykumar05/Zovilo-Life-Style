import React, { useState } from 'react';
import {
  ArrowRightLeft,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateAllocationPDF } from '../../utils/pdfGenerator';
import { Allocation } from '../../types';

export const CreateAllocation: React.FC = () => {
  const {
    employees,
    assets,
    allocateAssets,
    setActiveView,
    selectedAssetId,
    setSelectedAssetId,
    settings
  } = useApp();

  const activeEmployees = employees.filter(e => e.status === 'Active');
  const availableAssets = assets.filter(a => a.status === 'Available');

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    activeEmployees[0]?.id || ''
  );
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    selectedAssetId ? [selectedAssetId] : []
  );
  const [purpose, setPurpose] = useState<string>('New Joining Equipment Issuance');
  const [allocatedDate, setAllocatedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [remarks, setRemarks] = useState('');
  const [acknowledgementChecked, setAcknowledgementChecked] = useState(true);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdVoucher, setCreatedVoucher] = useState<Allocation | null>(null);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  const handleToggleAsset = (id: string) => {
    if (selectedAssetIds.includes(id)) {
      setSelectedAssetIds(selectedAssetIds.filter(item => item !== id));
    } else {
      setSelectedAssetIds([...selectedAssetIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEmployeeId) {
      setError('Please select an active employee.');
      return;
    }
    if (selectedAssetIds.length === 0) {
      setError('Please select at least one available asset to allocate.');
      return;
    }
    if (!acknowledgementChecked) {
      setError('You must confirm employee acknowledgement terms before issuing allocation.');
      return;
    }

    const res = allocateAssets({
      employeeId: selectedEmployeeId,
      assetIds: selectedAssetIds,
      purpose,
      remarks: remarks || undefined,
      allocatedDate
    });

    if (res.success && res.allocation) {
      setCreatedVoucher(res.allocation);
      setIsSuccess(true);
      setSelectedAssetId(null);
    } else {
      setError(res.error || 'Failed to issue allocation voucher.');
    }
  };

  if (isSuccess && createdVoucher && selectedEmployee) {
    const allocatedAssetsList = assets.filter(a => createdVoucher.assetIds.includes(a.id));

    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Allocation Voucher Created</h2>
          <p className="text-xs text-slate-500 mt-1">
            Voucher <strong className="font-mono text-blue-600 font-bold">{createdVoucher.allocationId}</strong> has been successfully registered.
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Employee Custodian:</span>
              <strong className="text-slate-900">{createdVoucher.employeeName} ({createdVoucher.employeeEmpId})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="text-slate-800">{createdVoucher.departmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Allocated Assets:</span>
              <span className="font-mono font-bold text-blue-800">
                {allocatedAssetsList.map(a => a.name).join(', ')}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => generateAllocationPDF(createdVoucher, selectedEmployee, allocatedAssetsList, settings)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" /> Download Official Voucher PDF
            </button>
            <button
              onClick={() => setActiveView('allocations')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Return to Allocations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('allocations')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Allocations
        </button>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          NEW ALLOCATION VOUCHER
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" /> Allocate Corporate Assets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign company laptops, monitors, or phones to an active employee with digital acknowledgement.
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
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-blue-600">
              Step 1: Select Employee Custodian
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Active Employee *
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {activeEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.empId}) - {emp.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Issuance Purpose
                </label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="New Joining Equipment Issuance">New Joining Equipment Issuance</option>
                  <option value="Hardware Upgrade Swap">Hardware Upgrade Swap</option>
                  <option value="Temporary Project Assignment">Temporary Project Assignment</option>
                  <option value="Replacement for Damaged Unit">Replacement for Damaged Unit</option>
                </select>
              </div>
            </div>

            {/* Auto-filled Employee Details Card */}
            {selectedEmployee && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Department</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.departmentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Designation</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.designationTitle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Location</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.workLocationName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Contact</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Asset Multi-Select */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-blue-600">
                Step 2: Choose Available Assets ({availableAssets.length} Available in Buffer)
              </h3>
              <span className="text-slate-500 font-semibold">
                Selected: <strong className="text-blue-600">{selectedAssetIds.length}</strong> items
              </span>
            </div>

            {availableAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {availableAssets.map(asset => {
                  const isChecked = selectedAssetIds.includes(asset.id);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleToggleAsset(asset.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 rounded border-slate-300 text-blue-600"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{asset.name}</div>
                          <div className="text-[11px] text-slate-500">
                            SN: <span className="font-mono text-slate-700">{asset.serialNumber}</span> • {asset.brand}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Tag: {asset.assetTag} • {asset.locationName}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        {asset.assetId}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
                No assets currently available in the buffer. Register a new asset or process returns.
              </div>
            )}
          </div>

          {/* Section 3: Dates & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Allocation Issue Date *
              </label>
              <input
                type="date"
                required
                value={allocatedDate}
                onChange={e => setAllocatedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Allocation Notes / Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Accessories provided (bag, charger, mouse)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Terms & Digital Acknowledgement */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={acknowledgementChecked}
                onChange={e => setAcknowledgementChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600"
              />
              <span className="text-slate-700 leading-relaxed">
                <strong>Corporate Asset Policy Acknowledgement:</strong> I confirm that the listed equipment is in working condition. The employee agrees to handle company property responsibly and return all items upon resignation, transfer, or clearance.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveView('allocations')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedAssetIds.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-4 h-4" /> Issue Allocation Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
