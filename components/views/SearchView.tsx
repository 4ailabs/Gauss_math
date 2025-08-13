import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNoteProcessing } from '../../hooks/useNoteProcessing';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useImageScanning } from '../../hooks/useImageScanning';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SearchTypeSelector } from '../search/SearchTypeSelector';
import { SubjectSelector } from '../search/SubjectSelector';
import { NotesInput } from '../search/NotesInput';
import { ToolsGrid } from '../search/ToolsGrid';
import { RecentActivity } from '../search/RecentActivity';
import { ErrorDisplay } from '../common/ErrorDisplay';

const SearchView: React.FC = React.memo(() => {
  const { state: { isLoading, error } } = useApp();
  const { handleSearch } = useNoteProcessing();
  const { handleToggleRecording } = useSpeechRecognition();
  const { handleScanClick, handleImageSelected, imageInputRef } = useImageScanning();

  return (
    <div className="space-y-8">
      <SearchTypeSelector />
      <SubjectSelector />
      
      <Card padding="lg">
        <NotesInput 
          onToggleRecording={handleToggleRecording}
          onSearch={handleSearch}
        />
        
        {isLoading && (
          <div className="mt-4">
            <LoadingSpinner 
              size="md" 
              text="Procesando apuntes... Esto puede tomar unos segundos" 
            />
          </div>
        )}
        
        {error && <ErrorDisplay message={error} />}
        
        <input 
          type="file" 
          ref={imageInputRef} 
          onChange={handleImageSelected} 
          accept="image/*" 
          className="hidden"
        />
      </Card>

      <ToolsGrid onScanClick={handleScanClick} />
      <RecentActivity />
    </div>
  );
});

export default SearchView;