import React, { useState, useEffect } from 'react';
import { Search, X, Laptop, User, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from './StatusBadge';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    assets,
    employees,
    nocs,
    setSelectedAssetId,
    setSelectedEmployeeId,
    setSelectedNocId,
    setActiveView
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const cleanTerm = searchTerm.toLowerCase().trim();

  const matchingAssets = cleanTerm
    ? assets.filter(
        a =>
          a.name.toLowerCase().includes(cleanTerm) ||
          a.assetId.toLowerCase().includes(cleanTerm) ||
          a.serialNumber.toLowerCase().includes(cleanTerm) ||
          (a.imeiNumber && a.imeiNumber.toLowerCase().includes(cleanTerm)) ||
          a.brand.toLowerCase().includes(cleanTerm) ||
          (a.currentHolderName && a.currentHolderName.toLowerCase().includes(cleanTerm))
      ).slice(0, 5)
    : [];

  const matchingEmployees = cleanTerm
    ? employees.filter(
        e =>
          e.name.toLowerCase().includes(cleanTerm) ||
          e.empId.toLowerCase().includes(cleanTerm) ||
          e.email.toLowerCase().includes(cleanTerm) ||
          e.departmentName.toLowerCase().includes(cleanTerm) ||
          e.designationTitle.toLowerCase().includes(cleanTerm)
      ).slice(0, 5)
    : [];

  const matchingNocs = cleanTerm
    ? nocs.filter(
        n =>
          n.nocNumber.toLowerCase().includes(cleanTerm) ||
          n.employeeName.toLowerCase().includes(cleanTerm) ||
          n.employeeEmpId.toLowerCase().includes(cleanTerm)
      ).slice(0, 5)
    : [];

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveView('assets');
    setIsGlobalSearchOpen(false);
  };

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    setActiveView('employees');
    setIsGlobalSearchOpen(false);
  };

  const handleSelectNoc = (nocId: string) => {
    setSelectedNocId(nocId);
    setActiveView('noc');
    setIsGlobalSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Search Assets by ID/Serial, Employees by Name/EmpID, NOC Numbers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full text-sm sm:text-base bg-transparent border-none outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 ml-2 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-300 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!searchTerm && (
            <div className="py-8 text-center text-slate-500 text-sm">
              <p className="font-medium text-slate-700">Quick Global Search</p>
              <p className="text-xs text-slate-400 mt-1">
                Type an asset serial (e.g. <span className="font-mono text-slate-600">DL5440</span>), employee name (e.g. <span className="font-semibold text-slate-600">Harsh</span>), or NOC number.
              </p>
            </div>
          )}

          {searchTerm && matchingAssets.length === 0 && matchingEmployees.length === 0 && matchingNocs.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No results found for &ldquo;<span className="text-slate-800 font-medium">{searchTerm}</span>&rdquo;
            </div>
          )}

          {/* Assets Section */}
          {matchingAssets.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                <Laptop className="w-3.5 h-3.5" />
                Assets ({matchingAssets.length})
              </div>
              <div className="space-y-1">
                {matchingAssets.map(ast => (
                  <div
                    key={ast.id}
                    onClick={() => handleSelectAsset(ast.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                        {ast.assetId.replace('JIA-', '')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                          {ast.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="font-mono text-slate-600">{ast.assetId}</span>
                          <span>•</span>
                          <span>SN: {ast.serialNumber}</span>
                          {ast.currentHolderName && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">Held by {ast.currentHolderName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={ast.status} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employees Section */}
          {matchingEmployees.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                <User className="w-3.5 h-3.5" />
                Employees ({matchingEmployees.length})
              </div>
              <div className="space-y-1">
                {matchingEmployees.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                          {emp.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="font-mono">{emp.empId}</span> • {emp.designationTitle} ({emp.departmentName})
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={emp.status} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOC Section */}
          {matchingNocs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                <FileText className="w-3.5 h-3.5" />
                NOC Certificates ({matchingNocs.length})
              </div>
              <div className="space-y-1">
                {matchingNocs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNoc(n.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                          {n.nocNumber} - {n.employeeName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {n.employeeEmpId} • {n.departmentName} • {n.assetRecords.length} assets recorded
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={n.status} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3 text-slate-400" /> to select
            </span>
          </div>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
