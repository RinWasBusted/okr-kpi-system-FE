import { useQuery } from '@tanstack/react-query';
import { Users, Loader2 } from 'lucide-react';
import { getUsers } from '../../../../services/user';

/**
 * EmployeeUnitMemberList - Component hiển thị danh sách members của unit cho Employee view
 * @param {Object} unit - Unit đang được chọn
 */
const EmployeeUnitMemberList = ({ unit }) => {
  // Fetch members of selected unit
  const { data: membersResponse, isLoading } = useQuery({
    queryKey: ['unitMembers', unit?.id],
    queryFn: () => getUsers({ unit_id: unit.id, per_page: 100 }),
    enabled: !!unit?.id,
  });

  const members = membersResponse?.data || [];

  // Placeholder loading state
  if (isLoading) {
    return (
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="p-4 border-b border-secondary/20">
          <div className="flex items-center gap-2 text-text">
            <Users size={18} className="text-primary" />
            <span className="font-semibold">Employee List</span>
            <span className="text-secondary text-sm">(Loading...)</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-secondary/20 rounded animate-pulse" />
                <div className="h-3 w-24 bg-secondary/20 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
      <div className="p-4 border-b border-secondary/20">
        <div className="flex items-center gap-2 text-text">
          <Users size={18} className="text-primary" />
          <span className="font-semibold">Employee List</span>
          {unit && (
            <span className="text-secondary text-sm">({unit.name})</span>
          )}
        </div>
      </div>

      <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {members.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No employees in this unit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/5 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-primary">
                      {member.full_name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">
                    {member.full_name}
                  </p>
                  <p className="text-sm text-secondary truncate">
                    {member.job_title || 'No job title'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeUnitMemberList;
