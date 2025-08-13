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
import { ProcessingOverlay } from '../ui/ProcessingOverlay';

const SearchView: React.FC = React.memo(() => {
  const { 
    state: { isLoading, error, processingProgress, processingStep },
    setLoading,
    setProcessingProgress,
    setProcessingStep
  } = useApp();
  const { handleSearch } = useNoteProcessing();
  const { handleToggleRecording } = useSpeechRecognition();
  const { handleScanClick, handleImageSelected, imageInputRef } = useImageScanning();

  const handleCancelProcessing = () => {
    setLoading(false);
    setProcessingProgress(0);
    setProcessingStep('');
  };

  return (
    <>
      <div className="space-y-8">
        <SearchTypeSelector />
        <SubjectSelector />
        
        <Card padding="lg">
          <NotesInput 
            onToggleRecording={handleToggleRecording}
            onSearch={handleSearch}
          />
          
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

      {/* Processing Overlay */}
      <ProcessingOverlay
        isVisible={isLoading}
        progress={processingProgress}
        currentStep={processingStep}
        onCancel={handleCancelProcessing}
      />
    </>
  );
});

export default SearchView;