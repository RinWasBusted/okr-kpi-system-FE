import { useState } from 'react';
import axiosClient from '../../utils/axios.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        const response = await axiosClient.post('/auth/login', { email, password });
        if (response.data.success) {
            toast.success('Login successful');
            navigate('/admin/dashboard');
        } else {
            toast.error('Login failed');
        }
    }
        

    return (
    <div className="bg-primary">
        <h1>Login</h1>
            <form onSubmit={handleLoginSubmit}>
                <div>
                    <label htmlFor="username">Email:</label>
                    <input type="text" id="username" name="username" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit">Login</button>
            </form>
    </div>  
  );
};

export default Login;