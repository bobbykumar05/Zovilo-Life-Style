import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { PublicWebsite } from './components/public/PublicWebsite';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MasterModule } from './components/master/MasterModule';
import { AssetList } from './components/assets/AssetList';
import { AllocationList } from './components/allocations/AllocationList';
import { CreateAllocation } from './components/allocations/CreateAllocation';
import { ReturnList } from './components/returns/ReturnList';
import { CreateReturn } from './components/returns/CreateReturn';
import { NOCList } from './components/noc/NOCList';
import { CreateNOC } from './components/noc/CreateNOC';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { CompanySettingsView } from './components/settings/CompanySettingsView';
import { UsersManagementView } from './components/users/UsersManagementView';
import { AccessDeniedView } from './components/common/AccessDeniedView';

const MainContent: React.FC = () => {
  const { activeView, canAccess } = useApp();

  // If public website is active
  if (activeView === 'public-home') {
    return <PublicWebsite />;
  }

  // If login view is active
  if (activeView === 'login') {
    return <LoginPage />;
  }

  // Management Portal Views
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header />
      <GlobalSearchModal />
      <NotificationDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && (
          canAccess('dashboard', 'view') ? <DashboardOverview /> : <AccessDeniedView moduleName="Dashboard" />
        )}

        {/* Master Management */}
        {(activeView === 'master-employees' ||
          activeView === 'master-departments' ||
          activeView === 'master-designations' ||
          activeView === 'master-categories' ||
          activeView === 'master-types' ||
          activeView === 'master-locations') && (
          canAccess('master', 'view') || canAccess('employees', 'view') ? (
            <MasterModule initialTab={activeView} />
          ) : (
            <AccessDeniedView moduleName="Master Configurations" />
          )
        )}

        {/* Assets Management */}
        {(activeView === 'assets' || activeView === 'assets-create') && (
          canAccess('assets', 'view') ? <AssetList /> : <AccessDeniedView moduleName="Asset Inventory" />
        )}

        {/* Allocations */}
        {activeView === 'allocations' && (
          canAccess('allocations', 'view') ? <AllocationList /> : <AccessDeniedView moduleName="Asset Allocations" />
        )}
        {activeView === 'allocations-create' && (
          canAccess('allocations', 'add') ? <CreateAllocation /> : <AccessDeniedView moduleName="Asset Allocations" actionName="create" />
        )}

        {/* Handover & Returns */}
        {activeView === 'returns' && (
          canAccess('returns', 'view') ? <ReturnList /> : <AccessDeniedView moduleName="Handover & Returns" />
        )}
        {activeView === 'returns-create' && (
          canAccess('returns', 'add') ? <CreateReturn /> : <AccessDeniedView moduleName="Handover & Returns" actionName="create" />
        )}

        {/* NOC Clearances */}
        {activeView === 'noc' && (
          canAccess('noc', 'view') ? <NOCList /> : <AccessDeniedView moduleName="NOC Exit Clearance" />
        )}
        {activeView === 'noc-create' && (
          canAccess('noc', 'add') ? <CreateNOC /> : <AccessDeniedView moduleName="NOC Exit Clearance" actionName="create" />
        )}

        {/* Reports */}
        {activeView === 'reports' && (
          canAccess('reports', 'view') ? <ReportsView /> : <AccessDeniedView moduleName="System Reports" />
        )}

        {/* Audit Logs */}
        {activeView === 'audit-logs' && (
          canAccess('audit_logs', 'view') ? <AuditLogsView /> : <AccessDeniedView moduleName="Audit Logs" />
        )}

        {/* User Management (Super Admin) */}
        {activeView === 'users' && <UsersManagementView />}

        {/* Company Settings */}
        {activeView === 'settings' && (
          canAccess('settings', 'view') ? <CompanySettingsView /> : <AccessDeniedView moduleName="Company Settings" />
        )}
      </main>

      <footer className="no-print bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400">
        Zovilo Life Style Assets Management System • Corporate IT Infrastructure & Exit Clearance Governance
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
