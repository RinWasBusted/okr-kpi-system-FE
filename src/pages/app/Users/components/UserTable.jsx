import UserRow from './UserRow';

const UserTable = ({ users, onEdit, onDelete }) => {
  return (
    <div className="bg-background border border-secondary/20 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-secondary/5 border-b border-secondary/20">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-text min-w-[200px]">
                Tên
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-text min-w-[120px]">
                Chức vụ
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-text min-w-[200px]">
                Email
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-text min-w-[150px]">
                Đơn vị
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-text min-w-[140px]">
                Số điện thoại
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-text min-w-[140px]">
                Trạng thái
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-text min-w-[100px]">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-secondary">Không tìm thấy nhân viên nào</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
