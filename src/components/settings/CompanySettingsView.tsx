import React, { useState } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  Shield,
  Sliders,
  Lock,
  Crown,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Users,
  Check,
  X,
  Mail,
  Send,
  AlertCircle,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, RolePermissions } from '../../types';
import { SupabaseBackendTab } from './SupabaseBackendTab';

export const CompanySettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    currentUser,
    isSuperAdmin,
    transferSuperAdmin,
    updateRolePermissions,
    employees,
    setActiveView
  } = useApp();

  const [activeTab, setActiveTab] = useState<'governance' | 'company' | 'assets' | 'smtp' | 'supabase'>('governance');
  const [formData, setFormData] = useState({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Transfer Super Admin Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [customTransferEmail, setCustomTransferEmail] = useState('');
  const [customTransferName, setCustomTransferName] = useState('');
  const [transferConfirmationText, setTransferConfirmationText] = useState('');
  const [transferError, setTransferError] = useState('');

  // Role permissions editing state
  const [localPermissions, setLocalPermissions] = useState(() => ({
    ADMIN: { ...settings.rolePermissions.ADMIN },
    MANAGER: { ...settings.rolePermissions.MANAGER },
    STAFF: { ...settings.rolePermissions.STAFF },
    VIEWER: { ...settings.rolePermissions.VIEWER }
  }));

  const handleSaveCorporateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveMessage('Corporate configurations successfully updated and saved to persistent store.');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleSavePermissions = () => {
    (['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'] as const).forEach(role => {
      updateRolePermissions(role, localPermissions[role]);
    });
    setSaveMessage('Role permission matrix and security access controls successfully updated by Super Admin.');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleTogglePermission = (role: Exclude<UserRole, 'SUPER_ADMIN'>, key: keyof RolePermissions) => {
    setLocalPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role][key]
      }
    }));
  };

  const applyPreset = (presetType: 'standard' | 'strict' | 'relaxed') => {
    if (presetType === 'standard') {
      setLocalPermissions({
        ADMIN: {
          canManageMasterData: true,
          canRegisterAssets: true,
          canAllocateAssets: true,
          canProcessReturns: true,
          canGenerateNOC: true,
          canFinalizeNOC: true,
          canDeleteRecords: false,
          canExportReports: true,
          canViewFinancials: true
        },
        MANAGER: {
          canManageMasterData: false,
          canRegisterAssets: true,
          canAllocateAssets: true,
          canProcessReturns: true,
          canGenerateNOC: true,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: true,
          canViewFinancials: true
        },
        STAFF: {
          canManageMasterData: false,
          canRegisterAssets: false,
          canAllocateAssets: false,
          canProcessReturns: true,
          canGenerateNOC: false,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: false,
          canViewFinancials: false
        },
        VIEWER: {
          canManageMasterData: false,
          canRegisterAssets: false,
          canAllocateAssets: false,
          canProcessReturns: false,
          canGenerateNOC: false,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: false,
          canViewFinancials: false
        }
      });
    } else if (presetType === 'strict') {
      setLocalPermissions({
        ADMIN: {
          canManageMasterData: true,
          canRegisterAssets: true,
          canAllocateAssets: true,
          canProcessReturns: true,
          canGenerateNOC: true,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: true,
          canViewFinancials: false
        },
        MANAGER: {
          canManageMasterData: false,
          canRegisterAssets: true,
          canAllocateAssets: false,
          canProcessReturns: true,
          canGenerateNOC: false,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: false,
          canViewFinancials: false
        },
        STAFF: {
          canManageMasterData: false,
          canRegisterAssets: false,
          canAllocateAssets: false,
          canProcessReturns: true,
          canGenerateNOC: false,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: false,
          canViewFinancials: false
        },
        VIEWER: {
          canManageMasterData: false,
          canRegisterAssets: false,
          canAllocateAssets: false,
          canProcessReturns: false,
          canGenerateNOC: false,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: false,
          canViewFinancials: false
        }
      });
    } else if (presetType === 'relaxed') {
      setLocalPermissions({
        ADMIN: {
          canManageMasterData: true,
          canRegisterAssets: true,
          canAllocateAssets: true,
          canProcessReturns: true,
          canGenerateNOC: true,
          canFinalizeNOC: true,
          canDeleteRecords: true,
          canExportReports: true,
          canViewFinancials: true
        },
        MANAGER: {
          canManageMasterData: true,
          canRegisterAssets: true,
          canAllocateAssets: true,
          canProcessReturns: true,
          canGenerateNOC: true,
          canFinalizeNOC: true,
          canDeleteRecords: false,
          canExportReports: true,
          canViewFinancials: true
        },
        STAFF: {
          canManageMasterData: false,
          canRegisterAssets: true,
          canAllocateAssets: false,
          canProcessReturns: true,
          canGenerateNOC: false,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: false,
          canViewFinancials: false
        },
        VIEWER: {
          canManageMasterData: false,
          canRegisterAssets: false,
          canAllocateAssets: false,
          canProcessReturns: false,
          canGenerateNOC: false,
          canFinalizeNOC: false,
          canDeleteRecords: false,
          canExportReports: true,
          canViewFinancials: false
        }
      });
    }
  };

  const handleExecuteTransfer = () => {
    setTransferError('');
    let targetName = customTransferName.trim();
    let targetEmail = customTransferEmail.trim();

    if (selectedRecipientId) {
      const emp = employees.find(e => e.id === selectedRecipientId);
      if (emp) {
        targetName = emp.name;
        targetEmail = emp.email;
      }
    }

    if (!targetEmail || !targetName) {
      setTransferError('Please select a recipient employee or provide valid name and corporate email.');
      return;
    }

    if (targetEmail.toLowerCase() === settings.superAdminEmail.toLowerCase()) {
      setTransferError('The selected account is already the current Super Admin.');
      return;
    }

    if (transferConfirmationText.toUpperCase() !== 'TRANSFER') {
      setTransferError('Please type TRANSFER in capital letters to confirm this action.');
      return;
    }

    const success = transferSuperAdmin(targetEmail, targetName);
    if (success) {
      setIsTransferModalOpen(false);
      setTransferConfirmationText('');
      setSelectedRecipientId('');
      setCustomTransferEmail('');
      setCustomTransferName('');
    }
  };

  // -------------------------------------------------------------
  // VIEW: Access Restricted (For Non-Super Admins)
  // -------------------------------------------------------------
  if (!isSuperAdmin) {
    const currentRole = (currentUser?.role || 'VIEWER') as Exclude<UserRole, 'SUPER_ADMIN'>;
    const currentPerms = settings.rolePermissions?.[currentRole];

    const permissionLabels: { key: keyof RolePermissions; label: string; desc: string }[] = [
      { key: 'canManageMasterData', label: 'Master Data Management', desc: 'Create and edit employees, departments, designations and categories' },
      { key: 'canRegisterAssets', label: 'Register & Edit Assets', desc: 'Add new hardware items, update serial numbers and asset specifications' },
      { key: 'canAllocateAssets', label: 'Allocate Assets', desc: 'Assign equipment to employees with generated handover vouchers' },
      { key: 'canProcessReturns', label: 'Process Returns', desc: 'Record returned items, inspect conditions, and log depot returns' },
      { key: 'canGenerateNOC', label: 'Generate NOC Drafts', desc: 'Initiate exit clearance records and check for pending assets' },
      { key: 'canFinalizeNOC', label: 'Finalize & Lock NOCs', desc: 'Affix official authorized digital signatures and seal clearance certificates' },
      { key: 'canDeleteRecords', label: 'Delete Records', desc: 'Remove asset records, employee files, or system entries' },
      { key: 'canExportReports', label: 'Export Reports & Audits', desc: 'Download CSV asset registers and inspect system audit trail logs' },
      { key: 'canViewFinancials', label: 'View Asset Valuations', desc: 'Access purchase cost, depreciated values and invoice values' }
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-rose-50 border-b border-rose-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-200 text-rose-800 uppercase tracking-wider">
                    Super Admin Exclusive
                  </span>
                </div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  Access Restricted: Super Admin Governance
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Under Zovilo Life Style security protocols, <strong>only one Super Admin exists</strong> in the system. System permissions, role capabilities, and corporate parameters are managed exclusively by the Super Admin.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Sole Super Admin Custodian Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" /> Current Sole Super Admin
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {settings.superAdminName.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {settings.superAdminName}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Sole Super Admin
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {settings.superAdminEmail}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Security Tier</div>
                  <div className="text-xs font-semibold text-slate-700">Root Authority</div>
                </div>
              </div>
            </div>

            {/* Read-Only Role Permissions Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Your Assigned Role Capabilities: <span className="text-blue-600 uppercase font-extrabold">{currentUser?.role}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Below is the active permission policy configured for your role by the Super Admin.
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  Read Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {permissionLabels.map(item => {
                  const hasIt = currentPerms ? currentPerms[item.key] : false;
                  return (
                    <div
                      key={item.key}
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                        hasIt
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className={`mt-0.5 p-0.5 rounded-full ${hasIt ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
                        {hasIt ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold text-xs ${hasIt ? 'text-slate-900' : 'text-slate-500'}`}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Need modified permissions? Contact {settings.superAdminName} ({settings.superAdminEmail}).
              </p>
              <button
                onClick={() => setActiveView('dashboard')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Super Admin Exclusive Control Console
  // -------------------------------------------------------------
  const permissionKeys: { key: keyof RolePermissions; label: string; desc: string }[] = [
    { key: 'canManageMasterData', label: 'Master Data Governance', desc: 'Create & modify employees, departments, designations, and asset categories' },
    { key: 'canRegisterAssets', label: 'Register & Edit Assets', desc: 'Add new hardware items, update serial numbers, specs, and status' },
    { key: 'canAllocateAssets', label: 'Allocate Assets to Staff', desc: 'Issue company equipment to employees and generate handover vouchers' },
    { key: 'canProcessReturns', label: 'Process Returns & Inspection', desc: 'Accept returned assets, record wear & tear, route to repair or inventory' },
    { key: 'canGenerateNOC', label: 'Generate Exit NOC Documents', desc: 'Draft No Objection Certificates for resigning/exiting staff' },
    { key: 'canFinalizeNOC', label: 'Authorize & Lock NOC Clearances', desc: 'Officially finalize clearance records, lock documents, and update employee status' },
    { key: 'canDeleteRecords', label: 'Delete Records', desc: 'Hard delete assets, employee files, or system records from the database' },
    { key: 'canExportReports', label: 'Export Reports & Audit Trail', desc: 'Download CSV asset registers, allocation summaries, and view security audits' },
    { key: 'canViewFinancials', label: 'View Asset Financial Valuations', desc: 'Inspect asset acquisition costs, depreciated book values, and vendor purchase info' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner: Single Super Admin Badge */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                Single Super Admin Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Root Custodian
              </span>
            </div>
            <h1 className="text-lg font-bold text-white">
              {settings.superAdminName} ({settings.superAdminEmail})
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict Policy: Exactly one Super Admin exists. All permissions and controls are managed exclusively from this console.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Transfer Super Admin Custody
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'governance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" /> Super Admin Permissions & Access Control
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'company'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Corporate Entity & Letterhead
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'assets'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" /> Asset Sequences & NOC Parameters
        </button>
        <button
          onClick={() => setActiveTab('smtp')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'smtp'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" /> SMTP & Dispatch Relay
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600" /> Supabase Backend & Cloud DB
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMessage || 'Configurations successfully saved.'}</span>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 1: Permissions & Access Controls Matrix (Super Admin Exclusive)
         ------------------------------------------------------------- */}
      {activeTab === 'governance' && (
        <div className="space-y-6 text-xs">
          {/* Presets and Guidance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" /> Role-Based Access Control (RBAC) Matrix
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Configure granular permissions for secondary roles. As the sole Super Admin, your account retains full unrestricted access.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('standard')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                >
                  Enterprise Standard
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('strict')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                >
                  Strict Compliance
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('relaxed')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                >
                  Ops Empowered
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 w-72">Permission & Control Capability</th>
                    <th className="py-3 px-3 text-center bg-blue-50/50 text-blue-800">
                      Super Admin
                      <div className="text-[9px] font-normal text-blue-600">You (Exclusive)</div>
                    </th>
                    <th className="py-3 px-3 text-center text-emerald-800">
                      Admin
                      <div className="text-[9px] font-normal text-slate-400">IT Lead / Operations</div>
                    </th>
                    <th className="py-3 px-3 text-center text-purple-800">
                      Manager
                      <div className="text-[9px] font-normal text-slate-400">HR / Department Head</div>
                    </th>
                    <th className="py-3 px-3 text-center text-amber-800">
                      Staff
                      <div className="text-[9px] font-normal text-slate-400">Technician / Storekeeper</div>
                    </th>
                    <th className="py-3 px-3 text-center text-slate-700">
                      Viewer
                      <div className="text-[9px] font-normal text-slate-400">Auditor / Read-only</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionKeys.map(perm => (
                    <tr key={perm.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{perm.label}</div>
                        <div className="text-[10px] text-slate-400">{perm.desc}</div>
                      </td>

                      {/* Super Admin Column: Always Enabled & Locked */}
                      <td className="py-3 px-3 text-center bg-blue-50/30">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </td>

                      {/* Other Roles: Configurable Switches */}
                      {(['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'] as const).map(role => {
                        const isEnabled = localPermissions[role][perm.key];
                        return (
                          <td key={role} className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(role, perm.key)}
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-all cursor-pointer ${
                                isEnabled
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                              title={`Toggle ${perm.label} for ${role}`}
                            >
                              {isEnabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span>Changes to the permissions matrix take effect immediately across all active user sessions.</span>
              </div>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Permission Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: Corporate Entity & Letterhead
         ------------------------------------------------------------- */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCorporateSettings} className="space-y-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Corporate Entity & Registration Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Display Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500 uppercase font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Corporate Entity *</label>
                <input
                  type="text"
                  required
                  value={formData.legalName}
                  onChange={e => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Identity Number (CIN)</label>
                <input
                  type="text"
                  value={formData.cin || ''}
                  onChange={e => setFormData({ ...formData, cin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Correspondence Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Support Desk Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Headquarters Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={e => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Corporate Identity
              </button>
            </div>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------
          TAB 3: Asset Sequences & NOC Parameters
         ------------------------------------------------------------- */}
      {activeTab === 'assets' && (
        <form onSubmit={handleSaveCorporateSettings} className="space-y-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> Sequential Tagging & Exit Governance Text
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Tag ID Prefix *</label>
                <input
                  type="text"
                  required
                  value={formData.assetIdPrefix}
                  onChange={e => setFormData({ ...formData, assetIdPrefix: e.target.value.toUpperCase() })}
                  placeholder="ZLS-"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Preview: {formData.assetIdPrefix}000101
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Asset Sequence Counter</label>
                <input
                  type="number"
                  value={formData.nextAssetSequence}
                  onChange={e => setFormData({ ...formData, nextAssetSequence: parseInt(e.target.value) || 101 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.currencySymbol || '₹'}
                  onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NOC Clearance Document Header Title</label>
              <input
                type="text"
                value={formData.nocHeaderTitle}
                onChange={e => setFormData({ ...formData, nocHeaderTitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official NOC Declaration Text</label>
              <textarea
                rows={3}
                value={formData.nocDeclaration}
                onChange={e => setFormData({ ...formData, nocDeclaration: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                This legal declaration appears on every generated No Objection Certificate (NOC) PDF.
              </span>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Asset Parameters
              </button>
            </div>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------
          TAB 4: SMTP & Dispatch Relay
         ------------------------------------------------------------- */}
      {activeTab === 'smtp' && (
        <form onSubmit={handleSaveCorporateSettings} className="space-y-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> SMTP Server & Automated Notification Dispatch
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SMTP Server Host</label>
                <input
                  type="text"
                  value={formData.smtpConfig?.host || 'smtp.gmail.com'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      smtpConfig: { ...formData.smtpConfig, host: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Port (SSL/TLS)</label>
                <input
                  type="number"
                  value={formData.smtpConfig?.port || 587}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      smtpConfig: { ...formData.smtpConfig, port: parseInt(e.target.value) || 587 }
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Notification Sender Email</label>
              <input
                type="email"
                value={formData.smtpConfig?.user || 'notifications@zovilolifestyle.com'}
                onChange={e =>
                  setFormData({
                    ...formData,
                    smtpConfig: { ...formData.smtpConfig, user: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="smtpEnabled"
                checked={formData.smtpConfig?.enabled ?? true}
                onChange={e =>
                  setFormData({
                    ...formData,
                    smtpConfig: { ...formData.smtpConfig, enabled: e.target.checked }
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="smtpEnabled" className="font-semibold text-slate-700">
                Enable automated email dispatch for Asset Allocation vouchers & NOC finalization
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" /> Save SMTP Parameters
              </button>
            </div>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------
          TAB 5: Supabase Cloud Backend & Database Management
         ------------------------------------------------------------- */}
      {activeTab === 'supabase' && (
        <SupabaseBackendTab />
      )}

      {/* -------------------------------------------------------------
          MODAL: Transfer Super Admin Custody
         ------------------------------------------------------------- */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Transfer Sole Super Admin Authority
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Critical security procedure: exactly one Super Admin exists in Zovilo Life Style.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Permanent Custody Transfer
              </div>
              <p className="text-[11px] leading-relaxed">
                By transferring Super Admin authority, the new recipient will hold <strong>exclusive root control</strong> over system settings, permission matrices, and audit logs. Your current account ({settings.superAdminEmail}) will be adjusted to <strong>Senior Administrator</strong>.
              </p>
            </div>

            {transferError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {transferError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Registered Employee
                </label>
                <select
                  value={selectedRecipientId}
                  onChange={e => {
                    setSelectedRecipientId(e.target.value);
                    const emp = employees.find(empItem => empItem.id === e.target.value);
                    if (emp) {
                      setCustomTransferName(emp.name);
                      setCustomTransferEmail(emp.email);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="">-- Choose from Staff Directory --</option>
                  {employees
                    .filter(e => e.email.toLowerCase() !== settings.superAdminEmail.toLowerCase())
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.empId}) • {emp.email} • {emp.designationTitle}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    value={customTransferName}
                    onChange={e => setCustomTransferName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    value={customTransferEmail}
                    onChange={e => setCustomTransferEmail(e.target.value)}
                    placeholder="e.g. rahul.kumar@zovilolifestyle.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirmation Keyword
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Type <strong>TRANSFER</strong> in capital letters to confirm:
                </p>
                <input
                  type="text"
                  value={transferConfirmationText}
                  onChange={e => setTransferConfirmationText(e.target.value)}
                  placeholder="TRANSFER"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setTransferError('');
                  setTransferConfirmationText('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Crown className="w-3.5 h-3.5" /> Confirm Custody Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
