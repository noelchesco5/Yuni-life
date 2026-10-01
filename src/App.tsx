import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { RoleProvider } from './context/RoleContext';
import { InAppBrowserProvider } from './context/InAppBrowserContext';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/Home';
import { ChatPage } from './pages/Chat';
import { ConsolePage } from './pages/Console';
import { MePage } from './pages/Me';

export default function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <InAppBrowserProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                {/* Spec 09 Navigation: Chat · Home · Console · Me */}
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/console" element={<ConsolePage />} />
                <Route path="/me" element={<MePage />} />

                {/* Legacy redirect to Home */}
                <Route path="/study" element={<Navigate to="/" replace />} />
                <Route path="/map" element={<Navigate to="/" replace />} />
                <Route path="/feed" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </InAppBrowserProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}
