import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Login failed', loading: false });
        }
    },

    register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Registration failed', loading: false });
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null });
    },

    clearError: () => set({ error: null })
}));

export default useAuthStore;
