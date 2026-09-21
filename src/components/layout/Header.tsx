import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  Layers,
  Users,
  Briefcase,
  FolderTree,
  MapPin,
  Laptop,
  ArrowRightLeft,
  Undo2,
  FileCheck2,
  BarChart3,
  Menu,
  X,
  ExternalLink,
  RotateCcw,
  Crown,
  Lock,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    logout,
    switchRole,
    notifications,
    setIsGlobalSearchOpen,
    setIsNotificationDrawerOpen,
    resetAllDataToSeed,
    settings,
    isSuperAdmin,
    supabaseStatus
  } = useApp();

  const [isMasterDropdownOpen, setIsMasterDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const masterRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (masterRef.current && !masterRef.current.contains(e.target as Node)) {
        setIsMasterDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const masterSections = [
    { label: 'Employees Master', view: 'master-employees', icon: Users, desc: 'Add & manage employee records' },
    { label: 'Departments', view: 'master-departments', icon: Building2, desc: 'Company organizational divisions' },
    { label: 'Designations', view: 'master-designations', icon: Briefcase, desc: 'Official designations & levels' },
    { label: 'Asset Categories', view: 'master-categories', icon: FolderTree, desc: 'Hardware, Telecom, CCTV classifications' },
    { label: 'Asset Types', view: 'master-types', icon: Layers, desc: 'Laptops, routers, phones specifications' },
    { label: 'Locations & Branches', view: 'master-locations', icon: MapPin, desc: 'Office addresses & geo-coordinates' }
  ];

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setIsMobileNavOpen(false);
    setIsMasterDropdownOpen(false);
  };

  const rolesList: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];

  const brandTitle = settings?.brandName || 'Zovilo Life Style';

  const brandInitials = brandTitle
    ? brandTitle.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase()
    : 'ZLS';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4 min-w-0">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer shrink-0 py-1 px-1.5 -ml-1.5 rounded-xl hover:bg-slate-800/60 transition-all duration-150"
              title={`${brandTitle} - Assets Management System`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-md shadow-blue-900/30 border border-blue-400/25 group-hover:border-blue-400/50 group-hover:shadow-blue-600/30 transition-all shrink-0">
                {brandInitials}
              </div>
              <div className="flex flex-col justify-center min-w-0 shrink-0">
                <span className="text-base sm:text-[17px] font-black tracking-wide text-white group-hover:text-blue-300 transition-colors whitespace-nowrap leading-tight">
                  {brandTitle}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-blue-300/90 group-hover:text-blue-200 transition-colors uppercase whitespace-nowrap leading-tight mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50 shrink-0" />
                  Assets Management System
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Top Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Home
            </button>

            {/* Master Dropdown */}
            <div className="relative" ref={masterRef}>
              <button
                onClick={() => setIsMasterDropdownOpen(!isMasterDropdownOpen)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide flex items-center gap-1 transition-colors ${
                  activeView.startsWith('master')
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Master
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMasterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMasterDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Master Configurations
                  </div>
                  <div className="py-1">
                    {masterSections.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.view}
                          onClick={() => handleNavClick(item.view)}
                          className="w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('assets')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                activeView === 'assets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Assets
            </button>

            <button
              onClick={() => handleNavClick('master-employees')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                activeView === 'master-employees' || activeView === 'employees'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Employees
            </button>

            <button
              onClick={() => handleNavClick('allocations')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                activeView === 'allocations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Allocation
            </button>

            <button
              onClick={() => handleNavClick('returns')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                activeView === 'returns'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Returns
            </button>

            <button
              onClick={() => handleNavClick('noc')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                activeView === 'noc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              NOC
            </button>

            <button
              onClick={() => handleNavClick('reports')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                activeView === 'reports'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Reports
            </button>

            {/* Dedicated Users Management (Only visible to Super Admin) */}
            {isSuperAdmin && (
              <button
                id="nav-link-users"
                onClick={() => handleNavClick('users')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 ${
                  activeView === 'users'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-amber-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-400" />
                Users
              </button>
            )}

            <button
              onClick={() => handleNavClick('public-home')}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1"
              title="Visit Public Website"
            >
              Public Site <ExternalLink className="w-3 h-3" />
            </button>
          </nav>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2">
            {/* Supabase Cloud Indicator */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                supabaseStatus.connected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
              }`}
              title={`Supabase: ${supabaseStatus.connected ? 'Connected' : 'Click to manage'} (Project: ypkypaudobqbhxirxkqz)`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">Supabase</span>
              <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Global Search Button */}
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition-colors"
              title="Global Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search assets, staff...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-700 rounded border border-slate-600">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>

            {/* User Profile Dropdown */}
            {currentUser && (
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    {currentUser.name[0]}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-100 leading-tight flex items-center gap-1">
                      {currentUser.name}
                      {isSuperAdmin && <Crown className="w-3 h-3 text-amber-400" />}
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                      {isSuperAdmin ? 'SOLE SUPER ADMIN' : currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                        {isSuperAdmin && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5 text-amber-600" /> Sole Super Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-slate-400">{currentUser.department}</span>
                      </div>
                    </div>

                    {/* Switch Role for Demonstration */}
                    <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Active Role (RBAC)
                      </span>
                      <span className="text-[9px] text-slate-400">1 Super Admin Limit</span>
                    </div>
                    <div className="px-2 py-1 space-y-0.5">
                      {rolesList.map(r => {
                        const isThisRoleSuperAdmin = r === 'SUPER_ADMIN';
                        const isCurrentUserDesignatedSuperAdmin = currentUser.email.toLowerCase() === settings.superAdminEmail.toLowerCase();
                        const isSuperAdminDisabled = isThisRoleSuperAdmin && !isCurrentUserDesignatedSuperAdmin;

                        if (isSuperAdminDisabled) {
                          return (
                            <div
                              key={r}
                              className="w-full px-2.5 py-1 text-xs rounded-md flex items-center justify-between text-slate-400 bg-slate-50 cursor-not-allowed opacity-60"
                              title={`Restricted: Only ${settings.superAdminName} (${settings.superAdminEmail}) holds Super Admin privileges.`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span>{r}</span>
                                <span className="text-[8px] font-bold bg-slate-200 text-slate-600 px-1 py-0.2 rounded">Locked</span>
                              </span>
                              <Lock className="w-3 h-3 text-slate-400" />
                            </div>
                          );
                        }

                        return (
                          <button
                            key={r}
                            onClick={() => {
                              switchRole(r);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1 text-xs rounded-md transition-colors flex items-center justify-between ${
                              currentUser.role === r
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{r}</span>
                              {isThisRoleSuperAdmin && (
                                <Crown className="w-3 h-3 text-amber-500" />
                              )}
                            </span>
                            {currentUser.role === r && <Shield className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 my-1" />

                    {isSuperAdmin && (
                      <button
                        id="dropdown-link-users"
                        onClick={() => {
                          handleNavClick('users');
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          activeView === 'users'
                            ? 'text-blue-900 bg-blue-50 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Users Management</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 text-amber-600" /> Sole Admin
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        handleNavClick('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        isSuperAdmin
                          ? 'text-blue-900 bg-blue-50/50 hover:bg-blue-50 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSuperAdmin ? (
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{isSuperAdmin ? 'Super Admin Governance & Controls' : 'Settings & Governance'}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isSuperAdmin ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isSuperAdmin ? 'Exclusive' : 'Restricted'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('audit-logs');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      System Audit Trail
                    </button>

                    {isSuperAdmin ? (
                      <button
                        onClick={() => {
                          setShowResetConfirm(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        Reset Demo Seed Data
                      </button>
                    ) : (
                      <div
                        className="w-full text-left px-3 py-2 text-xs text-slate-400 flex items-center justify-between cursor-not-allowed opacity-60"
                        title="Factory reset is restricted exclusively to the Super Admin."
                      >
                        <span className="flex items-center gap-2">
                          <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                          Reset Demo Seed Data
                        </span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Nav Hamburger */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-6 space-y-1">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium ${
              activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <div className="py-1 px-3 text-[10px] font-bold text-slate-500 uppercase">Master Data</div>
          {masterSections.map(item => (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`w-full text-left pl-6 pr-3 py-1.5 rounded-md text-xs ${
                activeView === item.view ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="py-1 px-3 text-[10px] font-bold text-slate-500 uppercase">Operations</div>
          <button
            onClick={() => handleNavClick('assets')}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium ${
              activeView === 'assets' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Assets Register
          </button>
          <button
            onClick={() => handleNavClick('allocations')}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium ${
              activeView === 'allocations' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Asset Allocations
          </button>
          <button
            onClick={() => handleNavClick('returns')}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium ${
              activeView === 'returns' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Returns & Handover
          </button>
          <button
            onClick={() => handleNavClick('noc')}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium ${
              activeView === 'noc' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            NOC Clearances
          </button>
          <button
            onClick={() => handleNavClick('reports')}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium ${
              activeView === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Reports
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleNavClick('users')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 ${
                activeView === 'users' ? 'bg-blue-600 text-white' : 'text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Users Management</span>
            </button>
          )}
          <button
            onClick={() => handleNavClick('public-home')}
            className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-blue-400 hover:bg-slate-800 flex items-center justify-between"
          >
            <span>Public Home Page</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Reset Seed Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              Reset All Demo Seed Data?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              This will restore all default departments, employees (Harsh Kumar, Rahul Kumar, Vikrant Singh), assets, allocations, handovers, and NOC records to their initial state.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllDataToSeed();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
