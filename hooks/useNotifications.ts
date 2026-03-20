'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';
const POLL_INTERVAL_MS = 30_000;

export type NotificationType =
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_COMMENT';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  application_id: string | null;
  job_title: string | null;
  company_name: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') ?? localStorage.getItem('acess_token');
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const hasFetchedOnceRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      if (!hasFetchedOnceRef.current) {
        setLoading(false);
        hasFetchedOnceRef.current = true;
      }
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/v1/notifications?page=1&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        if (!hasFetchedOnceRef.current) {
          setLoading(false);
          hasFetchedOnceRef.current = true;
        }
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch notifications: ${res.status}`);
      }

      const payload: NotificationsResponse = await res.json();
      setNotifications(payload.data ?? []);
      setUnreadCount(payload.unreadCount ?? 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      if (!hasFetchedOnceRef.current) {
        setLoading(false);
        hasFetchedOnceRef.current = true;
      }
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setUnreadCount(0);
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));

    try {
      const res = await fetch(`${API_BASE_URL}/v1/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to mark notifications as read: ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();

    const intervalId = window.setInterval(() => {
      void fetchNotifications();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
