import React from 'react';
import { useApp, ResearchSession } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { AlertCircleIcon, PlayIcon, XIcon } from '../ui/Icons';

export const ResearchSessionNotification: React.FC = React.memo(() => {
  const { state, resumeResearchSession, clearCurrentResearchSession, getAvailableResearchSessions } = useApp();
  const [showSessions, setShowSessions] = React.useState(false);
  
  const availableSessions = getAvailableResearchSessions();
  const hasActiveSession = state.currentResearchSession !== null;
  const hasSavedSessions = availableSessions.length > 0;

  // Don't show notification if we're already in research view or no sessions exist
  if (state.activeView === 'research' || (!hasActiveSession && !hasSavedSessions)) {
    return null;
  }

  const handleResumeActive = () => {
    if (state.currentResearchSession) {
      resumeResearchSession(state.currentResearchSession);
    }
  };

  const handleResumeSession = (session: ResearchSession) => {
    resumeResearchSession(session);
    setShowSessions(false);
  };

  const handleDismiss = () => {
    clearCurrentResearchSession();
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'hace un momento';
    if (minutes < 60) return `hace ${minutes}m`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      {/* Active session notification */}
      {hasActiveSession && (
        <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                Investigación en progreso
              </p>
              <p className="text-xs text-blue-700 truncate">
                {state.currentResearchSession?.query}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Progreso: {state.currentResearchSession?.progress || 0}%
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResumeActive}
                icon={<PlayIcon className="w-3 h-3" />}
                className="text-blue-700 hover:text-blue-900 p-1"
              >
                Continuar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                icon={<XIcon className="w-3 h-3" />}
                className="text-blue-700 hover:text-blue-900 p-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Saved sessions notification */}
      {!hasActiveSession && hasSavedSessions && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Investigaciones guardadas
              </p>
              <p className="text-xs text-gray-600">
                Tienes {availableSessions.length} investigación{availableSessions.length !== 1 ? 'es' : ''} guardada{availableSessions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSessions(!showSessions)}
              className="text-gray-700 hover:text-gray-900 text-xs"
            >
              {showSessions ? 'Ocultar' : 'Ver'}
            </Button>
          </div>

          {/* Sessions list */}
          {showSessions && (
            <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
              {availableSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-2 p-2 bg-white rounded border hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => handleResumeSession(session)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {session.query}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatTimeAgo(session.timestamp)}</span>
                      <span>•</span>
                      <span>{session.progress}%</span>
                    </div>
                  </div>
                  <PlayIcon className="w-3 h-3 text-gray-400" />
                </div>
              ))}
              
              {availableSessions.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  y {availableSessions.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ResearchSessionNotification.displayName = 'ResearchSessionNotification';