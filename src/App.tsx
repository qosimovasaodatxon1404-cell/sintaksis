/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProgressProvider } from './hooks/useProgress';
import { AboutPage } from './pages/AboutPage';
import { BbaTestsPage } from './pages/BbaTestsPage';
import { GamesCenterPage } from './pages/GamesCenterPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { HomePage } from './pages/HomePage';
import { HomeworkPage } from './pages/HomeworkPage';
import { ModulePage } from './pages/ModulePage';
import { ProfilePage } from './pages/ProfilePage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/modul/:id" element={<ModulePage />} />
            <Route path="/oyinlar" element={<GamesCenterPage />} />
            <Route path="/oyinlar/:gameId" element={<GamesCenterPage />} />
            <Route path="/bba-testlar" element={<BbaTestsPage />} />
            <Route path="/uy-vazifasi" element={<HomeworkPage />} />
            <Route path="/uy-vazifasi/:moduleId" element={<HomeworkPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/lugat" element={<GlossaryPage />} />
            <Route path="/haqida" element={<AboutPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ProgressProvider>
  );
}
