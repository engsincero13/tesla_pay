export const getApiBaseUrl = () => {
    // Allows override via environment variable
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // In development, default to local backend port
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3001';
    }

    // In production, use relative path (same origin)
    return '';
};

export const API_BASE = getApiBaseUrl();
