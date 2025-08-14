import React from 'react';

interface ResultsSummaryProps {
  summary: string;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = React.memo(({ summary }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-base font-medium text-slate-700 mb-3">RESUMEN</h2>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-slate-700 leading-relaxed text-sm">{summary}</p>
      </div>
    </div>
  );
});