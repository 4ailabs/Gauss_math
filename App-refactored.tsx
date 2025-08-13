import React, { Suspense } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { useAppInitialization } from './hooks/useAppInitialization';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner, CardSkeleton } from './components/ui/LoadingSpinner';
import { ErrorDisplay } from './components/common/ErrorDisplay';
import {
  SearchView,
  ChatView,
  LibraryView,
  RecentView,
  StudyView,
  HelpView,
  ResultsView,
} from './components/views';
import './App.css';

// View Router Component
const ViewRouter: React.FC = React.memo(() => {
  const { state: { activeView } } = useApp();

  const renderView = () => {
    switch (activeView) {
      case 'search':
        return <SearchView />;
      case 'results':
        return <ResultsView />;
      case 'chat':
        return <ChatView />;
      case 'library':
        return <LibraryView />;
      case 'recent':
        return <RecentView />;
      case 'study':
        return <StudyView />;
      case 'help':
        return <HelpView />;
      default:
        return <SearchView />;
    }
  };

  return (
    <Suspense fallback={<ViewLoadingFallback />}>
      {renderView()}
    </Suspense>
  );
});

// Loading fallback for lazy-loaded views
const ViewLoadingFallback: React.FC = () => (
  <div className="space-y-6">
    <CardSkeleton />
    <CardSkeleton />
    <div className="flex justify-center">
      <LoadingSpinner size="lg" text="Cargando..." />
    </div>
  </div>
);

// Main App Content Component
const AppContent: React.FC = () => {
  const { state: { isApiKeyMissing, error }, setError } = useApp();
  
  // Initialize app
  useAppInitialization();

  return (
    <Layout>
      {isApiKeyMissing && (
        <ErrorDisplay
          message="API Key de Google Gemini no configurada. Por favor, configura tu API Key en el archivo .env"
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}
      
      <ViewRouter />
    </Layout>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;