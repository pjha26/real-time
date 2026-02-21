import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post('https://real-time-x3n3.onrender.com/api/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Login failed', loading: false });
        }
    },

    register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post('https://real-time-x3n3.onrender.com/api/auth/register', { name, email, password });
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Registration failed', loading: false });
        }
    },

    updateProfile: async (name, email) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.put('https://real-time-x3n3.onrender.com/api/auth/profile', { name, email }, {
                headers: { Authorization: `Bearer ${useAuthStore.getState().user.token}` }
            });
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, loading: false });
            return { success: true };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Profile update failed', loading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    updatePassword: async (password) => {
        try {
            await axios.put('https://real-time-x3n3.onrender.com/api/auth/password', { password }, {
                headers: { Authorization: `Bearer ${useAuthStore.getState().user.token}` }
            });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Password update failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null });
    },

    becomeExpert: async () => {
        set({ loading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            const { data } = await axios.post('http://localhost:5000/api/auth/become-expert', {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const updatedUser = { ...user, isExpert: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser, loading: false });
            return { success: true };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Upgrade failed', loading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    clearError: () => set({ error: null })
}));

export default useAuthStore;
