import React, { useState } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  FolderTree,
  Layers,
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Laptop,
  Mail,
  Phone,
  Calendar,
  Navigation,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  Lock,
  Crown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, Department, Designation, AssetCategory, AssetType, LocationItem, EmployeeType, EmployeeStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface MasterModuleProps {
  initialTab?: string;
}

export const MasterModule: React.FC<MasterModuleProps> = ({ initialTab = 'employees' }) => {
  const {
    employees,
    departments,
    designations,
    categories,
    assetTypes,
    locations,
    assets,
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
    setSelectedAssetId,
    setActiveView,
    hasPermission,
    isSuperAdmin,
    currentUser,
    settings
  } = useApp();

  const canManageMaster = hasPermission('canManageMasterData');
  const canDelete = hasPermission('canDeleteRecords');

  const [currentTab, setCurrentTab] = useState(initialTab.replace('master-', ''));
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Form states
  const [empForm, setEmpForm] = useState({
    empId: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designationId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employeeType: 'Permanent' as EmployeeType,
    workLocationId: '',
    address: '',
    status: 'Active' as EmployeeStatus,
    notes: ''
  });

  const [deptForm, setDeptForm] = useState({ name: '', code: '', headName: '', description: '', isActive: true });
  const [desigForm, setDesigForm] = useState({ title: '', departmentId: '', level: 'Mid', description: '', isActive: true });
  const [catForm, setCatForm] = useState({ name: '', code: '', iconName: 'Laptop', description: '', isActive: true });
  const [typeForm, setTypeForm] = useState({ categoryId: '', name: '', code: '', requiresSerial: true, requiresImei: false, defaultDepreciationYears: 3, isActive: true });
  const [locForm, setLocForm] = useState({ name: '', code: '', address: '', city: '', state: '', country: 'India', lat: 25.6127, lng: 85.1442, contactPerson: '', contactPhone: '', isActive: true });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Handlers for Employee
  const handleOpenAddEmployee = () => {
    if (!canManageMaster) return;
    setEditingEmployee(null);
    const nextId = `ZLSE-${1000 + employees.length + 1}`;
    setEmpForm({
      empId: nextId,
      name: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      designationId: designations[0]?.id || '',
      joiningDate: new Date().toISOString().split('T')[0],
      employeeType: 'Permanent',
      workLocationId: locations[0]?.id || '',
      address: '',
      status: 'Active',
      notes: ''
    });
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpForm({
      empId: emp.empId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      departmentId: emp.departmentId,
      designationId: emp.designationId,
      joiningDate: emp.joiningDate,
      employeeType: emp.employeeType,
      workLocationId: emp.workLocationId,
      address: emp.address,
      status: emp.status,
      notes: emp.notes || ''
    });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === empForm.departmentId);
    const desig = designations.find(d => d.id === empForm.designationId);
    const loc = locations.find(l => l.id === empForm.workLocationId);

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        ...empForm,
        departmentName: dept?.name || 'General',
        designationTitle: desig?.title || 'Staff',
        workLocationName: loc?.name || 'Office'
      });
    } else {
      addEmployee({
        ...empForm,
        departmentName: dept?.name || 'General',
        designationTitle: desig?.title || 'Staff',
        workLocationName: loc?.name || 'Office'
      });
    }
    setIsEmployeeModalOpen(false);
  };

  // Location detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsDetectingLocation(false);
        setLocForm(prev => ({
          ...prev,
          lat: parseFloat(pos.coords.latitude.toFixed(4)),
          lng: parseFloat(pos.coords.longitude.toFixed(4))
        }));
      },
      err => {
        setIsDetectingLocation(false);
        alert(`Location permission denied or unavailable: ${err.message}. You may enter coordinates manually.`);
      }
    );
  };

  const filteredEmployees = employees.filter(
    e =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Master Data Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure enterprise employees, departments, designations, hardware categories, types, and branch locations.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'employees', label: 'Employees', icon: Users, count: employees.length },
          { id: 'departments', label: 'Departments', icon: Building2, count: departments.length },
          { id: 'designations', label: 'Designations', icon: Briefcase, count: designations.length },
          { id: 'categories', label: 'Asset Categories', icon: FolderTree, count: categories.length },
          { id: 'types', label: 'Asset Types', icon: Layers, count: assetTypes.length },
          { id: 'locations', label: 'Locations', icon: MapPin, count: locations.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id);
                setSearchTerm('');
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Permission Restriction Notice if not allowed to manage master */}
      {!canManageMaster && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Master Data Read-Only:</strong> Modifications to corporate master records are restricted by permissions configured by the Super Admin ({settings.superAdminName}).
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-800 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
            Role: {currentUser?.role}
          </span>
        </div>
      )}

      {/* TAB 1: EMPLOYEES */}
      {currentTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search staff by Name, ID, Department..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
              />
            </div>

            {canManageMaster ? (
              <button
                onClick={handleOpenAddEmployee}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Employee
              </button>
            ) : (
              <div
                className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed opacity-75"
                title="Adding employees requires Master Data permission granted by the Super Admin."
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Add Employee (Restricted)
              </div>
            )}
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Department & Designation</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Assigned Assets</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map(emp => {
                    const activeAssets = assets.filter(
                      a => a.currentHolderId === emp.id && a.status === 'Assigned'
                    );
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {emp.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{emp.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {emp.empId} • {emp.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{emp.designationTitle}</div>
                          <div className="text-[11px] text-slate-500">{emp.departmentName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800">{emp.workLocationName}</div>
                          <div className="text-[10px] text-slate-400">Joined: {emp.joiningDate}</div>
                        </td>
                        <td className="px-4 py-3">
                          {activeAssets.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-blue-600">
                                {activeAssets.length} asset{activeAssets.length > 1 ? 's' : ''}
                              </span>
                              <div className="text-[10px] text-slate-500 truncate max-w-xs">
                                {activeAssets.map(a => a.assetId).join(', ')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={emp.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingEmployee(emp)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                            >
                              Profile
                            </button>
                            {canManageMaster && (
                              <button
                                onClick={() => handleEditEmployee(emp)}
                                className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                title="Edit Profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove employee ${emp.name}?`)) {
                                    deleteEmployee(emp.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {currentTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Organizational Departments</h3>
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{dept.name}</h4>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{dept.code}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dept.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{dept.description}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Head: <strong className="text-slate-700">{dept.headName || 'Not Assigned'}</strong></span>
                  <span>{employees.filter(e => e.departmentId === dept.id).length} Staff</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DESIGNATIONS */}
      {currentTab === 'designations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Job Designations (Configurable)</h3>
            <button
              onClick={() => setIsDesigModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Designation
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Designation Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Seniority Level</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {designations.map(desig => {
                  const dept = departments.find(d => d.id === desig.departmentId);
                  return (
                    <tr key={desig.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{desig.title}</td>
                      <td className="px-4 py-3 text-slate-600">{dept?.name || 'All'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {desig.level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-700 text-xs font-semibold">Active</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ASSET CATEGORIES */}
      {currentTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Asset Categories</h3>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const count = assets.filter(a => a.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                      {cat.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{cat.description}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Registered</span>
                    <span className="font-bold text-blue-600 font-mono">{count} Items</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ASSET TYPES */}
      {currentTab === 'types' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Asset Types Specification</h3>
            <button
              onClick={() => setIsTypeModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Asset Type
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Type Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Parent Category</th>
                  <th className="px-4 py-3">Mandatory Identifiers</th>
                  <th className="px-4 py-3">Depreciation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assetTypes.map(t => {
                  const cat = categories.find(c => c.id === t.categoryId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{t.code}</td>
                      <td className="px-4 py-3 text-slate-600">{cat?.name || 'General'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {t.requiresSerial && (
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                              Serial No Required
                            </span>
                          )}
                          {t.requiresImei && (
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold">
                              IMEI Required
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {t.defaultDepreciationYears} Years
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: LOCATIONS */}
      {currentTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Branch & Office Locations</h3>
              <p className="text-xs text-slate-500">Geographical centers where company assets are inventoried.</p>
            </div>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Location
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map(loc => {
              const assetCount = assets.filter(a => a.locationId === loc.id).length;
              const staffCount = employees.filter(e => e.workLocationId === loc.id).length;
              return (
                <div key={loc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{loc.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{loc.code}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3">{loc.address}</p>
                  <p className="text-[11px] text-slate-500">{loc.city}, {loc.state} - {loc.country}</p>

                  <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[10px] font-mono text-slate-600 flex items-center justify-between">
                    <span>GPS: {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      Map <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{staffCount} Staff Members</span>
                    <span className="font-bold text-blue-600">{assetCount} Assets</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              {editingEmployee ? 'Edit Employee Profile' : 'Register New Employee'}
            </h3>

            <form onSubmit={handleSaveEmployee} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={empForm.empId}
                    onChange={e => setEmpForm({ ...empForm, empId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={empForm.name}
                    onChange={e => setEmpForm({ ...empForm, name: e.target.value })}
                    placeholder="e.g. Harsh Kumar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={empForm.email}
                    onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                    placeholder="harsh@jobuloindia.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={empForm.phone}
                    onChange={e => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="+91 98350 12345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={empForm.departmentId}
                    onChange={e => setEmpForm({ ...empForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                  <select
                    value={empForm.designationId}
                    onChange={e => setEmpForm({ ...empForm, designationId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {designations.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={empForm.joiningDate}
                    onChange={e => setEmpForm({ ...empForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Location *</label>
                  <select
                    value={empForm.workLocationId}
                    onChange={e => setEmpForm({ ...empForm, workLocationId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={empForm.status}
                    onChange={e => setEmpForm({ ...empForm, status: e.target.value as EmployeeStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={empForm.address}
                  onChange={e => setEmpForm({ ...empForm, address: e.target.value })}
                  placeholder="Official / Residential location"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EMPLOYEE PROFILE MODAL */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {viewingEmployee.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{viewingEmployee.name}</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {viewingEmployee.empId} • {viewingEmployee.designationTitle}
                  </div>
                </div>
              </div>
              <StatusBadge status={viewingEmployee.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.departmentName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase">Work Location</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.workLocationName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase">Official Email</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase">Joining Date</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.joiningDate}</span>
              </div>
            </div>

            {/* Currently Allocated Assets */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                <span>Assigned Corporate Hardware</span>
                <span className="font-mono text-blue-600">
                  {assets.filter(a => a.currentHolderId === viewingEmployee.id && a.status === 'Assigned').length} Items
                </span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {assets
                  .filter(a => a.currentHolderId === viewingEmployee.id && a.status === 'Assigned')
                  .map(a => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setSelectedAssetId(a.id);
                        setActiveView('assets');
                        setViewingEmployee(null);
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50/50 rounded-lg border border-slate-200 flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Laptop className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">{a.name}</span>
                          <span className="text-slate-400 font-mono ml-2">[{a.assetId}]</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600">SN: {a.serialNumber}</span>
                    </div>
                  ))}
                {assets.filter(a => a.currentHolderId === viewingEmployee.id && a.status === 'Assigned').length === 0 && (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    No active assets currently assigned to this employee.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LOCATION MODAL WITH GEOLOCATION */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Add Corporate Branch Location
            </h3>

            <form
              onSubmit={e => {
                e.preventDefault();
                addLocation(locForm);
                setIsLocationModalOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Depot Name *</label>
                <input
                  type="text"
                  required
                  value={locForm.name}
                  onChange={e => setLocForm({ ...locForm, name: e.target.value })}
                  placeholder="e.g. Pune Regional Branch"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Code *</label>
                  <input
                    type="text"
                    required
                    value={locForm.code}
                    onChange={e => setLocForm({ ...locForm, code: e.target.value.toUpperCase() })}
                    placeholder="PUN-01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={locForm.city}
                    onChange={e => setLocForm({ ...locForm, city: e.target.value })}
                    placeholder="Pune"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Postal Address</label>
                <input
                  type="text"
                  value={locForm.address}
                  onChange={e => setLocForm({ ...locForm, address: e.target.value })}
                  placeholder="Street / Cyber Hub address"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Geolocation Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">GPS Geo-Coordinates</span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    {isDetectingLocation ? 'Detecting...' : 'Use Current Location'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <input
                    type="number"
                    step="0.0001"
                    value={locForm.lat}
                    onChange={e => setLocForm({ ...locForm, lat: parseFloat(e.target.value) })}
                    placeholder="Latitude"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-[11px]"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={locForm.lng}
                    onChange={e => setLocForm({ ...locForm, lng: parseFloat(e.target.value) })}
                    placeholder="Longitude"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DEPARTMENT MODAL */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Create New Department
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                addDepartment(deptForm);
                setIsDeptModalOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Legal & Compliance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    placeholder="LEG"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Head</label>
                  <input
                    type="text"
                    value={deptForm.headName}
                    onChange={e => setDeptForm({ ...deptForm, headName: e.target.value })}
                    placeholder="Lead Officer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Operational scope of the department..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DESIGNATION MODAL */}
      {isDesigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Create New Designation
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                addDesignation(desigForm);
                setIsDesigModalOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  value={desigForm.title}
                  onChange={e => setDesigForm({ ...desigForm, title: e.target.value })}
                  placeholder="e.g. Regional Quality Lead"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={desigForm.departmentId}
                    onChange={e => setDesigForm({ ...desigForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Level</label>
                  <select
                    value={desigForm.level}
                    onChange={e => setDesigForm({ ...desigForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Senior">Senior</option>
                    <option value="Mid">Mid</option>
                    <option value="Junior">Junior</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDesigModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Create Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Create Asset Category
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                addCategory(catForm);
                setIsCategoryModalOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Audio Visual Equipment"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Code *</label>
                <input
                  type="text"
                  required
                  value={catForm.code}
                  onChange={e => setCatForm({ ...catForm, code: e.target.value.toUpperCase() })}
                  placeholder="AVQ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Description of hardware covered under this category..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSET TYPE MODAL */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Create Asset Type
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                addAssetType({
                  ...typeForm,
                  categoryId: typeForm.categoryId || categories[0]?.id || ''
                });
                setIsTypeModalOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Category *</label>
                <select
                  value={typeForm.categoryId}
                  onChange={e => setTypeForm({ ...typeForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type Name *</label>
                <input
                  type="text"
                  required
                  value={typeForm.name}
                  onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="e.g. Video Conference Bar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type Code *</label>
                  <input
                    type="text"
                    required
                    value={typeForm.code}
                    onChange={e => setTypeForm({ ...typeForm, code: e.target.value.toUpperCase() })}
                    placeholder="VCB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Depreciation (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={typeForm.defaultDepreciationYears}
                    onChange={e => setTypeForm({ ...typeForm, defaultDepreciationYears: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={typeForm.requiresSerial}
                    onChange={e => setTypeForm({ ...typeForm, requiresSerial: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Mandatory Serial Number Validation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={typeForm.requiresImei}
                    onChange={e => setTypeForm({ ...typeForm, requiresImei: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Mandatory IMEI / Cellular Number Validation</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTypeModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Create Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
