import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccessDeniedViewProps {
  moduleName?: string;
  actionName?: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  moduleName = 'this section',
  actionName = 'access'
}) => {
  const { setActiveView } = useApp();

  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/5">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
        HTTP 403 Forbidden
      </span>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">403 Access Denied</h2>
      <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
        You do not have permission to {actionName} {moduleName}. Contact your Super Admin for authorization.
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
};
