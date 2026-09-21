export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export type SystemModule =
  | 'dashboard'
  | 'assets'
  | 'allocations'
  | 'returns'
  | 'noc'
  | 'employees'
  | 'master'
  | 'users'
  | 'reports'
  | 'audit_logs'
  | 'settings';

export type PermissionAction =
  | 'view'
  | 'add'
  | 'edit'
  | 'delete'
  | 'export'
  | 'print'
  | 'approve'
  | 'manage';

export interface ModulePermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  print?: boolean;
  approve?: boolean;
  manage?: boolean;
}

export type UserModulePermissions = Record<SystemModule, ModulePermissions>;

export interface PasswordResetToken {
  token: string;
  expiresAt: string;
  used: boolean;
  requestedAt: string;
}

export interface User {
  id: string;
  userId: string; // e.g. "admin", "ZLS-ADM-01"
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  department: string;
  designation: string;
  status: UserStatus;
  passwordHash: string;
  isSuperAdmin?: boolean;
  permissions: UserModulePermissions;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  passwordResetToken?: PasswordResetToken;
}

export type EmployeeType = 'Permanent' | 'Contract' | 'Intern' | 'Temporary' | 'Other';
export type EmployeeStatus = 'Active' | 'Inactive' | 'Resigned' | 'Terminated' | 'Transferred';

export interface Employee {
  id: string;
  empId: string; // e.g. EMP-1001
  name: string;
  photo?: string;
  email: string;
  phone: string;
  altPhone?: string;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationTitle: string;
  joiningDate: string;
  exitDate?: string;
  employeeType: EmployeeType;
  reportingManager?: string;
  workLocationId: string;
  workLocationName: string;
  address: string;
  status: EmployeeStatus;
  notes?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName?: string;
  description?: string;
  isActive: boolean;
  employeeCount?: number;
}

export interface Designation {
  id: string;
  title: string;
  departmentId: string;
  level: string; // e.g. Senior, Mid, Junior, Executive
  description?: string;
  isActive: boolean;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  iconName: string;
  description?: string;
  isActive: boolean;
}

export interface AssetType {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  requiresSerial: boolean;
  requiresImei: boolean;
  defaultDepreciationYears: number;
  isActive: boolean;
}

export interface LocationItem {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
  contactPerson?: string;
  contactPhone?: string;
  isActive: boolean;
}

export type AssetStatus = 
  | 'Available' 
  | 'Assigned' 
  | 'In Repair' 
  | 'Damaged' 
  | 'Lost' 
  | 'Returned' 
  | 'Retired' 
  | 'Disposed';

export type AssetCondition = 'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged' | 'Non-Functional';

export interface AssetLifecycleRecord {
  id: string;
  assetId: string;
  timestamp: string;
  action: 'Created' | 'Allocated' | 'Returned' | 'Inspected' | 'Sent for Repair' | 'Repaired' | 'Marked Damaged' | 'Marked Lost' | 'Retired';
  employeeId?: string;
  employeeName?: string;
  performedBy: string;
  condition: AssetCondition;
  remarks: string;
  locationName?: string;
}

export interface Asset {
  id: string;
  assetId: string; // e.g. JIA-000101
  name: string;
  categoryId: string;
  categoryName: string;
  typeId: string;
  typeName: string;
  brand: string;
  model: string;
  serialNumber: string;
  imeiNumber?: string;
  assetTag: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry: string;
  condition: AssetCondition;
  locationId: string;
  locationName: string;
  status: AssetStatus;
  description?: string;
  imageUrl?: string;
  remarks?: string;
  currentHolderId?: string;
  currentHolderName?: string;
  currentDepartment?: string;
  currentLocationGeo?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
    capturedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Allocation {
  id: string;
  allocationId: string; // e.g. ALC-2026-001
  employeeId: string;
  employeeName: string;
  employeeEmpId: string;
  departmentName: string;
  designationTitle: string;
  assetIds: string[];
  allocatedDate: string;
  purpose: string;
  remarks?: string;
  allocatedBy: string;
  status: 'Active' | 'Returned' | 'Partially Returned';
  declarationAccepted: boolean;
  createdAt: string;
}

export interface ReturnItem {
  assetId: string;
  assetName: string;
  assetCode: string;
  serialNumber?: string;
  categoryName: string;
  returnStatus: 'Returned' | 'Not Returned' | 'Damaged' | 'Lost' | 'Missing' | 'Other';
  condition: AssetCondition;
  remarks?: string;
  inspectionAction: 'Available' | 'In Repair' | 'Damaged' | 'Retired';
}

export interface AssetReturnRecord {
  id: string;
  returnId: string; // e.g. RET-2026-001
  employeeId: string;
  employeeName: string;
  employeeEmpId: string;
  departmentName: string;
  returnDate: string;
  receivedBy: string;
  locationId: string;
  locationName: string;
  items: ReturnItem[];
  overallRemarks?: string;
  isFullHandover: boolean;
  createdAt: string;
}

export type NocStatus = 'Draft' | 'Pending Review' | 'Ready' | 'Finalized' | 'Cancelled';
export type NocClearanceStatus = 'Clear' | 'Pending Items' | 'Conditional Approval';

export interface NocAssetRecord {
  assetId: string;
  assetTag: string;
  assetName: string;
  category: string;
  serialNumber: string;
  condition: string;
  returnStatus: string;
}

export interface NOC {
  id: string;
  nocNumber: string; // e.g. NOC-JIA-2026-001
  employeeId: string;
  employeeName: string;
  employeeEmpId: string;
  departmentName: string;
  designationTitle: string;
  dateOfJoining: string;
  dateOfExit: string;
  handoverDate: string;
  status: NocStatus;
  clearanceStatus: NocClearanceStatus;
  assetRecords: NocAssetRecord[];
  declarationText: string;
  authorizedPersonName: string;
  authorizedPersonDesignation: string;
  companyName: string;
  companyAddress: string;
  companyContact: string;
  isLocked: boolean;
  finalizedAt?: string;
  finalizedBy?: string;
  revision: number;
  notes?: string;
  hasPendingAssets: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export type ReturnType = 'Exit Handover' | 'Regular Return' | 'Hardware Upgrade' | 'Damaged / Maintenance';

export interface RolePermissions {
  canManageMasterData: boolean;
  canRegisterAssets: boolean;
  canAllocateAssets: boolean;
  canProcessReturns: boolean;
  canGenerateNOC: boolean;
  canFinalizeNOC: boolean;
  canDeleteRecords: boolean;
  canExportReports: boolean;
  canViewFinancials: boolean;
}

export interface CompanySettings {
  companyName: string;
  legalName: string;
  tagline: string;
  brandName: string;
  cin?: string;
  gstin?: string;
  currencySymbol?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  nocHeaderTitle: string;
  nocDeclaration: string;
  assetIdPrefix: string;
  nextAssetSequence: number;
  // Single Super Admin Exclusivity Governance
  superAdminId: string;
  superAdminName: string;
  superAdminEmail: string;
  rolePermissions: {
    ADMIN: RolePermissions;
    MANAGER: RolePermissions;
    STAFF: RolePermissions;
    VIEWER: RolePermissions;
  };
  smtpConfig: {
    host: string;
    port: number;
    user: string;
    enabled: boolean;
  };
}
