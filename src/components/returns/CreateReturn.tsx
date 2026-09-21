import React, { useState } from 'react';
import {
  Undo2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssetCondition, AssetReturnRecord } from '../../types';

export const CreateReturn: React.FC = () => {
  const {
    employees,
    assets,
    locations,
    processReturnHandover,
    setActiveView,
    selectedEmployeeId,
    selectedAssetId,
    setSelectedEmployeeId,
    setSelectedAssetId,
    currentUser
  } = useApp();

  // Find employees who currently have assigned assets
  const employeesWithAssets = employees.filter(emp =>
    assets.some(a => a.currentHolderId === emp.id && a.status === 'Assigned')
  );

  const [currentEmpId, setCurrentEmpId] = useState<string>(
    selectedEmployeeId || (employeesWithAssets[0]?.id || '')
  );

  const selectedEmployee = employees.find(e => e.id === currentEmpId);

  // The assets currently assigned to the selected employee
  const assignedAssets = assets.filter(
    a => a.currentHolderId === currentEmpId && a.status === 'Assigned'
  );

  // Form states
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedBy, setReceivedBy] = useState(currentUser?.name || 'Rajesh Verma (IT VP)');
  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [overallRemarks, setOverallRemarks] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdReturnRecord, setCreatedReturnRecord] = useState<AssetReturnRecord | null>(null);

  // State for items being returned
  const [itemStates, setItemStates] = useState<{
    [assetId: string]: {
      selected: boolean;
      returnStatus: 'Returned' | 'Damaged' | 'Lost';
      condition: AssetCondition;
      inspectionAction: 'Available' | 'In Repair' | 'Damaged' | 'Retired';
      remarks: string;
    };
  }>({});

  React.useEffect(() => {
    const initial: any = {};
    assignedAssets.forEach(a => {
      initial[a.id] = {
        selected: selectedAssetId ? a.id === selectedAssetId : true,
        returnStatus: 'Returned',
        condition: a.condition || 'Good',
        inspectionAction: 'Available',
        remarks: ''
      };
    });
    setItemStates(initial);
  }, [currentEmpId, assets]);

  const handleToggleItem = (assetId: string) => {
    setItemStates(prev => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        selected: !prev[assetId]?.selected
      }
    }));
  };

  const handleConditionChange = (assetId: string, condition: AssetCondition) => {
    let action: 'Available' | 'In Repair' | 'Damaged' | 'Retired' = 'Available';
    let status: 'Returned' | 'Damaged' | 'Lost' = 'Returned';

    if (condition === 'Damaged' || condition === 'Non-Functional') {
      action = 'In Repair';
      status = 'Damaged';
    }

    setItemStates(prev => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        condition,
        inspectionAction: action,
        returnStatus: status
      }
    }));
  };

  const handleRemarksChange = (assetId: string, remarks: string) => {
    setItemStates(prev => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        remarks
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentEmpId) {
      setError('Please select an employee.');
      return;
    }

    const itemsToReturn = Object.entries(itemStates)
      .filter(([_, state]) => state.selected)
      .map(([assetId, state]) => ({
        assetId,
        returnStatus: state.returnStatus,
        condition: state.condition,
        inspectionAction: state.inspectionAction,
        remarks: state.remarks || undefined
      }));

    if (itemsToReturn.length === 0) {
      setError('Please select at least one asset to check in.');
      return;
    }

    const res = processReturnHandover({
      employeeId: currentEmpId,
      returnDate,
      receivedBy,
      locationId: locationId || (locations[0]?.id || ''),
      items: itemsToReturn,
      overallRemarks: overallRemarks || undefined
    });

    if (res.success && res.returnRecord) {
      setCreatedReturnRecord(res.returnRecord);
      setIsSuccess(true);
      setSelectedAssetId(null);
      setSelectedEmployeeId(null);
    } else {
      setError('Failed to process handover return.');
    }
  };

  if (isSuccess && createdReturnRecord) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Handover Processed & Accepted</h2>
          <p className="text-xs text-slate-500 mt-1">
            Return receipt <strong className="font-mono text-teal-700 font-bold">{createdReturnRecord.returnId}</strong> generated.
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Employee:</span>
              <strong className="text-slate-900">{createdReturnRecord.employeeName} ({createdReturnRecord.employeeEmpId})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="text-slate-800 font-semibold">{createdReturnRecord.departmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Received By:</span>
              <span className="text-slate-800">{createdReturnRecord.receivedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Returned Hardware:</span>
              <span className="font-mono text-teal-700 font-bold">
                {createdReturnRecord.items.map(i => i.assetName).join(', ')}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {createdReturnRecord.isFullHandover && (
              <button
                onClick={() => {
                  setSelectedEmployeeId(currentEmpId);
                  setActiveView('noc-create');
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors"
              >
                <FileCheck2 className="w-4 h-4" /> Proceed to Issue NOC Clearance
              </button>
            )}
            <button
              onClick={() => setActiveView('returns')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Back to Return Registry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('returns')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Return Registry
        </button>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          PROCESS ASSET HANDOVER
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-teal-700" /> Physical Handover & Check-In
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept returned equipment from employees, inspect physical condition, and release company asset custody.
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
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-teal-700">
              Step 1: Handing-Over Custodian
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Employee With Assigned Assets *
                </label>
                <select
                  value={currentEmpId}
                  onChange={e => setCurrentEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {employeesWithAssets.map(emp => {
                    const count = assets.filter(
                      a => a.currentHolderId === emp.id && a.status === 'Assigned'
                    ).length;
                    return (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.empId}) • {count} Asset{count > 1 ? 's' : ''} Held
                      </option>
                    );
                  })}
                  {employeesWithAssets.length === 0 && (
                    <option value="">No employees currently hold assigned assets</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Return Depot / Receiving Office *
                </label>
                <select
                  value={locationId}
                  onChange={e => setLocationId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Items to Inspect and Return */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-teal-700">
                Step 2: Inspect Hardware Items ({assignedAssets.length} Held)
              </h3>
              <span className="text-slate-500">
                Select items that are physically checked in.
              </span>
            </div>

            {assignedAssets.length > 0 ? (
              <div className="space-y-3">
                {assignedAssets.map(item => {
                  const state = itemStates[item.id] || {
                    selected: true,
                    condition: 'Good',
                    inspectionAction: 'Available',
                    remarks: ''
                  };
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        state.selected
                          ? 'border-teal-400 bg-teal-50/40'
                          : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-teal-100">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={state.selected}
                            onChange={() => handleToggleItem(item.id)}
                            className="mt-1 rounded border-slate-300 text-teal-600"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                            <div className="text-[11px] text-slate-500">
                              SN: <span className="font-mono text-slate-800 font-semibold">{item.serialNumber}</span> • Tag: {item.assetTag}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-xs bg-white px-2 py-1 rounded border border-teal-200 text-teal-800">
                          {item.assetId}
                        </span>
                      </div>

                      {state.selected && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-1">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Inspection Condition *
                            </label>
                            <select
                              value={state.condition}
                              onChange={e =>
                                handleConditionChange(item.id, e.target.value as AssetCondition)
                              }
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                            >
                              <option value="New">New / Mint</option>
                              <option value="Excellent">Excellent (No defects)</option>
                              <option value="Good">Good (Minor wear)</option>
                              <option value="Fair">Fair (Operational)</option>
                              <option value="Damaged">Damaged (Requires Repair / Billing)</option>
                              <option value="Non-Functional">Non-Functional</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Item Return Remarks / Check Notes
                            </label>
                            <input
                              type="text"
                              value={state.remarks}
                              onChange={e => handleRemarksChange(item.id, e.target.value)}
                              placeholder="Adapter returned, clean condition, no screen cracks..."
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
                Selected employee holds no assigned assets to return.
              </div>
            )}
          </div>

          {/* Section 3: Verification & Inspection Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Inspected & Received By *
              </label>
              <input
                type="text"
                required
                value={receivedBy}
                onChange={e => setReceivedBy(e.target.value)}
                placeholder="IT Officer / Regional Admin Name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                General Handover Observations
              </label>
              <input
                type="text"
                value={overallRemarks}
                onChange={e => setOverallRemarks(e.target.value)}
                placeholder="Hard drive wiped, security tokens revoked..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveView('returns')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignedAssets.length === 0}
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Undo2 className="w-4 h-4" /> Accept & Complete Handover
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
