
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
         if (typeof window === 'undefined') {
            return 'dark';
        }
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
