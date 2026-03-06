import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPremium = user?.isPremium || false;

  const requirePremium = () => {
    if (isPremium) return true;
    setShowUpgrade(true);
    return false;
  };

  return (
    <PremiumContext.Provider value={{ isPremium, requirePremium, showUpgrade, setShowUpgrade }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => useContext(PremiumContext);
