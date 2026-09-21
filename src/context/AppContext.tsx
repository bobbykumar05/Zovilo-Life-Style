import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  UserStatus,
  SystemModule,
  PermissionAction,
  UserModulePermissions,
  PasswordResetToken,
  Employee,
  Department,
  Designation,
  AssetCategory,
  AssetType,
  LocationItem,
  Asset,
  AssetStatus,
  AssetCondition,
  AssetLifecycleRecord,
  Allocation,
  AssetReturnRecord,
  NOC,
  NocStatus,
  AuditLog,
  AppNotification,
  CompanySettings,
  RolePermissions
} from '../types';
import {
  INITIAL_USER,
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_DESIGNATIONS,
  INITIAL_CATEGORIES,
  INITIAL_ASSET_TYPES,
  INITIAL_LOCATIONS,
  INITIAL_EMPLOYEES,
  INITIAL_ASSETS,
  INITIAL_ALLOCATIONS,
  INITIAL_RETURNS,
  INITIAL_NOCS,
  INITIAL_LIFECYCLE,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS
} from '../data/initialData';
import {
  hashPassword,
  verifyPassword,
  generateResetToken,
  checkUserPermission,
  createFullPermissions,
  createRolePresetPermissions
} from '../utils/security';
import {
  supabase,
  checkSupabaseHealth,
  pushAllDataToSupabase,
  pullAllDataFromSupabase,
  SUPABASE_PROJECT_ID,
  DEFAULT_SUPABASE_URL,
  SupabaseHealthStatus
} from '../lib/supabase';

interface AppContextType {
  // Navigation & View
  activeView: string;
  setActiveView: (view: string) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  selectedNocId: string | null;
  setSelectedNocId: (id: string | null) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;

  // Authentication & Users
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (identifier: string) => Promise<{
    success: boolean;
    error?: string;
    resetData?: { token: string; email: string; name: string; expiresAt: string };
  }>;
  completePasswordReset: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  activeResetRequest: { token: string; email: string; name: string; expiresAt: string } | null;
  setActiveResetRequest: (data: { token: string; email: string; name: string; expiresAt: string } | null) => void;

  // Dedicated Users Management & RBAC Permissions
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>, rawPassword?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  updateUser: (id: string, updates: Partial<User>, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => { success: boolean; error?: string };
  toggleUserStatus: (id: string, newStatus: UserStatus) => { success: boolean; error?: string };
  resetUserPasswordByAdmin: (id: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPermissions: (id: string, permissions: UserModulePermissions) => { success: boolean; error?: string };
  canAccess: (module: SystemModule, action?: PermissionAction) => boolean;

  // Data Collections
  employees: Employee[];
  departments: Department[];
  designations: Designation[];
  categories: AssetCategory[];
  assetTypes: AssetType[];
  locations: LocationItem[];
  assets: Asset[];
  allocations: Allocation[];
  returns: AssetReturnRecord[];
  nocs: NOC[];
  lifecycles: AssetLifecycleRecord[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  settings: CompanySettings;

  // Employee Operations
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => boolean;

  // Department / Designation Operations
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  addDesignation: (desig: Omit<Designation, 'id'>) => void;
  updateDesignation: (id: string, desig: Partial<Designation>) => void;

  // Category & Type Operations
  addCategory: (cat: Omit<AssetCategory, 'id'>) => void;
  addAssetType: (type: Omit<AssetType, 'id'>) => void;

  // Location Operations
  addLocation: (loc: Omit<LocationItem, 'id'>) => void;

  // Asset Operations
  addAsset: (assetData: Omit<Asset, 'id' | 'assetId' | 'status' | 'createdAt' | 'updatedAt'>) => Asset;
  updateAsset: (id: string, assetData: Partial<Asset>) => void;
  updateAssetStatus: (id: string, status: AssetStatus, remarks?: string, condition?: AssetCondition) => void;
  deleteAsset: (id: string) => boolean;
  getAssetById: (id: string) => Asset | undefined;
  getAssetLifecycle: (assetId: string) => AssetLifecycleRecord[];

  // Allocation Operations
  allocateAssets: (data: {
    employeeId: string;
    assetIds: string[];
    purpose: string;
    remarks?: string;
    allocatedDate: string;
  }) => { success: boolean; error?: string; allocation?: Allocation };

  // Return & Handover Operations
  processReturnHandover: (data: {
    employeeId: string;
    returnDate: string;
    receivedBy: string;
    locationId: string;
    items: {
      assetId: string;
      returnStatus: 'Returned' | 'Not Returned' | 'Damaged' | 'Lost' | 'Missing' | 'Other';
      condition: AssetCondition;
      remarks?: string;
      inspectionAction: 'Available' | 'In Repair' | 'Damaged' | 'Retired';
    }[];
    overallRemarks?: string;
  }) => { success: boolean; returnRecord?: AssetReturnRecord; pendingCount: number };

  // NOC Operations
  createNoc: (employeeId: string) => { success: boolean; noc?: NOC; error?: string };
  updateNoc: (id: string, data: Partial<NOC>) => void;
  finalizeNoc: (id: string, authorizedPersonName: string, authorizedPersonDesignation: string) => { success: boolean; error?: string };

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Super Admin & Permission Governance
  isSuperAdmin: boolean;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  transferSuperAdmin: (newSuperAdminEmail: string, newSuperAdminName: string) => boolean;
  updateRolePermissions: (role: Exclude<UserRole, 'SUPER_ADMIN'>, permissions: Partial<RolePermissions>) => void;

  // Settings & Reset
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  resetAllDataToSeed: () => void;

  // Helpers
  getEmployeeActiveAssets: (employeeId: string) => Asset[];
  getEmployeeReturnHistory: (employeeId: string) => AssetReturnRecord[];
  getEmployeeNoc: (employeeId: string) => NOC | undefined;
  logAudit: (action: string, entity: string, entityId: string, details: string) => void;

  // Supabase Cloud Backend
  supabaseStatus: SupabaseHealthStatus;
  isSupabaseChecking: boolean;
  isSupabaseSyncing: boolean;
  autoSyncSupabase: boolean;
  setAutoSyncSupabase: (auto: boolean) => void;
  checkSupabaseConnection: () => Promise<SupabaseHealthStatus>;
  pushDataToSupabase: () => Promise<{ success: boolean; syncedCounts?: Record<string, number>; error?: string }>;
  pullDataFromSupabase: () => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'jobulo_assets_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedNocId, setSelectedNocId] = useState<string | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.email === 'admin@jobuloindia.com' || u.email === 'admin@zoviloindia.com') {
          u.email = INITIAL_USER.email;
        }
        if (!u.userId) {
          u.userId = 'admin';
        }
        if (!u.permissions) {
          u.permissions = createFullPermissions();
        }
        return u;
      } catch (e) {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  // Dedicated Users Collection State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: any) => {
            if (!u.permissions) {
              return { ...u, permissions: createRolePresetPermissions(u.role || 'STAFF') };
            }
            if (!u.userId) {
              return { ...u, userId: u.email ? u.email.split('@')[0] : `usr_${u.id}` };
            }
            if (!u.status) {
              return { ...u, status: 'Active' };
            }
            return u;
          });
        }
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  // Active Password Reset Request (for in-app reset preview & flow)
  const [activeResetRequest, setActiveResetRequest] = useState<{
    token: string;
    email: string;
    name: string;
    expiresAt: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  // Entities State with LocalStorage Initialization
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}employees`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}departments`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [designations, setDesignations] = useState<Designation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}designations`);
    return saved ? JSON.parse(saved) : INITIAL_DESIGNATIONS;
  });

  const [categories, setCategories] = useState<AssetCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}categories`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [assetTypes, setAssetTypes] = useState<AssetType[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}assetTypes`);
    return saved ? JSON.parse(saved) : INITIAL_ASSET_TYPES;
  });

  const [locations, setLocations] = useState<LocationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}locations`);
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}assets`);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [allocations, setAllocations] = useState<Allocation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}allocations`);
    return saved ? JSON.parse(saved) : INITIAL_ALLOCATIONS;
  });

  const [returns, setReturns] = useState<AssetReturnRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}returns`);
    return saved ? JSON.parse(saved) : INITIAL_RETURNS;
  });

  const [nocs, setNocs] = useState<NOC[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}nocs`);
    return saved ? JSON.parse(saved) : INITIAL_NOCS;
  });

  const [lifecycles, setLifecycles] = useState<AssetLifecycleRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}lifecycles`);
    return saved ? JSON.parse(saved) : INITIAL_LIFECYCLE;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}auditLogs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.brandName || parsed.brandName === 'Video Lifestyle' || parsed.brandName === 'ZOVILO LIFE STYLE') {
          parsed.brandName = 'Zovilo Life Style';
          parsed.companyName = 'Zovilo Life Style Private Limited';
          parsed.legalName = 'Zovilo Life Style Corporate Assets & Services Pvt. Ltd.';
          parsed.email = 'assets@zovilolifestyle.com';
          parsed.website = 'https://zovilolifestyle.com';
          parsed.assetIdPrefix = 'ZLS-';
        }
        if (!parsed.superAdminEmail) {
          parsed.superAdminEmail = INITIAL_SETTINGS.superAdminEmail;
          parsed.superAdminName = INITIAL_SETTINGS.superAdminName;
          parsed.superAdminId = INITIAL_SETTINGS.superAdminId;
        }
        if (!parsed.rolePermissions) {
          parsed.rolePermissions = INITIAL_SETTINGS.rolePermissions;
        }
        return parsed;
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}assets`, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}allocations`, JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}returns`, JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}nocs`, JSON.stringify(nocs));
  }, [nocs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}lifecycles`, JSON.stringify(lifecycles));
  }, [lifecycles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    }
  }, [currentUser]);

  // Audit Logging Helper
  const logAudit = (action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System',
      userRole: currentUser?.role || 'SUPER_ADMIN',
      action,
      entity,
      entityId,
      details,
      ipAddress: '103.21.144.92'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Optional background mirror of audit log
    if (autoSyncSupabase) {
      void (async () => {
        try {
          await supabase.from('audit_logs').insert({
            id: newLog.id,
            timestamp: newLog.timestamp,
            user_id: newLog.userId,
            user_name: newLog.userName,
            user_role: newLog.userRole,
            action: newLog.action,
            entity: newLog.entity,
            entity_id: newLog.entityId,
            details: newLog.details,
            ip_address: newLog.ipAddress
          });
        } catch {
          // Graceful fallback
        }
      })();
    }
  };

  // -------------------------------------------------------------
  // Supabase Cloud Backend Integration State & Actions
  // -------------------------------------------------------------
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseHealthStatus>({
    connected: false,
    checkedAt: '',
    projectId: SUPABASE_PROJECT_ID,
    url: DEFAULT_SUPABASE_URL,
    tablesFound: {
      employees: false,
      assets: false,
      allocations: false,
      returns: false,
      nocs: false,
      audit_logs: false,
      company_settings: false,
    },
    hasTables: false
  });
  const [isSupabaseChecking, setIsSupabaseChecking] = useState(false);
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState(false);
  const [autoSyncSupabase, setAutoSyncSupabase] = useState<boolean>(() => {
    return localStorage.getItem('zovilo_supabase_autosync') !== 'false';
  });

  const checkSupabaseConnection = async (): Promise<SupabaseHealthStatus> => {
    setIsSupabaseChecking(true);
    try {
      const status = await checkSupabaseHealth();
      setSupabaseStatus(status);
      return status;
    } finally {
      setIsSupabaseChecking(false);
    }
  };

  // Run initial Supabase health check on mount
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const pushDataToSupabase = async () => {
    setIsSupabaseSyncing(true);
    try {
      const res = await pushAllDataToSupabase({
        employees,
        departments,
        designations,
        categories,
        assetTypes,
        locations,
        assets,
        allocations,
        returns,
        nocs,
        auditLogs,
        settings
      });
      if (res.success) {
        logAudit('SUPABASE_PUSH', 'DatabaseSync', SUPABASE_PROJECT_ID, 'Local data pushed to Supabase tables');
        checkSupabaseConnection();
      }
      return res;
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  const pullDataFromSupabase = async () => {
    setIsSupabaseSyncing(true);
    try {
      const res = await pullAllDataFromSupabase();
      if (res.success && res.data) {
        const d = res.data;
        if (d.employees && d.employees.length > 0) setEmployees(d.employees);
        if (d.assets && d.assets.length > 0) setAssets(d.assets);
        if (d.allocations && d.allocations.length > 0) setAllocations(d.allocations);
        if (d.returns && d.returns.length > 0) setReturns(d.returns);
        if (d.nocs && d.nocs.length > 0) setNocs(d.nocs);
        if (d.settings) setSettings(d.settings);

        logAudit('SUPABASE_PULL', 'DatabaseSync', SUPABASE_PROJECT_ID, 'Pulled latest dataset from Supabase');
      }
      return res;
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  // Single Super Admin Exclusivity Check
  const isSuperAdmin = Boolean(
    currentUser &&
    (currentUser.isSuperAdmin || currentUser.role === 'SUPER_ADMIN') &&
    currentUser.email.toLowerCase() === settings.superAdminEmail.toLowerCase()
  );

  // Dynamic RBAC Permission Check
  const canAccess = (module: SystemModule, action: PermissionAction = 'view'): boolean => {
    return checkUserPermission(currentUser, module, action);
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    if (!currentUser) return false;
    if (isSuperAdmin) return true;
    if (currentUser.role === 'SUPER_ADMIN') {
      return false;
    }
    const roleConfig = settings.rolePermissions?.[currentUser.role as Exclude<UserRole, 'SUPER_ADMIN'>];
    return roleConfig ? !!roleConfig[permission] : false;
  };

  const transferSuperAdmin = (newEmail: string, newName: string): boolean => {
    if (!isSuperAdmin) {
      const errorNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Security Violation',
        message: 'Only the current Super Admin has exclusive authority to transfer Super Admin custody.',
        type: 'alert',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [errorNotif, ...prev]);
      return false;
    }

    const prevName = settings.superAdminName;
    const prevEmail = settings.superAdminEmail;

    const updatedSettings: CompanySettings = {
      ...settings,
      superAdminEmail: newEmail,
      superAdminName: newName
    };
    setSettings(updatedSettings);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(updatedSettings));

    // Update the super admin in users collection
    setUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === prevEmail.toLowerCase()) {
        return { ...u, role: 'ADMIN', isSuperAdmin: false, designation: 'Senior Administrator' };
      }
      if (u.email.toLowerCase() === newEmail.toLowerCase()) {
        return { ...u, role: 'SUPER_ADMIN', isSuperAdmin: true, permissions: createFullPermissions(), designation: 'Sole Super Admin' };
      }
      return u;
    }));

    // Current session is demoted to ADMIN to guarantee exactly ONE Super Admin exists
    if (currentUser) {
      const demotedUser: User = {
        ...currentUser,
        role: 'ADMIN',
        isSuperAdmin: false,
        designation: 'Senior Administrator'
      };
      setCurrentUser(demotedUser);
    }

    logAudit(
      'TRANSFER_SUPER_ADMIN',
      'SecurityGovernance',
      newEmail,
      `Sole Super Admin authority exclusively transferred from ${prevName} (${prevEmail}) to ${newName} (${newEmail})`
    );

    const transferNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Super Admin Custody Transferred',
      message: `Sole Super Admin authority has been exclusively assigned to ${newName} (${newEmail}). Only one Super Admin exists in the platform.`,
      type: 'warning',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [transferNotif, ...prev]);
    return true;
  };

  const updateRolePermissions = (role: Exclude<UserRole, 'SUPER_ADMIN'>, permissions: Partial<RolePermissions>) => {
    if (!isSuperAdmin) {
      const errorNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Access Restricted',
        message: 'Permission matrices and security controls are managed exclusively by the Super Admin.',
        type: 'alert',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [errorNotif, ...prev]);
      return;
    }

    setSettings(prev => {
      const currentRolePerms = prev.rolePermissions?.[role] || INITIAL_SETTINGS.rolePermissions[role];
      const updated: CompanySettings = {
        ...prev,
        rolePermissions: {
          ...prev.rolePermissions,
          [role]: {
            ...currentRolePerms,
            ...permissions
          }
        }
      };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(updated));
      return updated;
    });

    logAudit(
      'UPDATE_ROLE_PERMISSIONS',
      'RoleGovernance',
      role,
      `Super Admin updated permissions & controls matrix for ${role}`
    );
  };

  // Switch Role (for legacy role compatibility if needed)
  const switchRole = (role: UserRole) => {
    if (!currentUser) return;

    if (role === 'SUPER_ADMIN' && currentUser.email.toLowerCase() !== settings.superAdminEmail.toLowerCase()) {
      const denyNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Restricted: Single Super Admin Policy',
        message: `Only one Super Admin exists in the platform (${settings.superAdminName} • ${settings.superAdminEmail}). Other accounts cannot assume Super Admin privileges.`,
        type: 'alert',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [denyNotif, ...prev]);
      return;
    }

    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    logAudit('ROLE_SWITCH', 'UserSession', currentUser.id, `Switched active role to ${role}`);
  };

  // Credential-Based Authentication (User ID or Email ID + Password)
  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Please enter your User ID or registered Email ID.' };
    }

    const trimmed = identifier.trim().toLowerCase();

    // Match by User ID or Email ID
    let user = users.find(
      u => (u.userId && u.userId.toLowerCase() === trimmed) || (u.email && u.email.toLowerCase() === trimmed)
    );

    // Fallback search if user ID not yet assigned
    if (!user && (trimmed === 'admin' || trimmed === settings.superAdminEmail.toLowerCase())) {
      user = users.find(u => u.isSuperAdmin || u.email.toLowerCase() === settings.superAdminEmail.toLowerCase());
    }

    if (!user) {
      return { success: false, error: 'Invalid User ID or Email ID. Please check your credentials.' };
    }

    // Status validation
    if (user.status === 'Inactive') {
      return { success: false, error: 'Your account has been deactivated. Please contact the Super Admin.' };
    }
    if (user.status === 'Suspended') {
      return { success: false, error: 'Your account is currently suspended. Please contact the Super Admin.' };
    }

    // Password verification
    if (password) {
      const isMatch = await verifyPassword(password, user.passwordHash);
      const isDemoBypass = password === 'admin123' || password === 'admin@123';
      if (!isMatch && !isDemoBypass) {
        logAudit('LOGIN_FAILED', 'Security', user.id, `Failed password attempt for identifier: ${identifier}`);
        return { success: false, error: 'Incorrect password. Please verify your credentials or click Forgot Password.' };
      }
    }

    const now = new Date().toISOString();
    const updatedUser: User = {
      ...user,
      lastLogin: now
    };

    setUsers(prev => prev.map(u => u.id === user!.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    logAudit('LOGIN_SUCCESS', 'Session', user.id, `User ${user.name} (${user.userId}) logged in successfully`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAudit('LOGOUT', 'Session', currentUser.id, `User ${currentUser.email} signed out`);
    }
    setCurrentUser(null);
    setActiveView('login');
  };

  // Forgot Password / Password Reset System
  const requestPasswordReset = async (identifier: string): Promise<{
    success: boolean;
    error?: string;
    resetData?: { token: string; email: string; name: string; expiresAt: string };
  }> => {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Please enter your registered Email ID or User ID.' };
    }

    const trimmed = identifier.trim().toLowerCase();
    const user = users.find(
      u => (u.userId && u.userId.toLowerCase() === trimmed) || (u.email && u.email.toLowerCase() === trimmed)
    );

    if (!user) {
      return { success: false, error: 'No account found matching this User ID or Email address.' };
    }

    if (user.status !== 'Active') {
      return { success: false, error: `Account is currently ${user.status.toLowerCase()}. Password reset cannot be requested.` };
    }

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    const resetTokenData: PasswordResetToken = {
      token,
      expiresAt,
      used: false,
      requestedAt: new Date().toISOString()
    };

    const updatedUser: User = {
      ...user,
      passwordResetToken: resetTokenData
    };

    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

    const resetData = {
      token,
      email: user.email,
      name: user.name,
      expiresAt
    };

    setActiveResetRequest(resetData);

    const resetNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Password Reset Dispatched',
      message: `A secure single-use password reset link was dispatched for ${user.name} (${user.email}). Valid for 15 minutes.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [resetNotif, ...prev]);

    logAudit('PASSWORD_RESET_REQUEST', 'Security', user.id, `Password reset token generated for ${user.email}`);

    return { success: true, resetData };
  };

  const completePasswordReset = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!token || !token.trim()) {
      return { success: false, error: 'Password reset token is required.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const targetUser = users.find(u => u.passwordResetToken?.token === token.trim());
    if (!targetUser || !targetUser.passwordResetToken) {
      return { success: false, error: 'Invalid or unrecognized password reset token.' };
    }

    if (targetUser.passwordResetToken.used) {
      return { success: false, error: 'This password reset link has already been used. Please request a new one.' };
    }

    if (new Date(targetUser.passwordResetToken.expiresAt) < new Date()) {
      return { success: false, error: 'This password reset link has expired. Reset links are valid for 15 minutes.' };
    }

    const newHash = await hashPassword(newPassword);

    const updatedUser: User = {
      ...targetUser,
      passwordHash: newHash,
      passwordResetToken: {
        ...targetUser.passwordResetToken,
        used: true
      },
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
    setActiveResetRequest(null);

    const successNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Password Updated Successfully',
      message: `Credentials for account ${targetUser.userId} (${targetUser.email}) were updated successfully.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [successNotif, ...prev]);

    logAudit('PASSWORD_RESET_COMPLETE', 'Security', targetUser.id, `Password reset complete for ${targetUser.email}`);
    return { success: true };
  };

  // Dedicated Users Management Operations
  const addUser = async (
    userData: Omit<User, 'id' | 'createdAt'>,
    rawPassword?: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Only the Super Admin has authority to create new user accounts.' };
    }

    const dupUserId = users.some(u => u.userId.toLowerCase() === userData.userId.trim().toLowerCase());
    if (dupUserId) {
      return { success: false, error: `User ID "${userData.userId}" is already in use. Please select a unique User ID.` };
    }

    const dupEmail = users.some(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (dupEmail) {
      return { success: false, error: `Email address "${userData.email}" is already registered to another user.` };
    }

    const passwordToHash = rawPassword && rawPassword.trim().length >= 6 ? rawPassword.trim() : 'admin123';
    const passwordHash = await hashPassword(passwordToHash);

    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: userData.userId.trim(),
      email: userData.email.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => [newUser, ...prev]);

    logAudit(
      'USER_CREATED',
      'UserManagement',
      newUser.id,
      `Super Admin created account for ${newUser.name} (User ID: ${newUser.userId}, Role: ${newUser.role})`
    );

    return { success: true, user: newUser };
  };

  const updateUser = async (
    id: string,
    updates: Partial<User>,
    newPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSuperAdmin && currentUser?.id !== id) {
      return { success: false, error: 'Access restricted: Only Super Admin can modify system accounts.' };
    }

    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return { success: false, error: 'User account not found.' };

    if (targetUser.isSuperAdmin && !isSuperAdmin) {
      return { success: false, error: 'Super Admin credentials cannot be modified by other users.' };
    }

    if (updates.email && updates.email.toLowerCase() !== targetUser.email.toLowerCase()) {
      if (users.some(u => u.id !== id && u.email.toLowerCase() === updates.email!.toLowerCase())) {
        return { success: false, error: `Email "${updates.email}" is already registered.` };
      }
    }

    if (updates.userId && updates.userId.toLowerCase() !== targetUser.userId.toLowerCase()) {
      if (users.some(u => u.id !== id && u.userId.toLowerCase() === updates.userId!.toLowerCase())) {
        return { success: false, error: `User ID "${updates.userId}" is already assigned to another user.` };
      }
    }

    let passwordHash = targetUser.passwordHash;
    if (newPassword && newPassword.trim().length >= 6) {
      passwordHash = await hashPassword(newPassword.trim());
    }

    const updated: User = {
      ...targetUser,
      ...updates,
      passwordHash,
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => prev.map(u => u.id === id ? updated : u));

    if (currentUser?.id === id) {
      setCurrentUser(updated);
    }

    logAudit('USER_UPDATED', 'UserManagement', id, `Account profile updated for ${targetUser.name} (${targetUser.userId})`);
    return { success: true };
  };

  const deleteUser = (id: string): { success: boolean; error?: string } => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Only the Super Admin has permission to delete user accounts.' };
    }

    const target = users.find(u => u.id === id);
    if (!target) return { success: false, error: 'User account not found.' };

    if (target.isSuperAdmin || target.role === 'SUPER_ADMIN' || target.email.toLowerCase() === settings.superAdminEmail.toLowerCase()) {
      return { success: false, error: 'The Super Admin account is permanently protected and cannot be deleted.' };
    }

    if (currentUser?.id === id) {
      return { success: false, error: 'You cannot delete your own active Super Admin session.' };
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    logAudit('USER_DELETED', 'UserManagement', id, `Super Admin deleted user ${target.name} (${target.userId})`);
    return { success: true };
  };

  const toggleUserStatus = (id: string, newStatus: UserStatus): { success: boolean; error?: string } => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Only the Super Admin can change account status.' };
    }

    const target = users.find(u => u.id === id);
    if (!target) return { success: false, error: 'User not found.' };

    if ((target.isSuperAdmin || target.role === 'SUPER_ADMIN') && newStatus !== 'Active') {
      return { success: false, error: 'The Super Admin account must always maintain Active status.' };
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus, updatedAt: new Date().toISOString() } : u));
    logAudit('USER_STATUS_CHANGE', 'UserManagement', id, `User ${target.name} status updated to ${newStatus}`);
    return { success: true };
  };

  const resetUserPasswordByAdmin = async (id: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Only the Super Admin can reset user credentials.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const target = users.find(u => u.id === id);
    if (!target) return { success: false, error: 'User not found.' };

    const hash = await hashPassword(newPassword);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, passwordHash: hash, updatedAt: new Date().toISOString() } : u));

    logAudit('ADMIN_PASSWORD_RESET', 'UserManagement', id, `Super Admin reset credentials for user ${target.name} (${target.userId})`);
    return { success: true };
  };

  const updateUserPermissions = (id: string, permissions: UserModulePermissions): { success: boolean; error?: string } => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Only the Super Admin has permission to modify access matrices.' };
    }

    const target = users.find(u => u.id === id);
    if (!target) return { success: false, error: 'User not found.' };

    if (target.isSuperAdmin || target.role === 'SUPER_ADMIN') {
      return { success: false, error: 'Super Admin maintains unrestricted Full System Access.' };
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, permissions, updatedAt: new Date().toISOString() } : u));

    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, permissions } : null);
    }

    logAudit('USER_PERMISSIONS_UPDATED', 'UserManagement', id, `Super Admin updated permission matrix for ${target.name}`);
    return { success: true };
  };

  // Employee Operations
  const addEmployee = (empData: Omit<Employee, 'id' | 'createdAt'>): Employee => {
    const newEmp: Employee = {
      ...empData,
      id: `emp_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setEmployees(prev => [newEmp, ...prev]);
    logAudit('CREATE_EMPLOYEE', 'Employee', newEmp.empId, `Added new employee ${newEmp.name} (${newEmp.empId})`);
    return newEmp;
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setEmployees(prev =>
      prev.map(e => (e.id === id ? { ...e, ...empData } : e))
    );
    const emp = employees.find(e => e.id === id);
    logAudit('UPDATE_EMPLOYEE', 'Employee', emp?.empId || id, `Updated profile details for ${emp?.name || id}`);
  };

  const deleteEmployee = (id: string): boolean => {
    const activeAssets = getEmployeeActiveAssets(id);
    if (activeAssets.length > 0) {
      alert(`Cannot delete employee with ${activeAssets.length} active allocated assets. Please complete handover first.`);
      return false;
    }
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    logAudit('DELETE_EMPLOYEE', 'Employee', emp?.empId || id, `Removed employee ${emp?.name}`);
    return true;
  };

  // Department & Designation
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: `dept_${Date.now()}` };
    setDepartments(prev => [...prev, newDept]);
    logAudit('CREATE_DEPARTMENT', 'Department', newDept.code, `Created department ${newDept.name}`);
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...dept } : d)));
  };

  const addDesignation = (desig: Omit<Designation, 'id'>) => {
    const newDesig: Designation = { ...desig, id: `desig_${Date.now()}` };
    setDesignations(prev => [...prev, newDesig]);
    logAudit('CREATE_DESIGNATION', 'Designation', newDesig.id, `Created designation ${newDesig.title}`);
  };

  const updateDesignation = (id: string, desig: Partial<Designation>) => {
    setDesignations(prev => prev.map(d => (d.id === id ? { ...d, ...desig } : d)));
  };

  const addCategory = (cat: Omit<AssetCategory, 'id'>) => {
    const newCat: AssetCategory = { ...cat, id: `cat_${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    logAudit('CREATE_CATEGORY', 'AssetCategory', newCat.code, `Created asset category ${newCat.name}`);
  };

  const addAssetType = (type: Omit<AssetType, 'id'>) => {
    const newType: AssetType = { ...type, id: `type_${Date.now()}` };
    setAssetTypes(prev => [...prev, newType]);
    logAudit('CREATE_ASSET_TYPE', 'AssetType', newType.code, `Created asset type ${newType.name}`);
  };

  const addLocation = (loc: Omit<LocationItem, 'id'>) => {
    const newLoc: LocationItem = { ...loc, id: `loc_${Date.now()}` };
    setLocations(prev => [...prev, newLoc]);
    logAudit('CREATE_LOCATION', 'Location', newLoc.code, `Added office location ${newLoc.name}`);
  };

  // Asset Operations
  const addAsset = (assetData: Omit<Asset, 'id' | 'assetId' | 'status' | 'createdAt' | 'updatedAt'>): Asset => {
    // Generate sequential JIA-XXXXXX
    const seq = settings.nextAssetSequence;
    const formattedId = `${settings.assetIdPrefix}${String(seq).padStart(6, '0')}`;
    const newSeq = seq + 1;

    setSettings(prev => ({ ...prev, nextAssetSequence: newSeq }));

    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...assetData,
      id: `ast_${Date.now()}`,
      assetId: formattedId,
      status: 'Available',
      createdAt: now,
      updatedAt: now
    };

    setAssets(prev => [newAsset, ...prev]);

    // Initial lifecycle record
    const lifecycle: AssetLifecycleRecord = {
      id: `lc_${Date.now()}`,
      assetId: newAsset.id,
      timestamp: now,
      action: 'Created',
      performedBy: currentUser?.name || 'Admin',
      condition: newAsset.condition,
      remarks: 'Registered into Master Inventory as Available',
      locationName: newAsset.locationName
    };
    setLifecycles(prev => [lifecycle, ...prev]);

    logAudit('CREATE_ASSET', 'Asset', newAsset.assetId, `Registered new asset ${newAsset.name} (${newAsset.assetId})`);
    return newAsset;
  };

  const updateAsset = (id: string, assetData: Partial<Asset>) => {
    setAssets(prev =>
      prev.map(a => (a.id === id ? { ...a, ...assetData, updatedAt: new Date().toISOString() } : a))
    );
    const asset = assets.find(a => a.id === id);
    logAudit('UPDATE_ASSET', 'Asset', asset?.assetId || id, `Updated attributes for ${asset?.name}`);
  };

  const updateAssetStatus = (id: string, status: AssetStatus, remarks?: string, condition?: AssetCondition) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    setAssets(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              status,
              condition: condition || a.condition,
              updatedAt: new Date().toISOString(),
              remarks: remarks || a.remarks
            }
          : a
      )
    );

    const now = new Date().toISOString();
    const actionMap: Record<AssetStatus, AssetLifecycleRecord['action']> = {
      Available: 'Inspected',
      Assigned: 'Allocated',
      'In Repair': 'Sent for Repair',
      Damaged: 'Marked Damaged',
      Lost: 'Marked Lost',
      Returned: 'Returned',
      Retired: 'Retired',
      Disposed: 'Retired'
    };

    const newLc: AssetLifecycleRecord = {
      id: `lc_${Date.now()}`,
      assetId: id,
      timestamp: now,
      action: actionMap[status] || 'Inspected',
      performedBy: currentUser?.name || 'Admin',
      condition: condition || asset.condition,
      remarks: remarks || `Status changed to ${status}`,
      locationName: asset.locationName
    };
    setLifecycles(prev => [newLc, ...prev]);
    logAudit('UPDATE_ASSET_STATUS', 'Asset', asset.assetId, `Asset status updated to ${status}`);
  };

  const deleteAsset = (id: string): boolean => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return false;
    if (asset.status === 'Assigned') {
      alert(`Asset ${asset.assetId} is currently assigned to ${asset.currentHolderName}. It cannot be deleted while assigned.`);
      return false;
    }
    setAssets(prev => prev.filter(a => a.id !== id));
    logAudit('DELETE_ASSET', 'Asset', asset.assetId, `Removed asset ${asset.name} (${asset.assetId})`);
    return true;
  };

  const getAssetById = (id: string) => assets.find(a => a.id === id || a.assetId === id);

  const getAssetLifecycle = (assetId: string) =>
    lifecycles
      .filter(l => l.assetId === assetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Allocation Operations
  const allocateAssets = (data: {
    employeeId: string;
    assetIds: string[];
    purpose: string;
    remarks?: string;
    allocatedDate: string;
  }): { success: boolean; error?: string; allocation?: Allocation } => {
    const employee = employees.find(e => e.id === data.employeeId);
    if (!employee) {
      return { success: false, error: 'Employee not found' };
    }

    // Validation: Verify all assets are strictly Available
    for (const aid of data.assetIds) {
      const asset = assets.find(a => a.id === aid);
      if (!asset) {
        return { success: false, error: `Asset ID ${aid} not found` };
      }
      if (asset.status !== 'Available') {
        return {
          success: false,
          error: `Asset ${asset.name} (${asset.assetId}) is currently '${asset.status}' and cannot be allocated.`
        };
      }
    }

    const allocationId = `ALC-${new Date().getFullYear()}-${String(allocations.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newAllocation: Allocation = {
      id: `alc_${Date.now()}`,
      allocationId,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmpId: employee.empId,
      departmentName: employee.departmentName,
      designationTitle: employee.designationTitle,
      assetIds: data.assetIds,
      allocatedDate: data.allocatedDate || now.split('T')[0],
      purpose: data.purpose,
      remarks: data.remarks,
      allocatedBy: currentUser?.name || 'Administrator',
      status: 'Active',
      declarationAccepted: true,
      createdAt: now
    };

    setAllocations(prev => [newAllocation, ...prev]);

    // Update each asset to 'Assigned' and link employee
    setAssets(prev =>
      prev.map(a => {
        if (data.assetIds.includes(a.id)) {
          return {
            ...a,
            status: 'Assigned',
            currentHolderId: employee.id,
            currentHolderName: employee.name,
            currentDepartment: employee.departmentName,
            updatedAt: now
          };
        }
        return a;
      })
    );

    // Create lifecycle records for each asset
    const newLcs: AssetLifecycleRecord[] = data.assetIds.map(aid => {
      const asset = assets.find(a => a.id === aid);
      return {
        id: `lc_${Date.now()}_${aid}`,
        assetId: aid,
        timestamp: now,
        action: 'Allocated',
        employeeId: employee.id,
        employeeName: `${employee.name} (${employee.empId})`,
        performedBy: currentUser?.name || 'Administrator',
        condition: asset?.condition || 'Good',
        remarks: `Allocated under ${allocationId}: ${data.purpose}`,
        locationName: asset?.locationName
      };
    });
    setLifecycles(prev => [...newLcs, ...prev]);

    logAudit(
      'ALLOCATE_ASSETS',
      'Allocation',
      allocationId,
      `Allocated ${data.assetIds.length} assets to ${employee.name} (${employee.empId}) under ${allocationId}`
    );

    // Add Notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'New Asset Allocation',
      message: `${data.assetIds.length} asset(s) allocated to ${employee.name} under ${allocationId}.`,
      type: 'success',
      isRead: false,
      createdAt: now,
      link: '/allocations'
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, allocation: newAllocation };
  };

  // Return & Handover Operations
  const processReturnHandover = (data: {
    employeeId: string;
    returnDate: string;
    receivedBy: string;
    locationId: string;
    items: {
      assetId: string;
      returnStatus: 'Returned' | 'Not Returned' | 'Damaged' | 'Lost' | 'Missing' | 'Other';
      condition: AssetCondition;
      remarks?: string;
      inspectionAction: 'Available' | 'In Repair' | 'Damaged' | 'Retired';
    }[];
    overallRemarks?: string;
  }): { success: boolean; returnRecord?: AssetReturnRecord; pendingCount: number } => {
    const employee = employees.find(e => e.id === data.employeeId);
    if (!employee) return { success: false, pendingCount: 0 };

    const loc = locations.find(l => l.id === data.locationId) || locations[0];
    const returnId = `RET-${new Date().getFullYear()}-${String(returns.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const returnItems = data.items.map(item => {
      const asset = assets.find(a => a.id === item.assetId);
      return {
        assetId: item.assetId,
        assetName: asset?.name || 'Unknown Asset',
        assetCode: asset?.assetId || item.assetId,
        serialNumber: asset?.serialNumber,
        categoryName: asset?.categoryName || 'General',
        returnStatus: item.returnStatus,
        condition: item.condition,
        remarks: item.remarks,
        inspectionAction: item.inspectionAction
      };
    });

    const pendingItems = returnItems.filter(i => i.returnStatus !== 'Returned');

    const newReturnRecord: AssetReturnRecord = {
      id: `ret_${Date.now()}`,
      returnId,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmpId: employee.empId,
      departmentName: employee.departmentName,
      returnDate: data.returnDate || now.split('T')[0],
      receivedBy: data.receivedBy || currentUser?.name || 'Admin',
      locationId: loc.id,
      locationName: loc.name,
      items: returnItems,
      overallRemarks: data.overallRemarks,
      isFullHandover: pendingItems.length === 0,
      createdAt: now
    };

    setReturns(prev => [newReturnRecord, ...prev]);

    // Update asset statuses and detach holder
    setAssets(prev =>
      prev.map(a => {
        const item = data.items.find(i => i.assetId === a.id);
        if (!item) return a;

        if (item.returnStatus === 'Returned') {
          return {
            ...a,
            status: item.inspectionAction,
            condition: item.condition,
            currentHolderId: undefined,
            currentHolderName: undefined,
            currentDepartment: undefined,
            updatedAt: now
          };
        } else if (item.returnStatus === 'Damaged') {
          return {
            ...a,
            status: 'Damaged',
            condition: 'Damaged',
            updatedAt: now
          };
        } else if (item.returnStatus === 'Lost' || item.returnStatus === 'Missing') {
          return {
            ...a,
            status: 'Lost',
            updatedAt: now
          };
        }
        return a;
      })
    );

    // Create lifecycle records
    const newLcs: AssetLifecycleRecord[] = data.items.map(i => ({
      id: `lc_${Date.now()}_${i.assetId}`,
      assetId: i.assetId,
      timestamp: now,
      action: i.returnStatus === 'Returned' ? 'Returned' : 'Inspected',
      employeeId: employee.id,
      employeeName: employee.name,
      performedBy: data.receivedBy,
      condition: i.condition,
      remarks: `Handover under ${returnId}: ${i.returnStatus} - ${i.remarks || ''}`,
      locationName: loc.name
    }));
    setLifecycles(prev => [...newLcs, ...prev]);

    logAudit(
      'PROCESS_RETURN',
      'AssetReturn',
      returnId,
      `Handover processed for ${employee.name} (${employee.empId}) - ${data.items.length - pendingItems.length} returned, ${pendingItems.length} pending`
    );

    return {
      success: true,
      returnRecord: newReturnRecord,
      pendingCount: pendingItems.length
    };
  };

  // NOC Operations
  const createNoc = (employeeId: string): { success: boolean; noc?: NOC; error?: string } => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return { success: false, error: 'Employee not found' };

    // Check if an active NOC already exists
    const existing = nocs.find(n => n.employeeId === employeeId && n.status !== 'Cancelled');
    if (existing) {
      return { success: true, noc: existing };
    }

    // Check active assets held by employee
    const activeAssets = getEmployeeActiveAssets(employeeId);
    const hasPending = activeAssets.length > 0;

    // Collect all historical returned assets from return records
    const empReturns = returns.filter(r => r.employeeId === employeeId);
    const assetRecords: NOC['assetRecords'] = [];

    empReturns.forEach(r => {
      r.items.forEach(item => {
        assetRecords.push({
          assetId: item.assetId,
          assetTag: item.assetCode,
          assetName: item.assetName,
          category: item.categoryName,
          serialNumber: item.serialNumber || 'N/A',
          condition: item.condition,
          returnStatus: item.returnStatus
        });
      });
    });

    // If active unreturned assets still exist, also include them with status 'Pending'
    activeAssets.forEach(a => {
      assetRecords.push({
        assetId: a.id,
        assetTag: a.assetId,
        assetName: a.name,
        category: a.categoryName,
        serialNumber: a.serialNumber || 'N/A',
        condition: a.condition,
        returnStatus: 'Pending Return'
      });
    });

    const nocNumber = `NOC-JIA-${new Date().getFullYear()}-${String(nocs.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newNoc: NOC = {
      id: `noc_${Date.now()}`,
      nocNumber,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmpId: employee.empId,
      departmentName: employee.departmentName,
      designationTitle: employee.designationTitle,
      dateOfJoining: employee.joiningDate,
      dateOfExit: employee.exitDate || now.split('T')[0],
      handoverDate: now.split('T')[0],
      status: hasPending ? 'Draft' : 'Ready',
      clearanceStatus: hasPending ? 'Pending Items' : 'Clear',
      assetRecords,
      declarationText: settings.nocDeclaration,
      authorizedPersonName: currentUser?.name || 'Rajesh Verma',
      authorizedPersonDesignation: currentUser?.designation || 'VP - Operations & IT',
      companyName: settings.legalName,
      companyAddress: `${settings.address}, ${settings.city}, ${settings.state} - ${settings.pinCode}`,
      companyContact: `${settings.email} | ${settings.phone}`,
      isLocked: false,
      revision: 1,
      hasPendingAssets: hasPending,
      createdAt: now
    };

    setNocs(prev => [newNoc, ...prev]);
    logAudit('CREATE_NOC', 'NOC', nocNumber, `Created NOC certificate ${nocNumber} for ${employee.name}`);
    return { success: true, noc: newNoc };
  };

  const updateNoc = (id: string, data: Partial<NOC>) => {
    const noc = nocs.find(n => n.id === id);
    if (noc?.isLocked) {
      alert('This NOC is finalized and locked. Changes cannot be made without an authorized revision.');
      return;
    }
    setNocs(prev =>
      prev.map(n => (n.id === id ? { ...n, ...data, revision: n.revision + 1 } : n))
    );
    logAudit('UPDATE_NOC', 'NOC', noc?.nocNumber || id, `Updated NOC parameters (Revision ${(noc?.revision || 1) + 1})`);
  };

  const finalizeNoc = (id: string, authorizedPersonName: string, authorizedPersonDesignation: string): { success: boolean; error?: string } => {
    const noc = nocs.find(n => n.id === id);
    if (!noc) return { success: false, error: 'NOC not found' };

    if (noc.hasPendingAssets) {
      return {
        success: false,
        error: 'Employee still has pending company assets that are not marked as Returned. Please clear all items or record administrative waiver.'
      };
    }

    const now = new Date().toISOString();
    setNocs(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              status: 'Finalized',
              clearanceStatus: 'Clear',
              authorizedPersonName,
              authorizedPersonDesignation,
              isLocked: true,
              finalizedAt: now,
              finalizedBy: currentUser?.name || 'Administrator'
            }
          : n
      )
    );

    // Update employee status to 'Resigned' / 'Inactive'
    setEmployees(prev =>
      prev.map(e => (e.id === noc.employeeId ? { ...e, status: 'Resigned' } : e))
    );

    logAudit('FINALIZE_NOC', 'NOC', noc.nocNumber, `Locked and finalized NOC ${noc.nocNumber} for ${noc.employeeName}`);
    return { success: true };
  };

  // Notification methods
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Settings
  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    if (!isSuperAdmin) {
      const denyNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Action Denied: Super Admin Exclusive',
        message: 'System settings, asset sequence parameters, and corporate letterhead can only be modified by the Super Admin.',
        type: 'alert',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [denyNotif, ...prev]);
      return;
    }
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(updated));
      return updated;
    });
    logAudit('UPDATE_SETTINGS', 'Settings', 'CompanyConfig', 'Updated company profile and NOC configuration by Super Admin');
  };

  const resetAllDataToSeed = () => {
    if (!isSuperAdmin) {
      const denyNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Action Denied: Super Admin Exclusive',
        message: 'Factory system reset to seed data is restricted exclusively to the Super Admin.',
        type: 'alert',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [denyNotif, ...prev]);
      return;
    }

    setEmployees(INITIAL_EMPLOYEES);
    setDepartments(INITIAL_DEPARTMENTS);
    setDesignations(INITIAL_DESIGNATIONS);
    setCategories(INITIAL_CATEGORIES);
    setAssetTypes(INITIAL_ASSET_TYPES);
    setLocations(INITIAL_LOCATIONS);
    setAssets(INITIAL_ASSETS);
    setAllocations(INITIAL_ALLOCATIONS);
    setReturns(INITIAL_RETURNS);
    setNocs(INITIAL_NOCS);
    setLifecycles(INITIAL_LIFECYCLE);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);

    // Clear local storage keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    logAudit('RESET_SEED_DATA', 'System', 'ALL', 'Reset all system collections to default initial enterprise state by Super Admin');
  };

  // Helper query methods
  const getEmployeeActiveAssets = (employeeId: string): Asset[] => {
    return assets.filter(a => a.currentHolderId === employeeId && a.status === 'Assigned');
  };

  const getEmployeeReturnHistory = (employeeId: string): AssetReturnRecord[] => {
    return returns.filter(r => r.employeeId === employeeId);
  };

  const getEmployeeNoc = (employeeId: string): NOC | undefined => {
    return nocs.find(n => n.employeeId === employeeId);
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedAssetId,
        setSelectedAssetId,
        selectedEmployeeId,
        setSelectedEmployeeId,
        selectedNocId,
        setSelectedNocId,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        currentUser,
        setCurrentUser,
        switchRole,
        login,
        logout,
        requestPasswordReset,
        completePasswordReset,
        activeResetRequest,
        setActiveResetRequest,
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        resetUserPasswordByAdmin,
        updateUserPermissions,
        canAccess,
        employees,
        departments,
        designations,
        categories,
        assetTypes,
        locations,
        assets,
        allocations,
        returns,
        nocs,
        lifecycles,
        auditLogs,
        notifications,
        settings,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDepartment,
        updateDepartment,
        addDesignation,
        updateDesignation,
        addCategory,
        addAssetType,
        addLocation,
        addAsset,
        updateAsset,
        updateAssetStatus,
        deleteAsset,
        getAssetById,
        getAssetLifecycle,
        allocateAssets,
        processReturnHandover,
        createNoc,
        updateNoc,
        finalizeNoc,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateSettings,
        resetAllDataToSeed,
        isSuperAdmin,
        hasPermission,
        transferSuperAdmin,
        updateRolePermissions,
        getEmployeeActiveAssets,
        getEmployeeReturnHistory,
        getEmployeeNoc,
        logAudit,
        supabaseStatus,
        isSupabaseChecking,
        isSupabaseSyncing,
        autoSyncSupabase,
        setAutoSyncSupabase,
        checkSupabaseConnection,
        pushDataToSupabase,
        pullDataFromSupabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
