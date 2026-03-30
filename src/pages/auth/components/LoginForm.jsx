import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

export default function LoginForm({
  onSubmit,
  isPending,
  error,
  email,
  setEmail,
  password,
  setPassword,
}) {
  const { theme, toggleTheme } = useTheme();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate form fields
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);

    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);

    setErrors({
      email: emailError,
      password: passwordError,
    });
    setTouched({ email: true, password: true });

    if (!emailError && !passwordError) {
      onSubmit(e);
    }
  };

  return (
    <div className="w-full lg:w-1/2 xl:w-[55%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 bg-background">
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-secondary/20 transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-text" />
          ) : (
            <Moon className="w-5 h-5 text-text" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text mb-2">Sign In</h2>
          <p className="text-secondary text-sm">Welcome back! Please enter your details.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="email"
              disabled={isPending}
              className={`w-full px-4 py-2.5 bg-background/10 border rounded-lg text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.email && touched.email
                  ? 'border-primary focus:border-primary focus:ring-primary/20'
                  : 'border-secondary/10 '
              }`}
            />
            {errors.email && touched.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="password"
              disabled={isPending}
              className={`w-full px-4 py-2.5 bg-background/10 border rounded-lg text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password && touched.password
                  ? 'border-primary focus:border-primary focus:ring-primary/20'
                  : 'border-secondary/10'
              }`}
            />
            {errors.password && touched.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
