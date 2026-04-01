import api from './api';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'pending' | 'info' | 'reminder';
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  // Get all notifications for current user
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Return mock data for development
      return [
        {
          id: 1,
          userId: 1,
          title: 'Leave Application Approved',
          message: 'Your annual leave request for March 15-20 has been approved.',
          type: 'approval',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: 2,
          userId: 1,
          title: 'New Leave Request',
          message: 'Jane Smith has submitted a sick leave request for review.',
          type: 'pending',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ];
    }
  },

  // Mark notification as read
  markAsRead: async (id: number): Promise<void> => {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
      // Mock success for development
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Mock success for development
    }
  },

  // Delete notification
  deleteNotification: async (id: number): Promise<void> => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Mock success for development
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  },
};