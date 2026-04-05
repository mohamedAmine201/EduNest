import React, { createContext, useState, useEffect, useContext } from 'react';

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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    const login = (tokenValue: string, user: any) => {
        setToken(tokenValue);
        setUser(user);
        localStorage.setItem('token', tokenValue);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        setToken('');
        setUser(null);
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