'use client';

import { useState, useEffect } from 'react';

export function ThemeToggle() {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTheme(localStorage.getItem('learntub_theme') || 'light');

        const handleThemeUpdate = (e) => setTheme(e.detail);
        window.addEventListener('theme-update', handleThemeUpdate);

        return () => window.removeEventListener('theme-update', handleThemeUpdate);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'gruvbox' : 'light';
        setTheme(newTheme);
        localStorage.setItem('learntub_theme', newTheme);
        window.dispatchEvent(new CustomEvent('theme-update', { detail: newTheme }));
    };

    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            title={`Cambiar a modo ${theme === 'light' ? 'Oscuro' : 'Claro'}`}
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                color: 'var(--fg)',
                border: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
        >
            {theme === 'light' ? '☽' : '☼'}
        </button>
    );
}
