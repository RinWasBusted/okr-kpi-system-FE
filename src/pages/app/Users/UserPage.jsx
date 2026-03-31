import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/user';
import SearchBar from './components/SearchBar';
import FilterSelect from './components/FilterSelect';
import UserTable from './components/UserTable';
import UserModal from './components/UserModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ChatFab from './components/ChatFab';

const POSITION_OPTIONS = [
  { value: 'ceo', label: 'CEO' },
  { value: 'cto', label: 'CTO' },
  { value: 'cmo', label: 'CMO' },
  { value: 'cpo', label: 'CPO' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'marketing_manager', label: 'Marketing Manager' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'executive', label: 'Executive Leadership' },
  { value: 'engineering', label: 'Engineering Division' },
  { value: 'frontend', label: 'Frontend Team' },
  { value: 'backend', label: 'Backend Team' },
  { value: 'sales_marketing', label: 'Sales & Marketing' },
  { value: 'sales', label: 'Sales Team' },
  { value: 'marketing', label: 'Marketing Team' },
  { value: 'product', label: 'Product Management' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'on_leave', label: 'Nghỉ phép' },
  { value: 'inactive', label: 'Không hoạt động' },
];

const UserPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Fetch users from API
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users', { search: searchQuery }],
    queryFn: () => getUsers({ search: searchQuery }),
  });

  const users = usersResponse?.data || [];

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (response) => {
      toast.success(response.message || 'Thêm nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsUserModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Thêm nhân viên thất bại');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Cập nhật nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsUserModalOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (response) => {
      toast.success(response.message || 'Xóa nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa nhân viên thất bại');
    },
  });

  // Filter users based on position, department, and status (client-side filtering)
  const filteredUsers = users.filter((user) => {
    // Position filter - check if user's position matches filter value
    if (positionFilter) {
      const positionMap = {
        ceo: 'CEO',
        cto: 'CTO',
        cmo: 'CMO',
        cpo: 'CPO',
        team_lead: 'Team Lead',
        sales_manager: 'Sales Manager',
        marketing_manager: 'Marketing Manager',
      };
      const expectedPosition = positionMap[positionFilter];
      if (user.position !== expectedPosition) return false;
    }

    // Department filter
    if (departmentFilter) {
      const deptMap = {
        executive: 'Executive Leadership',
        engineering: 'Engineering Division',
        frontend: 'Frontend Team',
        backend: 'Backend Team',
        sales_marketing: 'Sales & Marketing',
        sales: 'Sales Team',
        marketing: 'Marketing Team',
        product: 'Product Management',
      };
      const expectedDept = deptMap[departmentFilter];
      if (user.department !== expectedDept) return false;
    }

    // Status filter
    if (statusFilter && user.status !== statusFilter) return false;

    return true;
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
  };

  const handleSubmitUser = (formData) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingUser) {
      deleteMutation.mutate(deletingUser.id);
    }
  };

  const handleChatClick = () => {
    toast.info('Mở chat');
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">Quản lý nhân viên</h1>
            <p className="text-secondary text-sm">
              {isLoading ? 'Đang tải...' : `${filteredUsers.length} nhân viên`}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm kiếm nhân viên..."
        />
        <FilterSelect
          value={positionFilter}
          onChange={setPositionFilter}
          options={POSITION_OPTIONS}
          placeholder="Tất cả chức vụ"
        />
        <FilterSelect
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={DEPARTMENT_OPTIONS}
          placeholder="Tất cả đơn vị"
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
          placeholder="Tất cả trạng thái"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-background border border-secondary/20 rounded-lg p-12">
          <div className="flex items-center justify-center">
            <Loader size={32} className="text-primary animate-spin" />
          </div>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      {/* Add/Edit Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmitUser}
        user={editingUser}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        user={deletingUser}
        isLoading={deleteMutation.isPending}
      />

      {/* Chat FAB */}
      <ChatFab onClick={handleChatClick} />
    </div>
  );
};

export default UserPage;
