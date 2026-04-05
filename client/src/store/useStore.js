import { create } from 'zustand';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('mf_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('mf_user') || 'null'),
    token: localStorage.getItem('mf_token') || null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API}/auth/login`, { email, password });
            localStorage.setItem('mf_token', data.token);
            localStorage.setItem('mf_user', JSON.stringify(data.user));
            set({ user: data.user, token: data.token, loading: false });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Login failed', loading: false });
            throw err;
        }
    },

    register: async (name, email, password, role = 'client') => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API}/auth/register`, { name, email, password, role });
            localStorage.setItem('mf_token', data.token);
            localStorage.setItem('mf_user', JSON.stringify(data.user));
            set({ user: data.user, token: data.token, loading: false });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Registration failed', loading: false });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('mf_token');
        localStorage.removeItem('mf_user');
        set({ user: null, token: null });
    },
}));

export const useExpertStore = create((set) => ({
    experts: [],
    expert: null,
    loading: false,
    error: null,

    fetchExperts: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const params = new URLSearchParams(filters).toString();
            const { data } = await axios.get(`${API}/experts${params ? '?' + params : ''}`);
            set({ experts: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    fetchExpert: async (id) => {
        set({ loading: true, error: null, expert: null });
        try {
            const { data } = await axios.get(`${API}/experts/${id}`);
            set({ expert: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },
}));

export const useBookingStore = create((set) => ({
    bookings: [],
    loading: false,
    error: null,

    createBooking: async (bookingData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API}/bookings`, bookingData, {
                headers: getAuthHeader(),
            });
            set({ loading: false });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Booking failed', loading: false });
            throw err;
        }
    },

    fetchMyBookings: async () => {
        set({ loading: true });
        try {
            const { data } = await axios.get(`${API}/bookings/my`, { headers: getAuthHeader() });
            set({ bookings: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    fetchExpertBookings: async () => {
        set({ loading: true });
        try {
            const { data } = await axios.get(`${API}/bookings/expert`, { headers: getAuthHeader() });
            set({ bookings: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },
}));
