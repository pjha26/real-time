import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
    const token = localStorage.getItem('mf_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useSocketStore = create((set, get) => ({
    socket: null,
    connect: (userId, role) => {
        if (get().socket) return;
        const newSocket = io(SOCKET_URL);
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            if (role === 'expert') {
                newSocket.emit('join:expert', userId);
            } else {
                newSocket.emit('join:client', userId);
            }
        });
        set({ socket: newSocket });
    },
    disconnect: () => {
        if (get().socket) {
            get().socket.disconnect();
            set({ socket: null });
        }
    }
}));

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

export const useBookingStore = create((set, get) => ({
    bookings: JSON.parse(localStorage.getItem('mock_bookings') || '[]'),
    loading: false,
    error: null,

    addMockBooking: (booking) => set((state) => {
        const mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
        const updatedBookings = [booking, ...mockBookings];
        localStorage.setItem('mock_bookings', JSON.stringify(updatedBookings));
        return { bookings: [...updatedBookings, ...state.bookings.filter(b => !b.is_mock)] };
    }),

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

    // ── Cancel a booking with ownership validation on the backend ──
    cancelBooking: async (bookingId) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.patch(
                `${API}/bookings/${bookingId}/status`,
                { status: 'cancelled' },
                { headers: getAuthHeader() }
            );
            // Update local state: replace the cancelled booking in the list
            set((state) => ({
                bookings: state.bookings.map(b =>
                    b.id === bookingId ? { ...b, status: 'cancelled' } : b
                ),
                loading: false,
            }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Cancellation failed', loading: false });
            throw err;
        }
    },

    // ── Reschedule a booking to a new time slot ──
    rescheduleBooking: async (bookingId, newStartTime, newEndTime) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.patch(
                `${API}/bookings/${bookingId}/reschedule`,
                { new_start_time: newStartTime, new_end_time: newEndTime },
                { headers: getAuthHeader() }
            );
            // Update local state with the rescheduled booking
            set((state) => ({
                bookings: state.bookings.map(b =>
                    b.id === bookingId ? { ...b, ...data } : b
                ),
                loading: false,
            }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Reschedule failed', loading: false });
            throw err;
        }
    },

    fetchMyBookings: async () => {
        set({ loading: true });
        try {
            const { data } = await axios.get(`${API}/bookings/my`, { headers: getAuthHeader() });
            const mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
            set({ bookings: [...mockBookings, ...data], loading: false });
        } catch (err) {
            const mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
            set({ bookings: mockBookings, error: err.message, loading: false });
        }
    },

    fetchExpertBookings: async () => {
        set({ loading: true });
        try {
            const { data } = await axios.get(`${API}/bookings/expert`, { headers: getAuthHeader() });
            const mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
            set({ bookings: [...mockBookings, ...data], loading: false });
        } catch (err) {
            const mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
            set({ bookings: mockBookings, error: err.message, loading: false });
        }
    },
}));

export const useDashboardStore = create((set) => ({
    flowTasks: [],
    curatorNotes: [],
    networkStats: { active_connections: 0, pending_connections: 0 },
    loading: false,
    error: null,

    fetchInsights: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.get(`${API}/dashboard/insights`, { headers: getAuthHeader() });
            set({
                flowTasks: data.flow_tasks || [],
                curatorNotes: data.curator_notes || [],
                networkStats: { 
                    active_connections: data.active_connections || 0, 
                    pending_connections: data.pending_connections || 0 
                },
                loading: false
            });
        } catch (err) {
            console.error("Dashboard Insights fetch failed:", err);
            set({ error: err.message, loading: false });
        }
    }
}));
