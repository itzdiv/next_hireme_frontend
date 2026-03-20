'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();

  if (Number.isNaN(then)) return 'just now';

  const diffMs = Math.max(0, now - then);
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function typeIcon(type: Notification['type']) {
  if (type === 'APPLICATION_ACCEPTED') return '✅';
  if (type === 'APPLICATION_REJECTED') return '❌';
  return '💬';
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();

  const unreadBadge = useMemo(() => {
    if (unreadCount <= 0) return null;
    if (unreadCount > 99) return '99+';
    return String(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, []);

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      await markAllAsRead();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setOpen(false);
    if (!notification.application_id) return;
    router.push(`/applications/${notification.application_id}`);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />

        {unreadBadge ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-5 text-white">
            {unreadBadge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[20rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-border/60 bg-white shadow-lg sm:w-88">
          <div className="border-b border-border/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
            ) : (
              <ul className="divide-y divide-border/50">
                {notifications.map((notification) => {
                  const isUnread = !notification.is_read;
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60 ${
                          isUnread ? 'bg-primary-light/40' : 'bg-white'
                        }`}
                      >
                        <span className="mt-0.5 text-base leading-none" aria-hidden="true">
                          {typeIcon(notification.type)}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{timeAgo(notification.created_at)}</p>
                        </div>

                        {isUnread ? (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
