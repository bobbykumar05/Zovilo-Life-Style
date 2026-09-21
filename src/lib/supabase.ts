import { createClient } from '@supabase/supabase-js';
import {
  Employee,
  Department,
  Designation,
  AssetCategory,
  AssetType,
  LocationItem,
  Asset,
  Allocation,
  AssetReturnRecord,
  NOC,
  AuditLog,
  CompanySettings
} from '../types';

// Supabase Project Credentials
export const SUPABASE_PROJECT_ID = 'ypkypaudobqbhxirxkqz';
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_ISPBTmKbzWgOQo9AVtVi_A_6VLGI6Hi';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export interface SupabaseHealthStatus {
  connected: boolean;
  checkedAt: string;
  projectId: string;
  url: string;
  tablesFound: {
    employees: boolean;
    assets: boolean;
    allocations: boolean;
    returns: boolean;
    nocs: boolean;
    audit_logs: boolean;
    company_settings: boolean;
  };
  hasTables: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Checks connection health to the Supabase backend
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const startTime = Date.now();
  const status: SupabaseHealthStatus = {
    connected: false,
    checkedAt: new Date().toISOString(),
    projectId: SUPABASE_PROJECT_ID,
    url: supabaseUrl,
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
  };

  try {
    // 1. Test basic reachability via Supabase Auth getSession or REST ping
    const authPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout to Supabase endpoint')), 6000)
    );

    await Promise.race([authPromise, timeoutPromise]);
    status.connected = true;
    status.latencyMs = Date.now() - startTime;

    // 2. Check if tables exist in PostgreSQL database
    const tableChecks = await Promise.allSettled([
      supabase.from('employees').select('id', { count: 'exact', head: true }).limit(1),
      supabase.from('assets').select('id', { count: 'exact', head: true }).limit(1),
      supabase.from('allocations').select('id', { count: 'exact', head: true }).limit(1),
      supabase.from('returns').select('id', { count: 'exact', head: true }).limit(1),
      supabase.from('nocs').select('id', { count: 'exact', head: true }).limit(1),
      supabase.from('audit_logs').select('id', { count: 'exact', head: true }).limit(1),
      supabase.from('company_settings').select('id', { count: 'exact', head: true }).limit(1)
    ]);

    const isSuccess = (res: PromiseSettledResult<any>) =>
      res.status === 'fulfilled' && !res.value.error;

    status.tablesFound.employees = isSuccess(tableChecks[0]);
    status.tablesFound.assets = isSuccess(tableChecks[1]);
    status.tablesFound.allocations = isSuccess(tableChecks[2]);
    status.tablesFound.returns = isSuccess(tableChecks[3]);
    status.tablesFound.nocs = isSuccess(tableChecks[4]);
    status.tablesFound.audit_logs = isSuccess(tableChecks[5]);
    status.tablesFound.company_settings = isSuccess(tableChecks[6]);

    status.hasTables = Object.values(status.tablesFound).some(Boolean);
  } catch (err: any) {
    status.connected = false;
    status.error = err?.message || 'Failed to establish connection with Supabase backend';
    status.latencyMs = Date.now() - startTime;
  }

  return status;
}

/**
 * PostgreSQL DDL Schema for Supabase SQL Editor
 */
export const SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- ZOVILO LIFE STYLE - ASSET & EXIT CLEARANCE MANAGEMENT SYSTEM
-- Supabase PostgreSQL Database Schema
-- Project ID: ypkypaudobqbhxirxkqz
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    emp_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    photo TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    alt_phone TEXT,
    department_id TEXT,
    department_name TEXT,
    designation_id TEXT,
    designation_title TEXT,
    joining_date TEXT,
    exit_date TEXT,
    employee_type TEXT,
    reporting_manager TEXT,
    work_location_id TEXT,
    work_location_name TEXT,
    address TEXT,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    head_name TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    employee_count INTEGER DEFAULT 0
);

-- 3. DESIGNATIONS TABLE
CREATE TABLE IF NOT EXISTS public.designations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department_id TEXT,
    level TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. ASSET CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.asset_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. ASSET TYPES TABLE
CREATE TABLE IF NOT EXISTS public.asset_types (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    requires_serial BOOLEAN DEFAULT TRUE,
    requires_imei BOOLEAN DEFAULT FALSE,
    default_depreciation_years INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    lat NUMERIC,
    lng NUMERIC,
    contact_person TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id TEXT,
    category_name TEXT,
    type_id TEXT,
    type_name TEXT,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    imei_number TEXT,
    asset_tag TEXT,
    purchase_date TEXT,
    purchase_price NUMERIC DEFAULT 0,
    warranty_expiry TEXT,
    condition TEXT DEFAULT 'Excellent',
    location_id TEXT,
    location_name TEXT,
    status TEXT DEFAULT 'Available',
    description TEXT,
    image_url TEXT,
    remarks TEXT,
    current_holder_id TEXT,
    current_holder_name TEXT,
    current_department TEXT,
    current_location_geo JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.allocations (
    id TEXT PRIMARY KEY,
    allocation_id TEXT NOT NULL UNIQUE,
    employee_id TEXT NOT NULL,
    employee_name TEXT,
    employee_emp_id TEXT,
    department_name TEXT,
    designation_title TEXT,
    asset_ids JSONB DEFAULT '[]'::jsonb,
    allocated_date TEXT,
    purpose TEXT,
    remarks TEXT,
    allocated_by TEXT,
    status TEXT DEFAULT 'Active',
    declaration_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ASSET RETURNS TABLE
CREATE TABLE IF NOT EXISTS public.returns (
    id TEXT PRIMARY KEY,
    return_id TEXT NOT NULL UNIQUE,
    employee_id TEXT NOT NULL,
    employee_name TEXT,
    employee_emp_id TEXT,
    department_name TEXT,
    return_date TEXT,
    received_by TEXT,
    location_id TEXT,
    location_name TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    overall_remarks TEXT,
    is_full_handover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOC CLEARANCE TABLE
CREATE TABLE IF NOT EXISTS public.nocs (
    id TEXT PRIMARY KEY,
    noc_number TEXT NOT NULL UNIQUE,
    employee_id TEXT NOT NULL,
    employee_name TEXT,
    employee_emp_id TEXT,
    department_name TEXT,
    designation_title TEXT,
    date_of_joining TEXT,
    date_of_exit TEXT,
    handover_date TEXT,
    status TEXT DEFAULT 'Draft',
    clearance_status TEXT DEFAULT 'Pending Items',
    asset_records JSONB DEFAULT '[]'::jsonb,
    declaration_text TEXT,
    authorized_person_name TEXT,
    authorized_person_designation TEXT,
    company_name TEXT,
    company_address TEXT,
    company_contact TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    finalized_at TEXT,
    finalized_by TEXT,
    revision INTEGER DEFAULT 1,
    notes TEXT,
    has_pending_assets BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COMPANY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.company_settings (
    id TEXT PRIMARY KEY DEFAULT 'current_settings',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- CREATE OPEN READ/WRITE POLICIES FOR ALL TABLES (FOR SECURE APPLET USE)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('employees', 'departments', 'designations', 'asset_categories', 'asset_types', 'locations', 'assets', 'allocations', 'returns', 'nocs', 'audit_logs', 'company_settings')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

-- ENABLE REALTIME PUBLICATION FOR LIVE SYNCHRONIZATION
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'assets'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE
            public.employees,
            public.assets,
            public.allocations,
            public.returns,
            public.nocs,
            public.audit_logs,
            public.company_settings;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Continue if already configured
END $$;
`;

/**
 * Pushes all in-memory/local application data to Supabase database
 */
export async function pushAllDataToSupabase(payload: {
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
  auditLogs: AuditLog[];
  settings: CompanySettings;
}): Promise<{ success: boolean; syncedCounts: Record<string, number>; error?: string }> {
  try {
    const counts: Record<string, number> = {};

    // 1. Employees
    if (payload.employees.length > 0) {
      const records = payload.employees.map(e => ({
        id: e.id,
        emp_id: e.empId,
        name: e.name,
        photo: e.photo || null,
        email: e.email,
        phone: e.phone,
        alt_phone: e.altPhone || null,
        department_id: e.departmentId,
        department_name: e.departmentName,
        designation_id: e.designationId,
        designation_title: e.designationTitle,
        joining_date: e.joiningDate,
        exit_date: e.exitDate || null,
        employee_type: e.employeeType,
        reporting_manager: e.reportingManager || null,
        work_location_id: e.workLocationId,
        work_location_name: e.workLocationName,
        address: e.address,
        status: e.status,
        notes: e.notes || null
      }));
      const { error } = await supabase.from('employees').upsert(records, { onConflict: 'id' });
      if (!error) counts.employees = records.length;
    }

    // 2. Departments
    if (payload.departments.length > 0) {
      const records = payload.departments.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        head_name: d.headName || null,
        description: d.description || null,
        is_active: d.isActive,
        employee_count: d.employeeCount || 0
      }));
      const { error } = await supabase.from('departments').upsert(records, { onConflict: 'id' });
      if (!error) counts.departments = records.length;
    }

    // 3. Designations
    if (payload.designations.length > 0) {
      const records = payload.designations.map(d => ({
        id: d.id,
        title: d.title,
        department_id: d.departmentId,
        level: d.level,
        description: d.description || null,
        is_active: d.isActive
      }));
      const { error } = await supabase.from('designations').upsert(records, { onConflict: 'id' });
      if (!error) counts.designations = records.length;
    }

    // 4. Asset Categories
    if (payload.categories.length > 0) {
      const records = payload.categories.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        icon_name: c.iconName,
        description: c.description || null,
        is_active: c.isActive
      }));
      const { error } = await supabase.from('asset_categories').upsert(records, { onConflict: 'id' });
      if (!error) counts.categories = records.length;
    }

    // 5. Asset Types
    if (payload.assetTypes.length > 0) {
      const records = payload.assetTypes.map(t => ({
        id: t.id,
        category_id: t.categoryId,
        name: t.name,
        code: t.code,
        requires_serial: t.requiresSerial,
        requires_imei: t.requiresImei,
        default_depreciation_years: t.defaultDepreciationYears,
        is_active: t.isActive
      }));
      const { error } = await supabase.from('asset_types').upsert(records, { onConflict: 'id' });
      if (!error) counts.assetTypes = records.length;
    }

    // 6. Locations
    if (payload.locations.length > 0) {
      const records = payload.locations.map(l => ({
        id: l.id,
        name: l.name,
        code: l.code,
        address: l.address,
        city: l.city,
        state: l.state,
        country: l.country,
        lat: l.lat || null,
        lng: l.lng || null,
        contact_person: l.contactPerson || null,
        contact_phone: l.contactPhone || null,
        is_active: l.isActive
      }));
      const { error } = await supabase.from('locations').upsert(records, { onConflict: 'id' });
      if (!error) counts.locations = records.length;
    }

    // 7. Assets
    if (payload.assets.length > 0) {
      const records = payload.assets.map(a => ({
        id: a.id,
        asset_id: a.assetId,
        name: a.name,
        category_id: a.categoryId,
        category_name: a.categoryName,
        type_id: a.typeId,
        type_name: a.typeName,
        serial_number: a.serialNumber || null,
        imei_number: a.imeiNumber || null,
        asset_tag: a.assetTag,
        brand: a.brand,
        model: a.model,
        purchase_date: a.purchaseDate,
        purchase_price: a.purchasePrice || 0,
        warranty_expiry: a.warrantyExpiry || null,
        status: a.status,
        condition: a.condition,
        location_id: a.locationId,
        location_name: a.locationName,
        description: a.description || null,
        image_url: a.imageUrl || null,
        remarks: a.remarks || null,
        current_holder_id: a.currentHolderId || null,
        current_holder_name: a.currentHolderName || null,
        current_department: a.currentDepartment || null,
        current_location_geo: a.currentLocationGeo || null,
        created_at: a.createdAt,
        updated_at: a.updatedAt
      }));
      const { error } = await supabase.from('assets').upsert(records, { onConflict: 'id' });
      if (!error) counts.assets = records.length;
    }

    // 8. Allocations
    if (payload.allocations.length > 0) {
      const records = payload.allocations.map(al => ({
        id: al.id,
        allocation_id: al.allocationId,
        employee_id: al.employeeId,
        employee_name: al.employeeName,
        employee_emp_id: al.employeeEmpId,
        department_name: al.departmentName,
        designation_title: al.designationTitle,
        asset_ids: al.assetIds,
        purpose: al.purpose,
        allocated_date: al.allocatedDate,
        allocated_by: al.allocatedBy,
        status: al.status,
        declaration_accepted: al.declarationAccepted,
        remarks: al.remarks || null,
        created_at: al.createdAt
      }));
      const { error } = await supabase.from('allocations').upsert(records, { onConflict: 'id' });
      if (!error) counts.allocations = records.length;
    }

    // 9. Returns
    if (payload.returns.length > 0) {
      const records = payload.returns.map(r => ({
        id: r.id,
        return_id: r.returnId,
        employee_id: r.employeeId,
        employee_name: r.employeeName,
        employee_emp_id: r.employeeEmpId,
        department_name: r.departmentName,
        return_date: r.returnDate,
        received_by: r.receivedBy,
        location_id: r.locationId,
        location_name: r.locationName,
        items: r.items,
        overall_remarks: r.overallRemarks || null,
        is_full_handover: r.isFullHandover,
        created_at: r.createdAt
      }));
      const { error } = await supabase.from('returns').upsert(records, { onConflict: 'id' });
      if (!error) counts.returns = records.length;
    }

    // 10. NOCs
    if (payload.nocs.length > 0) {
      const records = payload.nocs.map(n => ({
        id: n.id,
        noc_number: n.nocNumber,
        employee_id: n.employeeId,
        employee_name: n.employeeName,
        employee_emp_id: n.employeeEmpId,
        department_name: n.departmentName,
        designation_title: n.designationTitle,
        date_of_joining: n.dateOfJoining,
        date_of_exit: n.dateOfExit,
        handover_date: n.handoverDate,
        status: n.status,
        clearance_status: n.clearanceStatus,
        asset_records: n.assetRecords,
        declaration_text: n.declarationText,
        authorized_person_name: n.authorizedPersonName || null,
        authorized_person_designation: n.authorizedPersonDesignation || null,
        company_name: n.companyName,
        company_address: n.companyAddress,
        company_contact: n.companyContact,
        is_locked: n.isLocked,
        finalized_at: n.finalizedAt || null,
        finalized_by: n.finalizedBy || null,
        revision: n.revision,
        notes: n.notes || null,
        has_pending_assets: n.hasPendingAssets,
        created_at: n.createdAt
      }));
      const { error } = await supabase.from('nocs').upsert(records, { onConflict: 'id' });
      if (!error) counts.nocs = records.length;
    }

    // 11. Audit Logs
    if (payload.auditLogs.length > 0) {
      const records = payload.auditLogs.slice(0, 50).map(l => ({
        id: l.id,
        timestamp: l.timestamp,
        user_id: l.userId,
        user_name: l.userName,
        user_role: l.userRole,
        action: l.action,
        entity: l.entity,
        entity_id: l.entityId,
        details: l.details,
        ip_address: l.ipAddress || null
      }));
      const { error } = await supabase.from('audit_logs').upsert(records, { onConflict: 'id' });
      if (!error) counts.auditLogs = records.length;
    }

    // 12. Company Settings
    const { error: settingsError } = await supabase
      .from('company_settings')
      .upsert({ id: 'current_settings', data: payload.settings }, { onConflict: 'id' });
    if (!settingsError) counts.settings = 1;

    return { success: true, syncedCounts: counts };
  } catch (err: any) {
    return { success: false, syncedCounts: {}, error: err?.message || 'Failed to sync to Supabase' };
  }
}

/**
 * Pulls all tables from Supabase database to restore or synchronize local state
 */
export async function pullAllDataFromSupabase(): Promise<{
  success: boolean;
  data?: Partial<{
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
    auditLogs: AuditLog[];
    settings: CompanySettings;
  }>;
  error?: string;
}> {
  try {
    const results: any = {};

    // 1. Employees
    const { data: empData, error: empErr } = await supabase.from('employees').select('*');
    if (!empErr && empData && empData.length > 0) {
      results.employees = empData.map((row: any) => ({
        id: row.id,
        empId: row.emp_id,
        name: row.name,
        photo: row.photo || undefined,
        email: row.email,
        phone: row.phone,
        altPhone: row.alt_phone || undefined,
        departmentId: row.department_id,
        departmentName: row.department_name,
        designationId: row.designation_id,
        designationTitle: row.designation_title,
        joiningDate: row.joining_date,
        exitDate: row.exit_date || undefined,
        employeeType: row.employee_type,
        reportingManager: row.reporting_manager || undefined,
        workLocationId: row.work_location_id,
        workLocationName: row.work_location_name,
        address: row.address,
        status: row.status,
        notes: row.notes || undefined,
        createdAt: row.created_at || new Date().toISOString()
      }));
    }

    // 2. Assets
    const { data: assetData, error: assetErr } = await supabase.from('assets').select('*');
    if (!assetErr && assetData && assetData.length > 0) {
      results.assets = assetData.map((row: any) => ({
        id: row.id,
        assetId: row.asset_id,
        name: row.name,
        categoryId: row.category_id,
        categoryName: row.category_name || '',
        typeId: row.type_id,
        typeName: row.type_name || '',
        serialNumber: row.serial_number || '',
        imeiNumber: row.imei_number || undefined,
        assetTag: row.asset_tag || row.asset_id,
        brand: row.brand,
        model: row.model,
        purchaseDate: row.purchase_date,
        purchasePrice: Number(row.purchase_price) || 0,
        warrantyExpiry: row.warranty_expiry || '',
        status: row.status,
        condition: row.condition,
        locationId: row.location_id,
        locationName: row.location_name || '',
        description: row.description || undefined,
        imageUrl: row.image_url || undefined,
        remarks: row.remarks || undefined,
        currentHolderId: row.current_holder_id || undefined,
        currentHolderName: row.current_holder_name || undefined,
        currentDepartment: row.current_department || undefined,
        currentLocationGeo: row.current_location_geo || undefined,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString()
      }));
    }

    // 3. Allocations
    const { data: allocData, error: allocErr } = await supabase.from('allocations').select('*');
    if (!allocErr && allocData && allocData.length > 0) {
      results.allocations = allocData.map((row: any) => ({
        id: row.id,
        allocationId: row.allocation_id || row.id,
        employeeId: row.employee_id,
        employeeName: row.employee_name || '',
        employeeEmpId: row.employee_emp_id || '',
        departmentName: row.department_name || '',
        designationTitle: row.designation_title || '',
        assetIds: Array.isArray(row.asset_ids) ? row.asset_ids : [],
        purpose: row.purpose,
        allocatedDate: row.allocated_date,
        allocatedBy: row.allocated_by,
        status: row.status,
        declarationAccepted: Boolean(row.declaration_accepted),
        remarks: row.remarks || undefined,
        createdAt: row.created_at || new Date().toISOString()
      }));
    }

    // 4. Returns
    const { data: returnData, error: returnErr } = await supabase.from('returns').select('*');
    if (!returnErr && returnData && returnData.length > 0) {
      results.returns = returnData.map((row: any) => ({
        id: row.id,
        returnId: row.return_id || row.id,
        employeeId: row.employee_id,
        employeeName: row.employee_name || '',
        employeeEmpId: row.employee_emp_id || '',
        departmentName: row.department_name || '',
        returnDate: row.return_date,
        receivedBy: row.received_by,
        locationId: row.location_id,
        locationName: row.location_name || '',
        items: Array.isArray(row.items) ? row.items : [],
        overallRemarks: row.overall_remarks || undefined,
        isFullHandover: Boolean(row.is_full_handover),
        createdAt: row.created_at || new Date().toISOString()
      }));
    }

    // 5. NOCs
    const { data: nocData, error: nocErr } = await supabase.from('nocs').select('*');
    if (!nocErr && nocData && nocData.length > 0) {
      results.nocs = nocData.map((row: any) => ({
        id: row.id,
        nocNumber: row.noc_number,
        employeeId: row.employee_id,
        employeeName: row.employee_name || '',
        employeeEmpId: row.employee_emp_id || '',
        departmentName: row.department_name || '',
        designationTitle: row.designation_title || '',
        dateOfJoining: row.date_of_joining || '',
        dateOfExit: row.date_of_exit || '',
        handoverDate: row.handover_date || '',
        status: row.status,
        clearanceStatus: row.clearance_status || 'Pending Items',
        assetRecords: Array.isArray(row.asset_records) ? row.asset_records : [],
        declarationText: row.declaration_text || '',
        authorizedPersonName: row.authorized_person_name || '',
        authorizedPersonDesignation: row.authorized_person_designation || '',
        companyName: row.company_name || '',
        companyAddress: row.company_address || '',
        companyContact: row.company_contact || '',
        isLocked: Boolean(row.is_locked),
        finalizedAt: row.finalized_at || undefined,
        finalizedBy: row.finalized_by || undefined,
        revision: Number(row.revision) || 1,
        notes: row.notes || undefined,
        hasPendingAssets: Boolean(row.has_pending_assets),
        createdAt: row.created_at || new Date().toISOString()
      }));
    }

    // 6. Settings
    const { data: settingsData, error: settingsErr } = await supabase
      .from('company_settings')
      .select('data')
      .eq('id', 'current_settings')
      .single();
    if (!settingsErr && settingsData?.data) {
      results.settings = settingsData.data;
    }

    return { success: true, data: results };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to pull from Supabase' };
  }
}
