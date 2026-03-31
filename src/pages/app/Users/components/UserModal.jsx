import { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";

const UserModal = ({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  isLoading = false,
}) => {
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
    email: "",
    phone: "",
    department: "",
    status: "active",
  });

  // Initialize form when editing
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        position: user.position || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        status: user.status || "active",
      });
    } else {
      setFormData({
        full_name: "",
        position: "",
        email: "",
        phone: "",
        department: "",
        status: "active",
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Họ tên
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Nhập họ tên"
                className="w-full px-3 py-2 bg-secondary/5 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
                required
              />
            </div>

            {/* Chức vụ */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Chức vụ
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Nhập chức vụ"
                className="w-full px-3 py-2 bg-secondary/5 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@company.com"
                className="w-full px-3 py-2 bg-secondary/5 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
                required
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+84 901 234 567"
                className="w-full px-3 py-2 bg-secondary/5 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              />
            </div>

            {/* Đơn vị */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Đơn vị
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/5 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text cursor-pointer"
                required
              >
                <option value="">Chọn đơn vị</option>
                <option value="Executive Leadership">
                  Executive Leadership
                </option>
                <option value="Engineering Division">
                  Engineering Division
                </option>
                <option value="Frontend Team">Frontend Team</option>
                <option value="Backend Team">Backend Team</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Sales Team">Sales Team</option>
                <option value="Marketing Team">Marketing Team</option>
                <option value="Product Management">Product Management</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/5 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text cursor-pointer"
                required
              >
                <option value="active">Đang làm việc</option>
                <option value="on_leave">Nghỉ phép</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader size={16} className="animate-spin" />}
              {isEdit ? "Cập nhật" : "Thêm nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
