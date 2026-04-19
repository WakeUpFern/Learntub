'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }) {
    useEffect(() => {
        // Run once on mount to apply the stored theme
        const storedTheme = localStorage.getItem('learntub_theme') || 'light';
        if (storedTheme === 'gruvbox') {
            document.documentElement.setAttribute('data-theme', 'gruvbox');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Setup an event listener for cross-tab or component changes if needed
        const handleStorageChange = (e) => {
            if (e.key === 'learntub_theme') {
                if (e.newValue === 'gruvbox') {
                    document.documentElement.setAttribute('data-theme', 'gruvbox');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        
        // Custom event for same-tab updates
        const handleThemeUpdate = (e) => {
            if (e.detail === 'gruvbox') {
                document.documentElement.setAttribute('data-theme', 'gruvbox');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        };
        window.addEventListener('theme-update', handleThemeUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('theme-update', handleThemeUpdate);
        };
    }, []);

    return <>{children}</>;
}
