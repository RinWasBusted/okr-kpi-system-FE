

import { use, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';

const App = ({ children }) => {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setTheme(theme);
  }, []);

  return (
    <div className={`${theme}-theme bg-background w-screen min-h-screen`}>
      {children}
    </div>
  );
};

export default App;
