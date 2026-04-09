import axiosClient from '../utils/axios';

/**
 * Retrieve a paginated list of notifications with optional filtering
 * @async
 * @function getNotifications
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.page_size=10] - Number of items per page
 * @param {boolean} [params.is_read] - Filter by read status (true for read, false for unread, undefined for all)
 * @returns {Promise<Object>} Promise resolving to notifications list object
 * @returns {string} returns.message - API response message (e.g., "Notifications retrieved successfully")
 * @returns {Object} returns.data - Main data object
 * @returns {Array<Object>} returns.data.items - Array of notification objects
 * @returns {number} returns.data.items[].id - Notification unique identifier
 * @returns {string} returns.data.items[].title - Notification title
 * @returns {string} returns.data.items[].message - Notification message content
 * @returns {boolean} returns.data.items[].is_read - Read status of the notification
 * @returns {string} returns.data.items[].created_at - Notification creation timestamp (ISO 8601 format)
 * @returns {Object} returns.data.items[].ref - Reference object linking to related entity
 * @returns {string} returns.data.items[].ref.type - Type of referenced entity (e.g., "objective", "kpi", "cycle")
 * @returns {number} returns.data.items[].ref.id - ID of referenced entity
 * @returns {Object} returns.data.pagination - Pagination metadata
 * @returns {number} returns.data.pagination.page - Current page number
 * @returns {number} returns.data.pagination.page_size - Items per page
 * @returns {number} returns.data.pagination.total - Total number of notifications
 * @returns {number} returns.data.pagination.total_pages - Total number of pages
 * @throws {AxiosError} Throws error if API request fails (401 unauthorized, 500 server error, etc.)
 * @example
 * // Get first page of notifications (10 items per page)
 * const response = await getNotifications({ page: 1, page_size: 10 });
 * console.log(response.data.items); // Array of notifications
 * console.log(response.data.pagination.total); // Total notification count
 *
 * @example
 * // Get unread notifications only
 * const unreadOnly = await getNotifications({ page: 1, page_size: 20, is_read: false });
 */
export const getNotifications = async (params = {}) => {
  const response = await axiosClient.get('/notifications', { params });
  return response.data;
};

/**
 * Retrieve the count of unread notifications for the current user
 * @async
 * @function getUnreadCount
 * @returns {Promise<Object>} Promise resolving to unread count object
 * @returns {string} returns.message - API response message (e.g., "Unread count retrieved successfully")
 * @returns {Object} returns.data - Main data object
 * @returns {number} returns.data.unread_count - Total number of unread notifications
 * @throws {AxiosError} Throws error if API request fails (401 unauthorized, 500 server error, etc.)
 * @example
 * // Get unread notification count
 * const response = await getUnreadCount();
 * console.log(response.data.unread_count); // 5
 */
export const getUnreadCount = async () => {
  const response = await axiosClient.get('/notifications/unread-count');
  return response.data;
};

/**
 * Mark all notifications as read for the current user
 * @async
 * @function markAllNotificationsAsRead
 * @returns {Promise<Object>} Promise resolving to update confirmation object
 * @returns {string} returns.message - API response message (e.g., "All notifications marked as read")
 * @returns {Object} returns.data - Main data object
 * @returns {number} returns.data.updated_count - Number of notifications marked as read
 * @returns {string} returns.data.read_at - Timestamp when notifications were marked as read (ISO 8601 format)
 * @throws {AxiosError} Throws error if API request fails (401 unauthorized, 500 server error, etc.)
 * @example
 * // Mark all notifications as read
 * const response = await markAllNotificationsAsRead();
 * console.log(response.data.updated_count); // 3
 * console.log(response.data.read_at); // "2026-04-09T10:30:00Z"
 */
export const markAllNotificationsAsRead = async () => {
  const response = await axiosClient.patch('/notifications/read-all');
  return response.data;
};

/**
 * Mark a single notification as read
 * @async
 * @function markNotificationAsRead
 * @param {number} id - The unique identifier of the notification to mark as read
 * @returns {Promise<Object>} Promise resolving to update confirmation object
 * @returns {string} returns.message - API response message (e.g., "Notification marked as read")
 * @returns {Object} returns.data - Main data object
 * @returns {number} returns.data.id - The ID of the marked notification
 * @returns {string} returns.data.read_at - Timestamp when notification was marked as read (ISO 8601 format)
 * @throws {AxiosError} Throws error if API request fails
 *   - 404 Not Found: Notification with specified ID does not exist
 *   - 401 Unauthorized: User not authenticated
 *   - 500 Server Error: Internal server error
 * @example
 * // Mark notification with ID 123 as read
 * const response = await markNotificationAsRead(123);
 * console.log(response.data.id); // 123
 * console.log(response.data.read_at); // "2026-04-09T10:25:00Z"
 */
export const markNotificationAsRead = async (id) => {
  const response = await axiosClient.patch(`/notifications/${id}/read`);
  return response.data;
};
