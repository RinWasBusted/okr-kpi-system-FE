const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      label: 'Đang làm việc',
      className: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
    },
    on_leave: {
      label: 'Nghỉ phép',
      className: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
    },
    inactive: {
      label: 'Không hoạt động',
      className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-normal ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
