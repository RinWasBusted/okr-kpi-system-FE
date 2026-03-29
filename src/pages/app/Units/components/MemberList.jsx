import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { getUsers } from '../../../../services/user';

const MemberList = ({ unit, memberCount }) => {
  // Fetch members of this unit using user API with unit_id filter
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['users', { unit_id: unit.id }],
    queryFn: () => getUsers({ unit_id: unit.id, per_page: 100 }),
    enabled: !!unit.id,
  });

  const allMembers = membersData?.data || [];
  // Filter out the manager from the members list
  const members = allMembers.filter(member => member.id !== unit.manager?.id);

  return (
    <div className="space-y-6">
      {/* Manager Info */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="p-6 border-b border-secondary/20">
          <h3 className="text-lg font-semibold text-text">Quản lý</h3>
        </div>
        {unit.manager ? (
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-blue-600">
                  {unit.manager.full_name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{unit.manager.full_name}</p>
                <p className="text-sm text-secondary truncate">{unit.manager.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-secondary">
            <p className="text-sm">Chưa có quản lý</p>
          </div>
        )}
      </div>

      {/* Members List - Only show if there are members other than manager */}
      {members.length > 0 && (
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="p-6 border-b border-secondary/20">
          <h3 className="text-lg font-semibold text-text">Thành viên ({members.length})</h3>
        </div>
        {membersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size={24} className="text-primary animate-spin" />
          </div>
        ) : members.length > 0 ? (
          <div className="divide-y divide-secondary/10 max-h-96 overflow-y-auto">
            {members.map((member) => (
              <div key={member.id} className="p-4 hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-purple-600">
                      {member.full_name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate text-sm">{member.full_name}</p>
                    <p className="text-xs text-secondary truncate">{member.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-secondary">
            <p className="text-sm">Chưa có thành viên nào</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default MemberList;
