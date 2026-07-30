import { createContext, useContext, useState, useCallback } from 'react';
import { Notification } from '@components/common';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <Notification
              type={n.type}
              title={n.title}
              message={n.message}
              duration={n.duration}
              onClose={() => removeNotification(n.id)}
              autoClose
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
