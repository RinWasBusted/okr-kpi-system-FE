import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../hooks/useAuth';
import { login as loginAPI } from '../../services/auth';
import LoginLeftPanel from './components/LoginLeftPanel';
import LoginForm from './components/LoginForm';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { company_slug } = useParams();
    const { user, isAuthenticated, setUser } = useAuthStore();

    // Setup login mutation with react-query
    const { mutate: handleLogin, isPending } = useMutation({
        mutationFn: async (credentials) => {
            return await loginAPI(credentials.email, credentials.password, credentials.company_slug);
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
                toast.error(response.message || 'Login failed');
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            toast.error(errorMessage);
        },
    });

    // Redirect nếu user đã đăng nhập
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else if (user.company_slug) {
                navigate(`/${user.company_slug}/app`, { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            email,
            password,
        };

        // Nếu company_slug không phải admin thì thêm vào payload
        if (company_slug && company_slug !== 'admin') {
            payload.company_slug = company_slug;
        }

        handleLogin(payload);
    };

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
            />
        </div>
    );
};

export default Login;
