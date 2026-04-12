import { useState, useEffect } from 'react';

/**
 * Multi-Timezone Support Hook
 * Uses the browser's native Intl API — zero dependencies.
 */
export function useTimezone() {
    const [timezone, setTimezone] = useState(() => {
        return localStorage.getItem('user_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
    });

    useEffect(() => {
        localStorage.setItem('user_timezone', timezone);
    }, [timezone]);

    /** Format an ISO string into a human-readable time with timezone */
    const formatTime = (isoString, targetTz = timezone) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('en-US', {
                timeZone: targetTz,
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short',
            });
        } catch {
            return new Date(isoString).toLocaleTimeString();
        }
    };

    /** Format date only */
    const formatDate = (isoString, targetTz = timezone) => {
        try {
            return new Date(isoString).toLocaleDateString('en-US', {
                timeZone: targetTz,
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return new Date(isoString).toLocaleDateString();
        }
    };

    /** Get a short label like "IST (UTC+5:30)" */
    const getTimezoneLabel = () => {
        try {
            const now = new Date();
            const short = now.toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' }).split(' ').pop();
            const offset = now.toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'longOffset' }).split('GMT').pop();
            return `${short} (UTC${offset || ''})`;
        } catch {
            return timezone;
        }
    };

    return { timezone, setTimezone, formatTime, formatDate, getTimezoneLabel };
}
