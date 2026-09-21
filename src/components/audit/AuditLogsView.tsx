import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'User', 'Role', 'Entity ID', 'IP Address', 'Details'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.action,
      `"${l.userName}"`,
      l.userRole,
      l.entityId || '',
      l.ipAddress || '',
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jobulo_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Security & Compliance Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system activity log recording all user authorizations, asset state transitions, and clearance generations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" /> Export Audit Trail (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by action, user, details, entity ID..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-slate-500 whitespace-nowrap">Filter Action:</label>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500 bg-white"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">User Logins</option>
            <option value="CREATE_ASSET">Asset Created</option>
            <option value="ALLOCATE_ASSET">Asset Allocation</option>
            <option value="RETURN_ASSET">Asset Handover</option>
            <option value="GENERATE_NOC">NOC Issued</option>
            <option value="CREATE_EMPLOYEE">Employee Added</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">User & Role</th>
              <th className="px-4 py-3">Target Entity</th>
              <th className="px-4 py-3">Audit Details</th>
              <th className="px-4 py-3 text-right">Terminal IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </td>

                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    log.action.includes('NOC')
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.action.includes('ALLOCATE')
                      ? 'bg-blue-100 text-blue-800'
                      : log.action.includes('RETURN')
                      ? 'bg-teal-100 text-teal-800'
                      : log.action.includes('LOGIN')
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.action}
                  </span>
                </td>

                <td className="px-4 py-2.5">
                  <div className="font-semibold text-slate-900">{log.userName}</div>
                  <div className="text-[10px] text-slate-400">{log.userRole}</div>
                </td>

                <td className="px-4 py-2.5 font-mono text-slate-600">
                  {log.entityId || '—'}
                </td>

                <td className="px-4 py-2.5 text-slate-700 max-w-md">
                  {log.details}
                </td>

                <td className="px-4 py-2.5 text-right font-mono text-[11px] text-slate-400">
                  {log.ipAddress || '127.0.0.1'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
