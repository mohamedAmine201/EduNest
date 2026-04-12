import React, { createContext, useState, useEffect, useContext } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL

interface AuthContextType {
    token: string;
    user: any;
    setUser: (user: any) => void;
    login: (tokenValue: string, user: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState('');
    const [user, setUserState] = useState(null); // Rename internal state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken) setToken(storedToken);
        if (storedUser) {
            try {
                setUserState(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from storage", e);
            }
        }
        setLoading(false);
    }, []);

    // ─── THE CRUCIAL UPDATE ─────────────────────────────────────────────────
    const setUser = (newUser: any) => {
        // If newUser is a function (functional update pattern), handle it
        const valueToStore = typeof newUser === 'function' ? newUser(user) : newUser;
        
        setUserState(valueToStore);
        
        if (valueToStore) {
            localStorage.setItem('user', JSON.stringify(valueToStore));
        } else {
            localStorage.removeItem('user');
        }
    };
    // ────────────────────────────────────────────────────────────────────────

    const login = (tokenValue: string, userValue: any) => {
        setToken(tokenValue);
        setUser(userValue); // Uses our new synchronized function
        localStorage.setItem('token', tokenValue);
    };

    
    const logout = () => {
    // Don't touch the subscription at all on logout
    setToken('');
    setUserState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ token, user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};