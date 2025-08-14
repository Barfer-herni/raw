'use client';

import { useState, useEffect } from 'react';
import { SnowParticles } from './snow-particles';

export const SnowParticlesWrapper = () => {
    const [mounted, setMounted] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Only show particles after mounting to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);

        // Check for dark mode using CSS
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        // Check initially
        checkDarkMode();

        // Set up a mutation observer to watch for theme changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    if (!mounted) return null;

    return <SnowParticles isDarkMode={isDarkMode} count={70} />;
}; 