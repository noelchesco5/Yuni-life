import React, { createContext, useContext, useState } from 'react';
import { InAppBrowserModal } from '../components/ui/InAppBrowserModal';

interface InAppBrowserContextType {
  openInAppBrowser: (url: string, title?: string) => void;
  closeInAppBrowser: () => void;
}

const InAppBrowserContext = createContext<InAppBrowserContextType>({
  openInAppBrowser: () => {},
  closeInAppBrowser: () => {},
});

export function InAppBrowserProvider({ children }: { children: React.ReactNode }) {
  const [browserState, setBrowserState] = useState<{ isOpen: boolean; url: string; title?: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const openInAppBrowser = (url: string, title?: string) => {
    setBrowserState({ isOpen: true, url, title });
  };

  const closeInAppBrowser = () => {
    setBrowserState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <InAppBrowserContext.Provider value={{ openInAppBrowser, closeInAppBrowser }}>
      {children}
      <InAppBrowserModal
        isOpen={browserState.isOpen}
        url={browserState.url}
        title={browserState.title}
        onClose={closeInAppBrowser}
      />
    </InAppBrowserContext.Provider>
  );
}

export function useInAppBrowser() {
  return useContext(InAppBrowserContext);
}
