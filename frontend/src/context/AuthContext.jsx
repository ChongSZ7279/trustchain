import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const registerUser = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const formData = new FormData();
            
            Object.keys(userData).forEach(key => {
                if (userData[key] instanceof File) {
                    formData.append(key, userData[key]);
                } else {
                    formData.append(key, userData[key]);
                }
            });

            const response = await axios.post('/api/register/user', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registerOrganization = async (orgData) => {
        try {
            setLoading(true);
            setError(null);
            const formData = new FormData();
            
            Object.keys(orgData).forEach(key => {
                if (orgData[key] instanceof File) {
                    formData.append(key, orgData[key]);
                } else {
                    formData.append(key, orgData[key]);
                }
            });

            const response = await axios.post('/api/register/organization', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setOrganization(response.data.organization);
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('/api/login', credentials);
            
            if (credentials.type === 'user') {
                setUser(response.data.user);
                setOrganization(null);
            } else {
                setOrganization(response.data.organization);
                setUser(null);
            }

            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await axios.post('/api/logout');
            setUser(null);
            setOrganization(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } catch (err) {
            setError(err.response?.data?.message || 'Logout failed');
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        organization,
        loading,
        error,
        registerUser,
        registerOrganization,
        login,
        logout,
        isAuthenticated: !!(user || organization)
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 