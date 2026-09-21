import { User, SystemModule, PermissionAction, UserModulePermissions, ModulePermissions } from '../types';

/**
 * SHA-256 hash using the standard Web Crypto API.
 * Secure, irreversible password hashing.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against stored SHA-256 hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;
  const computed = await hashPassword(password);
  return computed.toLowerCase() === storedHash.toLowerCase();
}

/**
 * Generate cryptographically secure reset token.
 */
export function generateResetToken(): string {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  return `RST-${hex.slice(0, 8).toUpperCase()}-${hex.slice(8, 16).toUpperCase()}`;
}

export const ALL_MODULE_IDS: SystemModule[] = [
  'dashboard',
  'assets',
  'allocations',
  'returns',
  'noc',
  'employees',
  'master',
  'users',
  'reports',
  'audit_logs',
  'settings'
];

export const SYSTEM_MODULES_CONFIG: {
  id: SystemModule;
  label: string;
  description: string;
  supportedActions: PermissionAction[];
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'System overview, KPI cards, real-time activity and asset distribution',
    supportedActions: ['view', 'export']
  },
  {
    id: 'assets',
    label: 'Assets Register',
    description: 'Asset repository, serials, QR/barcodes, status tracking and specifications',
    supportedActions: ['view', 'add', 'edit', 'delete', 'export', 'print', 'manage']
  },
  {
    id: 'allocations',
    label: 'Asset Allocations',
    description: 'Asset issuance to staff, declaration signing, and assignment records',
    supportedActions: ['view', 'add', 'edit', 'delete', 'export', 'print', 'approve']
  },
  {
    id: 'returns',
    label: 'Returns & Handover',
    description: 'Hardware check-in, physical inspection condition and exit handover receipts',
    supportedActions: ['view', 'add', 'edit', 'delete', 'export', 'print', 'approve']
  },
  {
    id: 'noc',
    label: 'NOC Clearances',
    description: 'No Objection Certificate generation, exit clearance and formal seal issuance',
    supportedActions: ['view', 'add', 'edit', 'delete', 'export', 'print', 'approve', 'manage']
  },
  {
    id: 'employees',
    label: 'Employees Directory',
    description: 'Staff profiles, designations, department mapping and active holdings',
    supportedActions: ['view', 'add', 'edit', 'delete', 'export', 'manage']
  },
  {
    id: 'master',
    label: 'Master Data',
    description: 'Departments, designations, asset categories, hardware types and branch locations',
    supportedActions: ['view', 'add', 'edit', 'delete', 'export', 'manage']
  },
  {
    id: 'users',
    label: 'Users & Access Control',
    description: 'User accounts, credential resets, status toggles and RBAC permission matrices',
    supportedActions: ['view', 'add', 'edit', 'delete', 'export', 'manage']
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    description: 'Financial asset registers, depreciation reports and exportable audit tables',
    supportedActions: ['view', 'export', 'print']
  },
  {
    id: 'audit_logs',
    label: 'Audit Trail',
    description: 'Immutable system event log, user action timestamps and security logs',
    supportedActions: ['view', 'export']
  },
  {
    id: 'settings',
    label: 'System Settings',
    description: 'Company legal profiles, branding configuration and Supabase Cloud DB connection',
    supportedActions: ['view', 'edit', 'manage']
  }
];

export function createFullPermissions(): UserModulePermissions {
  const perms: Partial<UserModulePermissions> = {};
  for (const mod of ALL_MODULE_IDS) {
    perms[mod] = {
      view: true,
      add: true,
      edit: true,
      delete: true,
      export: true,
      print: true,
      approve: true,
      manage: true
    };
  }
  return perms as UserModulePermissions;
}

export function createEmptyPermissions(): UserModulePermissions {
  const perms: Partial<UserModulePermissions> = {};
  for (const mod of ALL_MODULE_IDS) {
    perms[mod] = {
      view: false,
      add: false,
      edit: false,
      delete: false,
      export: false,
      print: false,
      approve: false,
      manage: false
    };
  }
  return perms as UserModulePermissions;
}

export function createRolePresetPermissions(role: string): UserModulePermissions {
  if (role === 'SUPER_ADMIN') {
    return createFullPermissions();
  }

  const perms = createEmptyPermissions();

  if (role === 'ADMIN') {
    // Admin has almost everything except deleting system settings or super admin user management
    for (const mod of ALL_MODULE_IDS) {
      perms[mod] = {
        view: true,
        add: true,
        edit: true,
        delete: mod !== 'settings' && mod !== 'audit_logs',
        export: true,
        print: true,
        approve: true,
        manage: mod !== 'settings'
      };
    }
    // Limited permissions on users
    perms.users = {
      view: true,
      add: true,
      edit: true,
      delete: false,
      export: true,
      manage: false
    };
  } else if (role === 'MANAGER') {
    // Manager has operational view & edit, allocations, returns, noc
    perms.dashboard = { view: true, add: false, edit: false, delete: false, export: true };
    perms.assets = { view: true, add: true, edit: true, delete: false, export: true, print: true, manage: false };
    perms.allocations = { view: true, add: true, edit: true, delete: false, export: true, print: true, approve: true };
    perms.returns = { view: true, add: true, edit: true, delete: false, export: true, print: true, approve: true };
    perms.noc = { view: true, add: true, edit: true, delete: false, export: true, print: true, approve: true, manage: false };
    perms.employees = { view: true, add: true, edit: true, delete: false, export: true, manage: false };
    perms.master = { view: true, add: false, edit: false, delete: false, export: true, manage: false };
    perms.users = { view: false, add: false, edit: false, delete: false, export: false, manage: false };
    perms.reports = { view: true, add: false, edit: false, delete: false, export: true, print: true };
    perms.audit_logs = { view: false, add: false, edit: false, delete: false, export: false };
    perms.settings = { view: false, add: false, edit: false, delete: false, export: false, manage: false };
  } else if (role === 'STAFF') {
    // Staff can view assets, process returns, view basic allocations
    perms.dashboard = { view: true, add: false, edit: false, delete: false, export: false };
    perms.assets = { view: true, add: false, edit: false, delete: false, export: false, print: true };
    perms.allocations = { view: true, add: false, edit: false, delete: false, export: false, print: true };
    perms.returns = { view: true, add: true, edit: false, delete: false, export: false, print: true };
    perms.noc = { view: true, add: false, edit: false, delete: false, export: false, print: true };
    perms.employees = { view: true, add: false, edit: false, delete: false, export: false };
    perms.master = { view: false, add: false, edit: false, delete: false, export: false };
    perms.users = { view: false, add: false, edit: false, delete: false, export: false };
    perms.reports = { view: false, add: false, edit: false, delete: false, export: false };
    perms.audit_logs = { view: false, add: false, edit: false, delete: false, export: false };
    perms.settings = { view: false, add: false, edit: false, delete: false, export: false };
  } else if (role === 'VIEWER') {
    // Read only on selected modules
    perms.dashboard = { view: true, add: false, edit: false, delete: false, export: false };
    perms.assets = { view: true, add: false, edit: false, delete: false, export: false };
    perms.allocations = { view: true, add: false, edit: false, delete: false, export: false };
    perms.returns = { view: true, add: false, edit: false, delete: false, export: false };
    perms.noc = { view: true, add: false, edit: false, delete: false, export: false };
    perms.employees = { view: true, add: false, edit: false, delete: false, export: false };
    perms.master = { view: false, add: false, edit: false, delete: false, export: false };
    perms.users = { view: false, add: false, edit: false, delete: false, export: false };
    perms.reports = { view: true, add: false, edit: false, delete: false, export: true };
    perms.audit_logs = { view: false, add: false, edit: false, delete: false, export: false };
    perms.settings = { view: false, add: false, edit: false, delete: false, export: false };
  }

  return perms;
}

/**
 * Check if a given user has permission for a specific module and action.
 * Super Admin always has full access.
 */
export function checkUserPermission(
  user: User | null | undefined,
  module: SystemModule,
  action: PermissionAction = 'view'
): boolean {
  if (!user) return false;
  if (user.status !== 'Active') return false;

  // Single Super Admin has full unrestricted system access
  if (user.isSuperAdmin || user.role === 'SUPER_ADMIN') {
    return true;
  }

  const modulePerms = user.permissions?.[module];
  if (!modulePerms) return false;

  return !!modulePerms[action];
}
