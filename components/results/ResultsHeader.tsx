import React from 'react';
import { Button } from '../ui/Button';
import { DownloadIcon, FileTextIcon } from '../ui/Icons';
import { ProcessedData } from '../../types';
import jsPDF from 'jspdf';

interface ResultsHeaderProps {
  subject: string;
  onExport: () => void;
  processedData?: ProcessedData;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = React.memo(({ 
  subject, 
  onExport,
  processedData
}) => {
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const generatePDF = () => {
    if (!processedData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 30;

    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Título principal
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text('Gauss∑ AI', margin, yPosition);
    yPosition += 15;

    // Subtítulo
    doc.setFontSize(16);
    doc.setTextColor(52, 73, 94);
    doc.text(`Análisis de ${subject}`, margin, yPosition);
    yPosition += 20;

    // Información del reporte
    doc.setFontSize(12);
    doc.setTextColor(127, 140, 141);
    doc.text(`Fecha: ${currentDate}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Reporte Científico • ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, margin, yPosition);
    yPosition += 20;

    // Resumen ejecutivo
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('RESUMEN EJECUTIVO', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    const summaryLines = doc.splitTextToSize(processedData.summary, contentWidth);
    doc.text(summaryLines, margin, yPosition);
    yPosition += (summaryLines.length * 5) + 15;

    // Conceptos clave
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('CONCEPTOS CLAVE', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    processedData.keyConcepts.forEach((concept, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      const conceptText = `${index + 1}. ${concept.concept}`;
      const conceptLines = doc.splitTextToSize(conceptText, contentWidth);
      doc.text(conceptLines, margin, yPosition);
      yPosition += (conceptLines.length * 5) + 5;
      
      if (concept.definition) {
        const definitionLines = doc.splitTextToSize(`   ${concept.definition}`, contentWidth - 10);
        doc.setTextColor(127, 140, 141);
        doc.text(definitionLines, margin + 10, yPosition);
        yPosition += (definitionLines.length * 5) + 5;
        doc.setTextColor(52, 73, 94);
      }
    });

    // Preguntas de práctica
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('PREGUNTAS DE PRÁCTICA', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    processedData.quizQuestions.forEach((question, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      const questionText = `${index + 1}. ${question.question}`;
      const questionLines = doc.splitTextToSize(questionText, contentWidth);
      doc.text(questionLines, margin, yPosition);
      yPosition += (questionLines.length * 5) + 5;
      
      if (question.answer) {
        const answerLines = doc.splitTextToSize(`   Respuesta: ${question.answer}`, contentWidth - 10);
        doc.setTextColor(127, 140, 141);
        doc.text(answerLines, margin + 10, yPosition);
        yPosition += (answerLines.length * 5) + 5;
        doc.setTextColor(52, 73, 94);
      }
    });

    // Problemas relacionados
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('PROBLEMAS RELACIONADOS', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    processedData.relatedProblems.forEach((problem, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      const problemText = `${index + 1}. ${problem.problem}`;
      const problemLines = doc.splitTextToSize(problemText, contentWidth);
      doc.text(problemLines, margin, yPosition);
      yPosition += (problemLines.length * 5) + 5;
      
      if (problem.solution) {
        const solutionLines = doc.splitTextToSize(`   Solución: ${problem.solution}`, contentWidth - 10);
        doc.setTextColor(127, 140, 141);
        doc.text(solutionLines, margin + 10, yPosition);
        yPosition += (solutionLines.length * 5) + 5;
        doc.setTextColor(52, 73, 94);
      }
    });

    // Footer en cada página
    const addFooter = (pageNumber: number) => {
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.text(`Página ${pageNumber}`, margin, 280);
      doc.text('Powered by 4ailabs', pageWidth - margin - 40, 280);
    };

    // Agregar footer a todas las páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    // Descargar el PDF
    const fileName = `gauss-ai-analisis-${subject.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 sm:p-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 mb-1 uppercase tracking-wide font-medium">
            {currentDate}
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{subject}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={generatePDF}
            icon={<FileTextIcon className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Descargar</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            icon={<DownloadIcon className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Descargar</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-700">Análisis Completado</span>
        </div>
        <div className="flex-1"></div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
          Reporte Científico • {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});