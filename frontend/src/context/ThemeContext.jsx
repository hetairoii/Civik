import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const getInitialTheme = () => {
      // Check for saved user preference
      const savedTheme = localStorage.getItem('civik-theme');
      if (savedTheme) {
        return savedTheme;
      }

      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Check Venezuela time (UTC-4)
      // Day is considered 6am to 6pm (18:00)
      const now = new Date();
      // Convert current time to Venezuela time
      // getTimezoneOffset returns difference in minutes from local to UTC.
      // We want UTC-4.
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const venezuelaTime = new Date(utc + (3600000 * -4));
      const hours = venezuelaTime.getHours();
      
      const isNight = hours < 6 || hours >= 18;

      if (isNight) {
        return 'dark';
      } else if (systemPrefersDark) {
          // If it's day in VZLA but system wants dark, what overrides? 
          // Requirement: "Por defecto siempre es blanco si se consulta en el dia (hora venezuela) y por la noche sera modo oscuro."
          // Only if VZLA time check is ambiguous do we fallback? 
          // The requirement implies VZLA time is the primary default.
          // "detectar que modo visual esta usando por defecto el sistema del usuario ... Y decidir con base a ello. Por defecto siempre es blanco si se consulta en el dia..."
          // Let's prioritize VZLA time as requested for the default. 
          return 'light'; // Default day
      }

      return 'light';
    };

    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('civik-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
