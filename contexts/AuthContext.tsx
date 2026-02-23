import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
  upgradeToPremium: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage on load
    const storedUser = localStorage.getItem('imgmaster_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, name: string) => {
    // Simulate API login
    // In a real app, you would check password here
    const fakeUser: User = {
      id: 'user-' + Date.now(),
      name: name || email.split('@')[0],
      email,
      isPremium: false // Default to free
    };
    
    // Check if we have a saved version of this user (mock database)
    const savedUser = localStorage.getItem(`user_db_${email}`);
    const finalUser = savedUser ? JSON.parse(savedUser) : fakeUser;

    setUser(finalUser);
    localStorage.setItem('imgmaster_user', JSON.stringify(finalUser));
    if (!savedUser) localStorage.setItem(`user_db_${email}`, JSON.stringify(finalUser));
  };

  const register = (email: string, name: string) => {
    login(email, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('imgmaster_user');
  };

  const upgradeToPremium = () => {
    if (user) {
      const updatedUser = { ...user, isPremium: true };
      setUser(updatedUser);
      localStorage.setItem('imgmaster_user', JSON.stringify(updatedUser));
      localStorage.setItem(`user_db_${user.email}`, JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, upgradeToPremium }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
