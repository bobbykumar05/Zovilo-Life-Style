import React from 'react';
import { X, CheckCheck, Bell, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveView
  } = useApp();

  if (!isNotificationDrawerOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleClickItem = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.link) {
      const target = notif.link.replace('/', '');
      setActiveView(target);
      setIsNotificationDrawerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No notifications to display
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClickItem(n)}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                    !n.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {n.link && <span className="text-blue-600 font-medium hover:underline">View details →</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
