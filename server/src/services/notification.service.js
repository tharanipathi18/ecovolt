import { prisma } from '../config/db.js';

/**
 * Create a user notification in Supabase DB
 */
export const createNotification = async ({ userId, title, message, type = 'info', severity = 'low' }) => {
  if (!userId) return null;
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        severity,
        isRead: false,
      },
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId, userId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};
