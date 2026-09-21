import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Crown,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  Check,
  X,
  Mail,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  User,
  UserRole,
  UserStatus,
  SystemModule,
  PermissionAction,
  UserModulePermissions,
  ModulePermissions
} from '../../types';
import { createFullPermissions, createRolePresetPermissions } from '../../utils/security';

const ALL_MODULES: { id: SystemModule; label: string; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard Overview', description: 'Access KPI metrics, financial summary, and inventory overview' },
  { id: 'assets', label: 'Asset Inventory', description: 'Register, update, track, and manage company physical assets' },
  { id: 'master', label: 'Master Data', description: 'Configure departments, designations, asset types, and locations' },
  { id: 'employees', label: 'Employee Directory', description: 'Manage corporate employees, profiles, and staff assignments' },
  { id: 'allocations', label: 'Asset Allocations', description: 'Assign hardware and company equipment to staff members' },
  { id: 'returns', label: 'Handover & Returns', description: 'Process hardware handovers, asset intake, and inspections' },
  { id: 'noc', label: 'NOC Exit Clearance', description: 'Generate, verify, approve, and finalize exit NOC certificates' },
  { id: 'reports', label: 'System Reports', description: 'Run asset register, valuation audits, and allocation exports' },
  { id: 'audit_logs', label: 'Audit Trail', description: 'Inspect tamper-evident system logs and security operations' },
  { id: 'settings', label: 'Company Settings', description: 'Manage corporate metadata, branding, and system preferences' }
];

const PERMISSION_ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'add', label: 'Add' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'export', label: 'Export' },
  { id: 'approve', label: 'Approve' }
];

export const UsersManagementView: React.FC = () => {
  const {
    currentUser,
    isSuperAdmin,
    users,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPasswordByAdmin,
    updateUserPermissions,
    setActiveView,
    departments,
    designations,
    settings
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [permissionTargetUser, setPermissionTargetUser] = useState<User | null>(null);

  // Form states for Create/Edit
  const [formUserId, setFormUserId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('STAFF');
  const [formDepartment, setFormDepartment] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formStatus, setFormStatus] = useState<UserStatus>('Active');
  const [formPassword, setFormPassword] = useState('');
  const [formPermissions, setFormPermissions] = useState<UserModulePermissions>(createRolePresetPermissions('STAFF'));
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Password reset modal input
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminShowPassword, setAdminShowPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // 403 Access Denied Enforcement
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
          HTTP 403 Forbidden
        </span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">403 Access Denied</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md leading-relaxed">
          You do not have permission to access the User Management module. Contact your Super Admin for authorization.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormUserId(`USR${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('STAFF');
    setFormDepartment(departments[0]?.name || 'Operations');
    setFormDesignation(designations[0]?.title || 'Associate');
    setFormStatus('Active');
    setFormPassword('pass123');
    setFormPermissions(createRolePresetPermissions('STAFF'));
    setFormError('');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormUserId(user.userId);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormDepartment(user.department);
    setFormDesignation(user.designation);
    setFormStatus(user.status);
    setFormPassword('');
    setFormPermissions(user.permissions || createRolePresetPermissions(user.role));
    setFormError('');
  };

  // Handle Role Change in Form to auto-suggest permission presets
  const handleRoleChange = (role: UserRole) => {
    setFormRole(role);
    setFormPermissions(createRolePresetPermissions(role));
  };

  // Toggle single permission action for form
  const handleTogglePermission = (
    module: SystemModule,
    action: PermissionAction,
    currentPerms: UserModulePermissions,
    setter: (perms: UserModulePermissions) => void
  ) => {
    const updated = { ...currentPerms };
    const modulePerms = { ...(updated[module] || { view: false, add: false, edit: false, delete: false, export: false }) };
    modulePerms[action] = !modulePerms[action];
    // If enabling add, edit, or delete, automatically enable view
    if (action !== 'view' && modulePerms[action]) {
      modulePerms.view = true;
    }
    // If disabling view, disable all other actions for that module
    if (action === 'view' && !modulePerms.view) {
      modulePerms.add = false;
      modulePerms.edit = false;
      modulePerms.delete = false;
      modulePerms.export = false;
      if (modulePerms.approve !== undefined) modulePerms.approve = false;
    }
    updated[module] = modulePerms;
    setter(updated);
  };

  // Bulk enable or disable module in permission editor
  const handleBulkModuleToggle = (
    module: SystemModule,
    enableAll: boolean,
    currentPerms: UserModulePermissions,
    setter: (perms: UserModulePermissions) => void
  ) => {
    const updated = { ...currentPerms };
    updated[module] = {
      view: enableAll,
      add: enableAll,
      edit: enableAll,
      delete: enableAll,
      export: enableAll,
      approve: enableAll
    };
    setter(updated);
  };

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formUserId.trim()) {
      setFormError('User ID is required.');
      return;
    }
    if (!formName.trim()) {
      setFormError('User Name is required.');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('A valid email address is required.');
      return;
    }
    if (!formPassword || formPassword.length < 6) {
      setFormError('Initial password must be at least 6 characters.');
      return;
    }

    setFormLoading(true);
    try {
      const result = await addUser(
        {
          userId: formUserId.trim(),
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim() || undefined,
          role: formRole,
          department: formDepartment,
          designation: formDesignation,
          status: formStatus,
          passwordHash: '',
          permissions: formPermissions,
          isSuperAdmin: false
        },
        formPassword
      );

      if (!result.success) {
        setFormError(result.error || 'Failed to create user.');
      } else {
        setIsCreateModalOpen(false);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Error occurred while saving user.');
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');

    if (!formUserId.trim() || !formName.trim() || !formEmail.trim()) {
      setFormError('User ID, Name, and Email are required.');
      return;
    }

    setFormLoading(true);
    try {
      const result = await updateUser(
        editingUser.id,
        {
          userId: formUserId.trim(),
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim() || undefined,
          role: formRole,
          department: formDepartment,
          designation: formDesignation,
          status: formStatus,
          permissions: formPermissions
        },
        formPassword ? formPassword : undefined
      );

      if (!result.success) {
        setFormError(result.error || 'Failed to update user.');
      } else {
        setEditingUser(null);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Error occurred while updating user.');
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Direct Password Reset by Admin
  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingPasswordUser) return;
    setResetError('');
    setResetSuccessMessage('');

    if (!adminNewPassword || adminNewPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await resetUserPasswordByAdmin(resettingPasswordUser.id, adminNewPassword);
      if (!res.success) {
        setResetError(res.error || 'Failed to reset password.');
      } else {
        setResetSuccessMessage(`Credentials updated successfully for ${resettingPasswordUser.name}.`);
        setTimeout(() => {
          setResettingPasswordUser(null);
          setAdminNewPassword('');
          setResetSuccessMessage('');
        }, 1200);
      }
    } catch (err: any) {
      setResetError('Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Save Permissions Matrix from dedicated modal
  const handleSavePermissionMatrix = (targetUser: User, permissions: UserModulePermissions) => {
    updateUserPermissions(targetUser.id, permissions);
    setPermissionTargetUser(null);
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.userId.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.department.toLowerCase().includes(query) ||
      u.designation.toLowerCase().includes(query);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">User Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-600" /> Super Admin Area
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Create user accounts, govern granular RBAC permissions, reset credentials, and monitor system access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-add-new-user"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Users</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Directory accounts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active Accounts</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {users.filter(u => u.status === 'Active').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Operational users</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Super Admin</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 flex items-center gap-1">
            1 <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sole governance custody</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Inactive / Suspended</div>
          <div className="text-2xl font-bold text-slate-700 mt-1">
            {users.filter(u => u.status !== 'Active').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Access disabled</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-users"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by User ID, Name, Email, Department..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="select-filter-role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full md:w-36 py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff</option>
            <option value="VIEWER">Viewer</option>
          </select>

          {/* Status Filter */}
          <select
            id="select-filter-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-36 py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User ID & Profile</th>
                <th className="py-3 px-4">Email ID</th>
                <th className="py-3 px-4">Role & Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Permissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">No users found</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isUserSuperAdmin = Boolean(
                    user.isSuperAdmin ||
                    user.role === 'SUPER_ADMIN' ||
                    user.email.toLowerCase() === settings.superAdminEmail.toLowerCase()
                  );

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* User ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                            {user.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isUserSuperAdmin && (
                                <span title="Sole Super Admin">
                                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              ID: <span className="font-semibold text-slate-700">{user.userId}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email ID */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-mono text-[11px]">{user.email}</div>
                        {user.phone && <div className="text-[10px] text-slate-400">{user.phone}</div>}
                      </td>

                      {/* Role & Designation */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {isUserSuperAdmin ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                              SUPER ADMIN
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800'
                                : user.role === 'MANAGER'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'STAFF'
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {user.role}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{user.designation}</div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {user.department}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : user.status === 'Suspended'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                          {user.status}
                        </span>
                      </td>

                      {/* Permissions Matrix Button */}
                      <td className="py-3.5 px-4 text-center">
                        {isUserSuperAdmin ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Full Access
                          </span>
                        ) : (
                          <button
                            onClick={() => setPermissionTargetUser(user)}
                            className="px-2.5 py-1 rounded text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                          >
                            Configure Matrix
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="View user details"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit user */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit user details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset password */}
                          <button
                            onClick={() => {
                              setResettingPasswordUser(user);
                              setAdminNewPassword('');
                              setResetError('');
                            }}
                            className="p-1.5 rounded text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                            title="Reset password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Status toggle (Deactivate/Activate) */}
                          {!isUserSuperAdmin && (
                            <button
                              onClick={() => {
                                const nextStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';
                                toggleUserStatus(user.id, nextStatus);
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                user.status === 'Active'
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                              }`}
                              title={user.status === 'Active' ? 'Deactivate account' : 'Activate account'}
                            >
                              {user.status === 'Active' ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>
                          )}

                          {/* Delete account */}
                          {!isUserSuperAdmin && (
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete user account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CREATE / EDIT USER MODAL */}
      {/* ========================================================================= */}
      {(isCreateModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingUser ? 'Update profile and credentials' : 'Provision a new corporate directory account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={editingUser ? handleEditSubmit : handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>{formError}</div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* User ID */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    User ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUserId}
                    onChange={e => setFormUserId(e.target.value)}
                    placeholder="e.g. USR102 or john.doe"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Used for direct credential sign in</span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g. jane.doe@zovilolifestyle.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <select
                    value={formDesignation}
                    onChange={e => setFormDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    {designations.map(d => (
                      <option key={d.id} value={d.title}>{d.title}</option>
                    ))}
                  </select>
                </div>

                {/* Role Preset */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Role Preset
                  </label>
                  <select
                    value={formRole}
                    onChange={e => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="MANAGER">Manager</option>
                    <option value="STAFF">Staff Member</option>
                    <option value="VIEWER">Viewer (Read Only)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingUser ? 'Update Password (leave blank to retain existing)' : 'Initial Password *'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              {/* Permission Matrix Preview / Accordion */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Granular Module Permissions
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Preloaded from {formRole} template (customizable)
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {ALL_MODULES.map(m => {
                    const perms = formPermissions[m.id] || { view: false, add: false, edit: false, delete: false, export: false };
                    return (
                      <div key={m.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 text-[11px]">
                        <span className="font-semibold text-slate-800 w-1/3">{m.label}</span>
                        <div className="flex items-center gap-3">
                          {PERMISSION_ACTIONS.map(action => (
                            <label key={action.id} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(perms[action.id])}
                                onChange={() => handleTogglePermission(m.id, action.id, formPermissions, setFormPermissions)}
                                className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span className="text-slate-600 text-[10px]">{action.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEDICATED PERMISSION MATRIX MODAL */}
      {/* ========================================================================= */}
      {permissionTargetUser && (
        <PermissionMatrixModal
          user={permissionTargetUser}
          onClose={() => setPermissionTargetUser(null)}
          onSave={updatedPerms => handleSavePermissionMatrix(permissionTargetUser, updatedPerms)}
        />
      )}

      {/* ========================================================================= */}
      {/* RESET PASSWORD MODAL BY ADMIN */}
      {/* ========================================================================= */}
      {resettingPasswordUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset User Password</h3>
                <p className="text-xs text-slate-500">
                  {resettingPasswordUser.name} ({resettingPasswordUser.userId})
                </p>
              </div>
            </div>

            {resetSuccessMessage ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-800">{resetSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleAdminResetPassword} className="mt-4 space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  As Super Admin, you can directly set new login credentials for this user. The new password will take effect immediately.
                </p>

                {resetError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={adminShowPassword ? 'text' : 'password'}
                      required
                      value={adminNewPassword}
                      onChange={e => setAdminNewPassword(e.target.value)}
                      placeholder="Enter minimum 6 characters"
                      className="w-full px-3 py-2 pr-9 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setAdminShowPassword(!adminShowPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {adminShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResettingPasswordUser(null)}
                    className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-1/2 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg disabled:opacity-50"
                  >
                    {resetLoading ? 'Updating...' : 'Set Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete User Account</h3>
                <p className="text-xs text-slate-500">Permanent account removal</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{deletingUser.name}</strong> ({deletingUser.userId})? This user will immediately lose access to the portal. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(deletingUser.id);
                  setDeletingUser(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW USER DETAILS MODAL */}
      {/* ========================================================================= */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center">
                  {viewingUser.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{viewingUser.name}</span>
                    {viewingUser.isSuperAdmin && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">User ID: {viewingUser.userId}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Email ID</span>
                  <div className="text-slate-800 font-mono text-[11px] truncate">{viewingUser.email}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                  <div className="font-semibold text-slate-800">{viewingUser.status}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Role</span>
                  <div className="font-semibold text-blue-600">{viewingUser.role}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                  <div className="text-slate-800">{viewingUser.department}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Designation</span>
                  <div className="text-slate-800">{viewingUser.designation}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Last Login</span>
                  <div className="text-slate-800 font-mono text-[10px]">
                    {viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleString() : 'Never logged in'}
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 text-[11px]">Module Permissions Summary</span>
                <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {ALL_MODULES.map(m => {
                    const p = viewingUser.permissions?.[m.id];
                    const count = p ? Object.values(p).filter(Boolean).length : 0;
                    return (
                      <div key={m.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-700 truncate">{m.label}</span>
                        <span className="text-[10px] font-mono text-blue-600 font-bold">{count} acts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-Component for granular permission matrix modal
interface PermissionMatrixModalProps {
  user: User;
  onClose: () => void;
  onSave: (perms: UserModulePermissions) => void;
}

const PermissionMatrixModal: React.FC<PermissionMatrixModalProps> = ({
  user,
  onClose,
  onSave
}) => {
  const [permissions, setPermissions] = useState<UserModulePermissions>(() => {
    return user.permissions ? JSON.parse(JSON.stringify(user.permissions)) : createRolePresetPermissions(user.role);
  });

  const toggleAction = (module: SystemModule, action: PermissionAction) => {
    const updated = { ...permissions };
    const modulePerms = { ...(updated[module] || { view: false, add: false, edit: false, delete: false, export: false }) };
    modulePerms[action] = !modulePerms[action];
    if (action !== 'view' && modulePerms[action]) {
      modulePerms.view = true;
    }
    if (action === 'view' && !modulePerms.view) {
      modulePerms.add = false;
      modulePerms.edit = false;
      modulePerms.delete = false;
      modulePerms.export = false;
      if (modulePerms.approve !== undefined) modulePerms.approve = false;
    }
    updated[module] = modulePerms;
    setPermissions(updated);
  };

  const setAllInModule = (module: SystemModule, enable: boolean) => {
    const updated = { ...permissions };
    updated[module] = {
      view: enable,
      add: enable,
      edit: enable,
      delete: enable,
      export: enable,
      approve: enable
    };
    setPermissions(updated);
  };

  const applyPreset = (role: UserRole) => {
    setPermissions(createRolePresetPermissions(role));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Permission Matrix: {user.name} ({user.userId})
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure module-level authority and action constraints for this user
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset quick buttons */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <span className="font-semibold text-slate-600">Quick Presets:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('ADMIN')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-200 text-[11px] font-medium"
            >
              Admin Template
            </button>
            <button
              type="button"
              onClick={() => applyPreset('MANAGER')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-200 text-[11px] font-medium"
            >
              Manager Template
            </button>
            <button
              type="button"
              onClick={() => applyPreset('STAFF')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-200 text-[11px] font-medium"
            >
              Staff Template
            </button>
            <button
              type="button"
              onClick={() => applyPreset('VIEWER')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-200 text-[11px] font-medium"
            >
              Read Only
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
          {ALL_MODULES.map(m => {
            const p = permissions[m.id] || { view: false, add: false, edit: false, delete: false, export: false };
            const isAllEnabled = p.view && p.add && p.edit && p.delete && p.export;

            return (
              <div key={m.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{m.label}</span>
                    <p className="text-[10px] text-slate-500">{m.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllInModule(m.id, !isAllEnabled)}
                    className="text-[10px] font-semibold text-blue-600 hover:underline"
                  >
                    {isAllEnabled ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PERMISSION_ACTIONS.map(act => (
                    <label
                      key={act.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        p[act.id]
                          ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(p[act.id])}
                        onChange={() => toggleAction(m.id, act.id)}
                        className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="text-[11px]">{act.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Changes take effect immediately for active and future sessions.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(permissions)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
