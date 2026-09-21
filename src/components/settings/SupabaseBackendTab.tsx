import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Code2,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  HardDrive,
  Eye,
  EyeOff,
  Activity,
  Server
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  SUPABASE_PROJECT_ID,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  SUPABASE_SCHEMA_SQL,
  checkSupabaseHealth,
  SupabaseHealthStatus
} from '../../lib/supabase';

export const SupabaseBackendTab: React.FC = () => {
  const {
    supabaseStatus,
    isSupabaseChecking,
    isSupabaseSyncing,
    autoSyncSupabase,
    setAutoSyncSupabase,
    checkSupabaseConnection,
    pushDataToSupabase,
    pullDataFromSupabase,
    employees,
    assets,
    allocations,
    returns,
    nocs,
    auditLogs,
    departments,
    designations
  } = useApp();

  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setSyncFeedback(null);
    const result = await checkSupabaseConnection();
    if (result.connected) {
      setSyncFeedback({
        type: 'success',
        message: `Successfully connected to Supabase endpoint (${result.latencyMs}ms latency). ${
          result.hasTables ? 'Database tables verified.' : 'Connection verified. Run the SQL schema below to initialize tables in your Supabase SQL editor.'
        }`
      });
    } else {
      setSyncFeedback({
        type: 'error',
        message: result.error || 'Unable to establish connection to Supabase.'
      });
    }
  };

  const handlePushData = async () => {
    setSyncFeedback(null);
    const res = await pushDataToSupabase();
    if (res.success) {
      const counts = res.syncedCounts || {};
      const countMsg = Object.entries(counts)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ');
      setSyncFeedback({
        type: 'success',
        message: `Successfully pushed all corporate data to Supabase: ${countMsg || 'All collections updated'}.`
      });
    } else {
      setSyncFeedback({
        type: 'error',
        message: res.error || 'Failed to push data to Supabase. Please ensure tables exist in your Supabase database.'
      });
    }
  };

  const handlePullData = async () => {
    setSyncFeedback(null);
    const res = await pullDataFromSupabase();
    if (res.success) {
      setSyncFeedback({
        type: 'success',
        message: 'Successfully pulled latest data from Supabase and updated local workspace.'
      });
    } else {
      setSyncFeedback({
        type: 'error',
        message: res.error || 'Failed to pull data from Supabase.'
      });
    }
  };

  const tableSummaryList = [
    { name: 'employees', label: 'Employees Master', localCount: employees.length, remoteFound: supabaseStatus.tablesFound.employees },
    { name: 'assets', label: 'Company Assets Register', localCount: assets.length, remoteFound: supabaseStatus.tablesFound.assets },
    { name: 'allocations', label: 'Asset Allocations', localCount: allocations.length, remoteFound: supabaseStatus.tablesFound.allocations },
    { name: 'returns', label: 'Returns & Handover Records', localCount: returns.length, remoteFound: supabaseStatus.tablesFound.returns },
    { name: 'nocs', label: 'Exit Clearance NOCs', localCount: nocs.length, remoteFound: supabaseStatus.tablesFound.nocs },
    { name: 'audit_logs', label: 'Security Audit Logs', localCount: auditLogs.length, remoteFound: supabaseStatus.tablesFound.audit_logs },
    { name: 'company_settings', label: 'Company Config & Permissions', localCount: 1, remoteFound: supabaseStatus.tablesFound.company_settings }
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Overview & Credentials Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Supabase Cloud Backend Integration
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    supabaseStatus.connected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      supabaseStatus.connected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                    }`}
                  />
                  {supabaseStatus.connected ? 'Connected' : 'Offline / Unverified'}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Managed PostgreSQL backend powering assets, employee assignments, handover records, and clearance certifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isSupabaseChecking}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseChecking ? 'animate-spin' : ''}`} />
              {isSupabaseChecking ? 'Pinging...' : 'Test Connection'}
            </button>
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Project ID */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Project ID</span>
              <button
                onClick={() => copyToClipboard(SUPABASE_PROJECT_ID, setCopiedProjectId)}
                className="text-slate-500 hover:text-slate-800 transition-colors p-0.5"
                title="Copy Project ID"
              >
                {copiedProjectId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="font-mono text-xs font-bold text-slate-900 truncate">
              {SUPABASE_PROJECT_ID}
            </div>
          </div>

          {/* Supabase URL */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Endpoint URL</span>
              <button
                onClick={() => copyToClipboard(DEFAULT_SUPABASE_URL, setCopiedUrl)}
                className="text-slate-500 hover:text-slate-800 transition-colors p-0.5"
                title="Copy Endpoint URL"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="font-mono text-xs text-slate-700 truncate" title={DEFAULT_SUPABASE_URL}>
              {DEFAULT_SUPABASE_URL}
            </div>
          </div>

          {/* Publishable Key */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Publishable Anon Key</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-slate-500 hover:text-slate-800 transition-colors p-0.5"
                  title={showKey ? 'Hide key' : 'Reveal key'}
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => copyToClipboard(DEFAULT_SUPABASE_ANON_KEY, setCopiedKey)}
                  className="text-slate-500 hover:text-slate-800 transition-colors p-0.5"
                  title="Copy Publishable Key"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="font-mono text-xs text-slate-700 truncate">
              {showKey
                ? DEFAULT_SUPABASE_ANON_KEY
                : `${DEFAULT_SUPABASE_ANON_KEY.substring(0, 14)}••••••••••••••••`}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {syncFeedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{syncFeedback.message}</div>
          </div>
        )}
      </div>

      {/* Cloud Synchronization Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-600" /> Real-time Cloud Synchronization
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Sync local state with your remote Supabase cloud database.
            </p>
          </div>

          {/* Auto Sync Switch */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSyncSupabase}
                onChange={e => {
                  setAutoSyncSupabase(e.target.checked);
                  localStorage.setItem('zovilo_supabase_autosync', String(e.target.checked));
                }}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-700">
                Auto-sync on entity changes
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Push to Supabase */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
              <span>Push Local Data to Supabase</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Uploads all current employees ({employees.length}), assets ({assets.length}), allocations ({allocations.length}), returns, and clearance NOC records to your remote database tables.
            </p>
            <button
              onClick={handlePushData}
              disabled={isSupabaseSyncing}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseSyncing ? 'animate-spin' : ''}`} />
              {isSupabaseSyncing ? 'Pushing Data...' : 'Push to Supabase'}
            </button>
          </div>

          {/* Pull from Supabase */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ArrowDownCircle className="w-4 h-4 text-blue-600" />
              <span>Pull Data from Supabase</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Fetches all records from your remote Supabase tables and loads them into your active session and persistent local storage.
            </p>
            <button
              onClick={handlePullData}
              disabled={isSupabaseSyncing}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseSyncing ? 'animate-spin' : ''}`} />
              {isSupabaseSyncing ? 'Pulling Data...' : 'Pull from Supabase'}
            </button>
          </div>
        </div>
      </div>

      {/* Database Tables Status Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-700" /> Cloud Database Table Status
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time status of PostgreSQL tables inside your Supabase project (ID: {SUPABASE_PROJECT_ID}).
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-2.5">Table Name</th>
                <th className="px-4 py-2.5">Domain Module</th>
                <th className="px-4 py-2.5">Local Records</th>
                <th className="px-4 py-2.5">Supabase Schema Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableSummaryList.map(tbl => (
                <tr key={tbl.name} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-mono font-bold text-slate-800">
                    public.{tbl.name}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{tbl.label}</td>
                  <td className="px-4 py-2 font-semibold text-slate-800">{tbl.localCount}</td>
                  <td className="px-4 py-2">
                    {tbl.remoteFound ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" /> Ready & Detected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pending SQL Execution
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Migration Script Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" /> PostgreSQL Table Migration Script
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Copy this SQL script and execute it in your Supabase SQL Editor to provision all tables, columns, RLS security policies, and real-time triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(SUPABASE_SCHEMA_SQL, setCopiedSql)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
            </button>
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
          <pre className="text-[11px] font-mono text-emerald-400 max-h-72 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
            {SUPABASE_SCHEMA_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
};
