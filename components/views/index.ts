import { lazy } from 'react';

// Lazy load all views for better performance
export const SearchView = lazy(() => import('./SearchView'));
export const ChatView = lazy(() => import('./ChatView'));
export const LibraryView = lazy(() => import('./LibraryView'));
export const RecentView = lazy(() => import('./RecentView'));
export const StudyView = lazy(() => import('./StudyView'));
export const HelpView = lazy(() => import('./HelpView'));
export const ResultsView = lazy(() => import('./ResultsView'));