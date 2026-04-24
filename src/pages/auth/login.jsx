import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../hooks/useAuth';
import { login as loginAPI, refreshToken, getCurrentUser } from '../../services/auth';
import LoginLeftPanel from './components/LoginLeftPanel';
import LoginForm from './components/LoginForm';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const { company_slug } = useParams();
    console.debug('Login page rendered with company_slug:', company_slug);
    const { user, isAuthenticated, setUser } = useAuthStore();

    // Setup login mutation with react-query
    const { mutate: handleLogin, isPending } = useMutation({
        mutationFn: async (credentials) => {
            return await loginAPI(credentials.email, credentials.password, credentials.company_slug, credentials.remember_me);
        },
        onSuccess: (response) => {
            if (response.success) {
                const userData = response.data?.user;
                if (userData) {
                    setUser(userData);
                }
                toast.success('Login successful');

                // Redirect dựa trên role
                if (userData?.role === 'ADMIN') {
                    navigate('/admin');
                } else if (company_slug && company_slug !== 'admin') {
                    navigate(`/${company_slug}/app`);
                } else if (userData?.company_slug) {
                    navigate(`/${userData.company_slug}/app`);
                }
            } else {
                toast.error(response?.error?.message || 'Login failed');
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
        },
    });


    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            email,
            password,
            remember_me: rememberMe,
        };

        // Nếu company_slug không phải admin thì thêm vào payload
        if (company_slug && company_slug !== 'admin') {
            payload.company_slug = company_slug;
        }

        handleLogin(payload);
    };

    // Check if already has refresh token and can refresh session
    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                const refreshResponse = await refreshToken();
                if (refreshResponse?.success) {
                    const userData = await getCurrentUser();
                    if (userData?.data?.user) {
                        setUser(userData.data.user);
                        // Redirect based on role
                        if (userData.data.user.role === 'ADMIN') {
                            navigate('/admin');
                        } else if (company_slug && company_slug !== 'admin') {
                            navigate(`/${company_slug}/app`);
                        } else if (userData.data.user.company_slug) {
                            navigate(`/${userData.data.user.company_slug}/app`);
                        }
                    }
                }
            } catch (error) {
                // Silent fail - user stays on login page if no active session
                console.debug('Session check failed:', error?.message);
            }
        };

        checkExistingSession();
    }, [setUser, navigate, company_slug]);

    return (
        <div className="min-h-screen flex bg-background">
            <LoginLeftPanel />
            <LoginForm
                onSubmit={handleLoginSubmit}
                isPending={isPending}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
            />
        </div>
    );
};

export default Login;
