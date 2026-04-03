import { useState } from 'react';
import { Target, TrendingUp, Users, Calendar, Lock, LockOpen, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { lockCycle } from '../../../../services/cycle';
import EditCycleModal from './EditCycleModal';
import DeleteCycleConfirmModal from './DeleteCycleConfirmModal';

const CycleItem = ({ cycle, onRefetch }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Calculate days between start and end date
  const calculateDuration = () => {
    const start = new Date(cycle.start_date);
    const end = new Date(cycle.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end day
  };

  // Format date to dd/MM/yyyy
  const formatDateVN = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format date range
  const formatDateRange = () => {
    const start = formatDateVN(cycle.start_date);
    const end = formatDateVN(cycle.end_date);
    return `${start} đến ${end}`;
  };

  // Format status
  const getStatusDisplay = () => {
    if (cycle.is_locked) {
      return {
        text: 'Đã đóng',
        className: 'bg-gray-100 text-gray-600',
      };
    }

    const daysRemaining = cycle.days_remaining || 0;
    if (daysRemaining > 0) {
      return {
        text: `Đang mở - Còn ${daysRemaining} ngày`,
        className: 'bg-green-100 text-green-600',
      };
    }
    return {
      text: 'Đang mở',
      className: 'bg-green-100 text-green-600',
    };
  };

  // Check if cycle can be deleted (all stats are 0)
  const canDelete = () => {
    // Placeholder logic - check if cycle has no objectives, kpis, and progress is 0
    const stats = cycle.statistics || {};
    const objectives = stats.total_objectives || 0;
    const kpis = stats.total_kpis || 0;
    const okrProgress = stats.avg_objective_progress || 0;
    const kpiProgress = stats.avg_kpi_progress || 0;

    return objectives === 0 && kpis === 0 && okrProgress === 0 && kpiProgress === 0;
  };

  // Lock/Unlock mutation
  const lockMutation = useMutation({
    mutationFn: () => lockCycle(cycle.id),
    onSuccess: () => {
      toast.success(cycle.is_locked ? 'Đã mở khóa chu kỳ' : 'Đã khóa chu kỳ');
      onRefetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const status = getStatusDisplay();
  const duration = calculateDuration();
  const dateRange = formatDateRange();

  // Placeholder data - should come from API or calculated
  const objectives = cycle.statistics?.total_objectives || Math.floor(Math.random() * 20) + 30;
  const avgProgress = cycle.statistics?.avg_objective_progress || Math.floor(Math.random() * 20) + 70;
  const employees = cycle.statistics?.total_employees || Math.floor(Math.random() * 50) + 200;
  const okrs = cycle.statistics?.total_okrs || Math.floor(Math.random() * 10) + 40;
  const kpis = cycle.statistics?.total_kpis || Math.floor(Math.random() * 20) + 90;

  return (
    <>
      <div className="bg-background rounded-xl border border-secondary/20 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header: Name and Status */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-text">{cycle.name}</h3>
                <p className="text-sm text-secondary">{dateRange}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
                {status.text}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mt-4">
              {/* Objectives */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Target size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-secondary">Objectives</p>
                  <p className="text-lg font-bold text-text">{objectives}</p>
                </div>
              </div>

              {/* Average Progress */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <TrendingUp size={20} className="text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary">Tiến độ TB</p>
                  <p className="text-lg font-bold text-text">{avgProgress}%</p>
                </div>
              </div>

              {/* Employees */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Users size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary">Nhân viên</p>
                  <p className="text-lg font-bold text-text">{employees}</p>
                </div>
              </div>

              {/* OKRs/KPIs */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary">OKRs/KPIs</p>
                  <p className="text-lg font-bold text-text">{okrs}/{kpis}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-secondary hover:text-primary hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa"
            >
              <Edit size={18} />
            </button>

            {/* Lock/Unlock or Delete Button */}
            {canDelete() ? (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Xóa"
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <button
                onClick={() => lockMutation.mutate()}
                disabled={lockMutation.isPending}
                className="p-2 text-secondary hover:text-primary hover:bg-orange-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title={cycle.is_locked ? 'Mở khóa' : 'Khóa'}
              >
                {cycle.is_locked ? <LockOpen size={18} /> : <Lock size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditCycleModal
          cycle={cycle}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            onRefetch();
          }}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteCycleConfirmModal
          cycle={cycle}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            onRefetch();
          }}
        />
      )}
    </>
  );
};

export default CycleItem;
