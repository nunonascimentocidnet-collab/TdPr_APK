import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'dark' | 'light' | 'blue' | 'red';
export type LanguageType = 'pt' | 'en' | 'fr' | 'es';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as ThemeType) || 'dark';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('app-sound');
    return saved === null ? true : saved === 'true';
  });

  const [language, setLanguageState] = useState<LanguageType>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as LanguageType) || 'pt';
  });

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('app-sound', enabled.toString());
  };

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-green', 'theme-red');
    root.classList.add(`theme-${theme}`);
    
    // Set data-theme attribute for tailwind colors
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      soundEnabled, 
      setSoundEnabled: toggleSound, 
      language, 
      setLanguage 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
