import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification';
import { MoreHorizontal, CheckCheck, Check, Bell } from 'lucide-react';

const PAGE_SIZE = 6;

const TABS = {
  ALL: 'all',
  UNREAD: 'unread',
};

// Format thời gian
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString('vi-VN');
};

// Skeleton placeholder cho notification item
const NotificationSkeleton = () => (
  <div className="px-4 py-3 border-b border-secondary/10 last:border-0">
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-secondary/20 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-secondary/20 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-secondary/10 rounded animate-pulse w-1/2" />
      </div>
    </div>
  </div>
);

// Notification item component
const NotificationItem = ({ notification, onMarkAsRead, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        onMarkAsRead?.(notification.id);
        onRefresh?.();
      } catch {
        // Silent error
      }
    }
    setShowMenu(false);
  };

  const handleClick = async () => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        onMarkAsRead?.(notification.id);
        onRefresh?.();
      } catch {
        // Silent error
      }
    }
    // Link navigation sẽ được xử lý sau
  };

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 border-b border-secondary/10 last:border-0 cursor-pointer transition-colors relative group ${
        notification.is_read
          ? 'bg-background hover:bg-secondary/5'
          : 'bg-primary/5 hover:bg-primary/10'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div
          className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
            notification.is_read ? 'bg-secondary/30' : 'bg-primary'
          }`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-medium truncate ${
              notification.is_read ? 'text-text' : 'text-text font-semibold'
            }`}
          >
            {notification.title}
          </h4>
          <p className="text-xs text-secondary mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-secondary/70 mt-1">
            {formatTime(notification.created_at)}
          </p>
        </div>

        {/* Menu button - hiển thị khi hover */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded hover:bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4 text-secondary" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-secondary/20 rounded-lg shadow-lg py-1 z-50">
                {!notification.is_read && (
                  <button
                    onClick={handleMarkAsRead}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-secondary/10 text-left cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Đánh dấu đã đọc</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Xử lý sau - link navigation
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-secondary/10 text-left cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>Xem chi tiết</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationBoard = forwardRef(({ onUnreadCountChange }, ref) => {
  const [activeTab, setActiveTab] = useState(TABS.ALL);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = 1, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const params = {
          page,
          page_size: PAGE_SIZE,
          ...(activeTab === TABS.UNREAD && { is_read: false }),
        };

        const response = await getNotifications(params);
        const newItems = response.data?.items || [];
        const newPagination = response.data?.pagination;

        if (isLoadMore) {
          setNotifications((prev) => [...prev, ...newItems]);
        } else {
          setNotifications(newItems);
        }

        setPagination(newPagination);
      } catch {
        // Silent error
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab]
  );

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Expose preload function via ref
  useImperativeHandle(ref, () => ({
    preload: () => {
      if (notifications.length === 0 && !isLoading) {
        fetchNotifications(1, false);
      }
    },
    refresh: () => {
      fetchNotifications(1, false);
    },
  }));

  // Refresh function
  const handleRefresh = useCallback(() => {
    fetchNotifications(currentPage, false);
  }, [fetchNotifications, currentPage]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  // Mark single as read (local update)
  const handleMarkAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((noti) =>
        noti.id === id ? { ...noti, is_read: true } : noti
      )
    );
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Refresh lại danh sách
      fetchNotifications(1, false);
      // Trigger refresh count
      onUnreadCountChange?.();
    } catch {
      // Silent error
    }
  };

  // Check if has more pages
  const hasMore = pagination && currentPage < pagination.total_pages;

  // Check if has unread notifications
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="w-96 max-w-[90vw]">
      {/* Header với tabs và nút đã đọc tất cả */}
      <div className="px-4 py-3 border-b border-secondary/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text">Thông báo</h3>
          {hasUnread && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đã đọc tất cả</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => handleTabChange(TABS.ALL)}
            className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-colors cursor-pointer ${
              activeTab === TABS.ALL
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-secondary hover:bg-secondary/10'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => handleTabChange(TABS.UNREAD)}
            className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-colors cursor-pointer ${
              activeTab === TABS.UNREAD
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-secondary hover:bg-secondary/10'
            }`}
          >
            Chưa đọc
          </button>
        </div>
      </div>

      {/* Notification list với scroll */}
      <div className="max-h-100 overflow-y-auto">
        {isLoading ? (
          // Loading skeletons
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="px-4 py-8 text-center">
            <Bell className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
            <p className="text-sm text-secondary">
              {activeTab === TABS.UNREAD
                ? 'Không có thông báo chưa đọc'
                : 'Không có thông báo nào'}
            </p>
          </div>
        ) : (
          // Notification list
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onRefresh={() => {
                  handleRefresh();
                  onUnreadCountChange?.();
                }}
              />
            ))}

            {/* Load more button */}
            {hasMore && (
              <div className="px-4 py-3 border-t border-secondary/10">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? 'Đang tải...' : 'Xem thông báo trước đó'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default NotificationBoard;
