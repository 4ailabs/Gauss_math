import React from 'react';

interface ResultsSummaryProps {
  summary: string;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = React.memo(({ summary }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">RESUMEN</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-800 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
});