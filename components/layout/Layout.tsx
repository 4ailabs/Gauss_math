import React, { ReactNode } from 'react';
import { Header } from './Header';
import { ResearchSessionNotification } from '../research/ResearchSessionNotification';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 ios-full-height">
      <Header />
      <ResearchSessionNotification />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-8 sm:pb-8">
        {children}
      </main>
      
      {/* Footer sutil */}
      <footer className="mt-auto py-6 text-center">
        <p className="text-xs text-gray-400">
          Powered by <span className="font-medium text-gray-500">4ailabs</span>
        </p>
      </footer>
    </div>
  );
};