import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Lock, Shield, Send, Eye, EyeOff, KeyRound, Loader, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { changePassword } from '../../../../services/auth';

/**
 * PasswordSecuritySection Component
 * Handles password change and forgot password functionality
 */
const PasswordSecuritySection = ({ userEmail }) => {
  const [activeMode, setActiveMode] = useState(null); // 'change' | 'forgot' | null
  const [showVerificationFields, setShowVerificationFields] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
    forgotNew: false,
    forgotConfirm: false,
  });

  // Change password form
  const [changeForm, setChangeForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Forgot password form
  const [forgotForm, setForgotForm] = useState({
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isSendingCode, setIsSendingCode] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword, confirmPassword }) =>
      changePassword(currentPassword, newPassword, confirmPassword),
    onSuccess: (response) => {
      toast.success(response.message || 'Đổi mật khẩu thành công');
      resetForms();
      setActiveMode(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    },
  });

  const resetForms = () => {
    setChangeForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setForgotForm({ verificationCode: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setShowVerificationFields(false);
    setShowPasswords({
      old: false,
      new: false,
      confirm: false,
      forgotNew: false,
      forgotConfirm: false,
    });
  };

  const handleCancel = () => {
    resetForms();
    setActiveMode(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Change Password handlers
  const validateChangeForm = () => {
    const newErrors = {};

    if (!changeForm.oldPassword) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!changeForm.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (changeForm.newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(changeForm.newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số';
    }

    if (changeForm.newPassword !== changeForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = () => {
    if (!validateChangeForm()) return;

    changePasswordMutation.mutate({
      currentPassword: changeForm.oldPassword,
      newPassword: changeForm.newPassword,
      confirmPassword: changeForm.confirmPassword,
    });
  };

  // Forgot Password handlers
  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    // Simulate sending email - will be replaced with actual API call later
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSendingCode(false);
    setShowVerificationFields(true);
    toast.success(`Đã gửi mã xác thực đến ${userEmail}`);
  };

  const validateForgotForm = () => {
    const newErrors = {};

    if (!forgotForm.verificationCode) {
      newErrors.verificationCode = 'Vui lòng nhập mã xác thực';
    }

    if (!forgotForm.newPassword) {
      newErrors.forgotNewPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (forgotForm.newPassword.length < 8) {
      newErrors.forgotNewPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(forgotForm.newPassword)) {
      newErrors.forgotNewPassword = 'Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số';
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      newErrors.forgotConfirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPasswordSubmit = () => {
    if (!validateForgotForm()) return;

    // TODO: Call forgot password API with verification code
    toast.success('Đổi mật khẩu thành công');
    resetForms();
    setActiveMode(null);
  };

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text flex items-center gap-2">
          <Lock size={20} />
          Mật khẩu và bảo mật
        </h3>
        <p className="text-secondary text-sm mt-1">
          Quản lý mật khẩu và cài đặt bảo mật của bạn
        </p>
      </div>

      {!activeMode && (
        <div className="space-y-4">
          {/* Change Password Option */}
          <button
            onClick={() => setActiveMode('change')}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-orange-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <KeyRound size={20} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text">Thay đổi mật khẩu</p>
                <p className="text-sm text-secondary">Cập nhật mật khẩu hiện tại của bạn</p>
              </div>
            </div>
            <span className="text-accent">→</span>
          </button>

          {/* Forgot Password Option */}
          <button
            onClick={() => setActiveMode('forgot')}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-orange-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text">Quên mật khẩu</p>
                <p className="text-sm text-secondary">Đặt lại mật khẩu bằng email xác thực</p>
              </div>
            </div>
            <span className="text-accent">→</span>
          </button>
        </div>
      )}

      {/* Change Password Form */}
      {activeMode === 'change' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-700">
              Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 số.
            </p>
          </div>

          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Mật khẩu cũ
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                value={changeForm.oldPassword}
                onChange={(e) =>
                  setChangeForm((prev) => ({ ...prev, oldPassword: e.target.value }))
                }
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background pr-10 ${
                  errors.oldPassword
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-200 focus:ring-primary/50'
                }`}
                placeholder="Nhập mật khẩu cũ"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary cursor-pointer"
              >
                {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.oldPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={changeForm.newPassword}
                onChange={(e) =>
                  setChangeForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background pr-10 ${
                  errors.newPassword
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-200 focus:ring-primary/50'
                }`}
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary cursor-pointer"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={changeForm.confirmPassword}
                onChange={(e) =>
                  setChangeForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background pr-10 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-ring-red-500/50'
                    : 'border-gray-200 focus:ring-primary/50'
                }`}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary cursor-pointer"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCancel}
              disabled={changePasswordMutation.isPending}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/30"
            >
              {changePasswordMutation.isPending ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Đổi mật khẩu
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Form */}
      {activeMode === 'forgot' && (
        <div className="space-y-4">
          {!showVerificationFields ? (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  Vì lý do bảo mật, bạn cần xác thực email trước khi đặt lại mật khẩu.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-text">Yêu cầu xác thực email</p>
                  <p className="text-sm text-secondary">
                    Chúng tôi sẽ gửi mã xác thực đến {userEmail}
                  </p>
                </div>
                <button
                  onClick={handleSendVerificationCode}
                  disabled={isSendingCode}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/30"
                >
                  {isSendingCode ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Gửi mã
                </button>
              </div>

              <button
                onClick={handleCancel}
                className="w-full px-4 py-2.5 text-sm font-medium text-text bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </>
          ) : (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-700">
                  Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
                </p>
              </div>

              {/* Verification Code */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Mã xác thực
                </label>
                <input
                  type="text"
                  value={forgotForm.verificationCode}
                  onChange={(e) =>
                    setForgotForm((prev) => ({ ...prev, verificationCode: e.target.value }))
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background ${
                    errors.verificationCode
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-200 focus:ring-primary/50'
                  }`}
                  placeholder="Nhập mã xác thực"
                />
                {errors.verificationCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.verificationCode}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.forgotNew ? 'text' : 'password'}
                    value={forgotForm.newPassword}
                    onChange={(e) =>
                      setForgotForm((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background pr-10 ${
                      errors.forgotNewPassword
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-200 focus:ring-primary/50'
                    }`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('forgotNew')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary cursor-pointer"
                  >
                    {showPasswords.forgotNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.forgotNewPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.forgotNewPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.forgotConfirm ? 'text' : 'password'}
                    value={forgotForm.confirmPassword}
                    onChange={(e) =>
                      setForgotForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background pr-10 ${
                      errors.forgotConfirmPassword
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-200 focus:ring-primary/50'
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('forgotConfirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary cursor-pointer"
                  >
                    {showPasswords.forgotConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.forgotConfirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.forgotConfirmPassword}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-text bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleForgotPasswordSubmit}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/30"
                >
                  <Save size={16} />
                  Đổi mật khẩu
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordSecuritySection;
