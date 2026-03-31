import { Pencil, Trash2, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

const UserRow = ({ user, onEdit, onDelete }) => {
  // Get initials from full_name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <tr className="border-b border-secondary/10 hover:bg-secondary/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-sm font-semibold text-primary">
                {getInitials(user.full_name)}
              </span>
            )}
          </div>
          <span className="font-medium text-text truncate max-w-[150px]">{user.full_name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-text whitespace-nowrap">{user.position}</td>
      <td className="px-6 py-4 text-secondary whitespace-nowrap">{user.email}</td>
      <td className="px-6 py-4 text-text whitespace-nowrap">{user.department}</td>
      <td className="px-6 py-4 text-text whitespace-nowrap">{user.phone}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={user.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-2 text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
