import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Pencil, Trash2, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUsers, updateUserAvatar } from '../../../services/user';
import { getUnits } from '../../../services/unit';
import { User_avatar } from '../../../assets';
import { useAuthStore } from '../../../hooks/useAuth';
import AddEmployeeModal from './components/AddEmployeeModal';
import EditEmployeeModal from './components/EditEmployeeModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

/**
 * StatusBadge Component - Display user status
 */
const StatusBadge = ({ isActive }) => {
  if (isActive) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400">
        Đang làm việc
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
      Nghỉ phép
    </span>
  );
};

/**
 * AvatarUploadOverlay Component - Show upload button on hover
 */
const AvatarUploadOverlay = ({ user, onUpload, isAdminCompany }) => {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(user.id, file);
    }
  };

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={user.avatar_url || User_avatar}
        alt={user.full_name}
        className={`w-10 h-10 rounded-full object-cover ${!user.avatar_url ? 'border border-secondary/30' : ''}`}
      />
      {isAdminCompany && isHovered && (
        <button
          onClick={handleClick}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
          title="Thay đổi avatar"
        >
          <Upload size={14} className="text-white" />
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

/**
 * EmployeePage Component - Employee management page
 */
const EmployeePage = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Fetch employees
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', 'employees', debouncedSearch, selectedUnit, selectedStatus, page],
    queryFn: () => getUsers({ 
      search: debouncedSearch || undefined, 
      unit_id: selectedUnit || undefined,
      is_active: selectedStatus === '' ? undefined : selectedStatus === 'true',
      page,
      per_page: perPage 
    }),
  });

  // Fetch units (tree mode for hierarchical display)
  const { data: unitsResponse, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['units', 'tree'],
    queryFn: () => getUnits({ per_page: 100, mode: 'tree' }),
  });

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta || { total: 0, page: 1, last_page: 1 };
  const unitsTree = unitsResponse?.data || [];

  // Flatten units for filter dropdown
  const units = useMemo(() => {
    const flatten = (items) => {
      let result = [];
      items.forEach((item) => {
        result.push({ id: item.id, name: item.name });
        if (item.sub_units?.length) {
          result = result.concat(flatten(item.sub_units));
        }
      });
      return result;
    };
    return flatten(unitsTree);
  }, [unitsTree]);

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: ({ userId, formData }) => updateUserAvatar(userId, formData),
    onSuccess: (response) => {
      toast.success(response.message || 'Cập nhật avatar thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Không thể cập nhật avatar');
    },
  });

  const handleAvatarUpload = useCallback((userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    uploadAvatarMutation.mutate({ userId, formData });
  }, [uploadAvatarMutation]);

  // Loading placeholder rows
  const LoadingRows = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20" />
              <div className="h-4 w-24 bg-secondary/20 rounded" />
            </div>
          </td>
          <td className="px-4 py-4"><div className="h-4 w-20 bg-secondary/20 rounded" /></td>
          <td className="px-4 py-4"><div className="h-4 w-32 bg-secondary/20 rounded" /></td>
          <td className="px-4 py-4"><div className="h-4 w-28 bg-secondary/20 rounded" /></td>
          <td className="px-4 py-4"><div className="h-6 w-20 bg-secondary/20 rounded-full" /></td>
          <td className="px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-secondary/20 rounded" />
              <div className="h-8 w-8 bg-secondary/20 rounded" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Quản lý Nhân sự</h1>
          <p className="text-secondary text-sm mt-1">Manage employees and their information</p>
        </div>
        {currentUser?.role === 'ADMIN_COMPANY' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Thêm nhân viên
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-background rounded-xl border border-secondary/20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Unit Filter */}
          <div>
            {isLoadingUnits ? (
              <div className="animate-pulse h-10 bg-secondary/10 rounded-lg" />
            ) : (
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Tất cả đơn vị</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang làm việc</option>
              <option value="false">Nghỉ phép</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/5 border-b border-secondary/20">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Tên</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Chức vụ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Đơn vị</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {isLoadingUsers ? (
                <LoadingRows />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={48} className="text-secondary/30" />
                      <p>Không tìm thấy nhân viên nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarUploadOverlay
                          user={user}
                          onUpload={handleAvatarUpload}
                          isAdminCompany={currentUser?.role === 'ADMIN_COMPANY'}
                        />
                        <span className="font-medium text-text">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-secondary">{user.role === 'EMPLOYEE' ? user.job_title || '-' : "Admin"}</td>
                    <td className="px-4 py-4 text-secondary">{user.email}</td>
                    <td className="px-4 py-4 text-secondary">{user.unit?.name || '-'}</td>
                    <td className="px-4 py-4">
                      <StatusBadge isActive={user.is_active} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {currentUser?.role === 'ADMIN_COMPANY' && (
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {currentUser?.role === 'ADMIN_COMPANY' && (
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-secondary/20 flex items-center justify-between bg-secondary/5">
            <div className="text-sm text-secondary">
              Hiển thị <span className="font-medium text-text">{(page - 1) * perPage + 1}</span> - <span className="font-medium text-text">{Math.min(page * perPage, meta.total)}</span> trong tổng số <span className="font-medium text-text">{meta.total}</span> nhân viên
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-secondary/20 hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.last_page }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      page === i + 1
                        ? 'bg-primary text-white'
                        : 'hover:bg-secondary/10 text-secondary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2 rounded-lg border border-secondary/20 hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddEmployeeModal
          onClose={() => setIsAddModalOpen(false)}
          units={unitsTree}
          isLoadingUnits={isLoadingUnits}
        />
      )}

      {editingUser && (
        <EditEmployeeModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          units={unitsTree}
          isLoadingUnits={isLoadingUnits}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};

export default EmployeePage;
