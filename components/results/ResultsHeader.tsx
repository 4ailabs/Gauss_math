import React from 'react';
import { Button } from '../ui/Button';
import { DownloadIcon, FileTextIcon, LoaderCircleIcon, CheckCircleIcon } from '../ui/Icons';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [pdfGenerated, setPdfGenerated] = React.useState(false);
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const generatePDF = async () => {
    if (!processedData || isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Pequeño delay para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 300));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 30;

    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Header con línea decorativa
    doc.setFillColor(13, 148, 136); // Teal-600
    doc.rect(0, 0, pageWidth, 8, 'F');
    
    // Logo/Título principal con mejor diseño
    doc.setFontSize(28);
    doc.setTextColor(13, 148, 136);
    doc.text('Gauss∑ AI', margin, yPosition);
    
    // Subtítulo "Análisis Matemático Avanzado"
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Análisis Matemático Avanzado', margin, yPosition + 8);
    yPosition += 25;

    // Título del análisis con caja destacada
    doc.setFillColor(240, 253, 250); // bg-teal-50
    doc.rect(margin - 5, yPosition - 3, contentWidth + 10, 20, 'F');
    doc.setDrawColor(13, 148, 136);
    doc.rect(margin - 5, yPosition - 3, contentWidth + 10, 20, 'S');
    
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    doc.text(`${subject}`, margin, yPosition + 8);
    yPosition += 30;

    // Información del reporte en formato tabla
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    
    const reportInfo = [
      ['Fecha de Generación:', currentDate],
      ['Hora:', new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })],
      ['Conceptos Identificados:', processedData.keyConcepts.length.toString()],
      ['Preguntas Generadas:', processedData.quizQuestions.length.toString()],
      ['Problemas Relacionados:', processedData.relatedProblems.length.toString()]
    ];
    
    reportInfo.forEach(([label, value]) => {
      doc.text(label, margin, yPosition);
      doc.setTextColor(17, 24, 39);
      doc.text(value, margin + 50, yPosition);
      doc.setTextColor(75, 85, 99);
      yPosition += 8;
    });
    yPosition += 10;

    // Helper function para crear secciones con estilo
    const createSection = (title: string, bgColor: [number, number, number] = [240, 253, 250]) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Fondo de la sección
      doc.setFillColor(...bgColor);
      doc.rect(margin - 5, yPosition - 2, contentWidth + 10, 12, 'F');
      
      // Título de la sección
      doc.setFontSize(14);
      doc.setTextColor(13, 148, 136);
      doc.text(title, margin, yPosition + 6);
      yPosition += 20;
    };

    // Resumen ejecutivo
    createSection('📋 RESUMEN EJECUTIVO');
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    const summaryLines = doc.splitTextToSize(processedData.summary, contentWidth);
    doc.text(summaryLines, margin, yPosition);
    yPosition += (summaryLines.length * 4.5) + 15;

    // Conceptos clave
    createSection('🎯 CONCEPTOS CLAVE', [236, 254, 255]);

    processedData.keyConcepts.forEach((concept, index) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Número del concepto con círculo
      doc.setFillColor(13, 148, 136);
      doc.circle(margin + 5, yPosition + 2, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text((index + 1).toString(), margin + 3, yPosition + 3);
      
      // Concepto principal
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      const conceptLines = doc.splitTextToSize(concept.concept, contentWidth - 20);
      doc.text(conceptLines, margin + 12, yPosition + 3);
      yPosition += (conceptLines.length * 5) + 3;
      
      // Definición con estilo
      if (concept.definition) {
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        const definitionLines = doc.splitTextToSize(concept.definition, contentWidth - 15);
        doc.text(definitionLines, margin + 12, yPosition);
        yPosition += (definitionLines.length * 4) + 8;
      }
    });

    // Preguntas de práctica
    yPosition += 10;
    createSection('❓ PREGUNTAS DE PRÁCTICA', [254, 249, 195]);

    processedData.quizQuestions.forEach((question, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Pregunta con icono
      doc.setFontSize(10);
      doc.setTextColor(180, 83, 9);
      doc.text('Q', margin, yPosition);
      
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      const questionText = `${index + 1}. ${question.question}`;
      const questionLines = doc.splitTextToSize(questionText, contentWidth - 15);
      doc.text(questionLines, margin + 8, yPosition);
      yPosition += (questionLines.length * 4.5) + 5;
      
      // Respuesta con icono
      if (question.answer) {
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.text('A', margin, yPosition);
        
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        const answerLines = doc.splitTextToSize(question.answer, contentWidth - 15);
        doc.text(answerLines, margin + 8, yPosition);
        yPosition += (answerLines.length * 4) + 8;
      }
    });

    // Problemas relacionados con diseño mejorado
    yPosition += 10;
    createSection('🧮 PROBLEMAS RELACIONADOS', [255, 245, 235]);

    processedData.relatedProblems.forEach((problem, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Número del problema con icono
      doc.setFillColor(249, 115, 22); // Orange-500
      doc.circle(margin + 5, yPosition + 2, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text((index + 1).toString(), margin + 3, yPosition + 3);
      
      // Problema principal
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      const problemLines = doc.splitTextToSize(problem.problem, contentWidth - 20);
      doc.text(problemLines, margin + 12, yPosition + 3);
      yPosition += (problemLines.length * 5) + 3;
      
      // Solución con mejor formato
      if (problem.solution) {
        doc.setFontSize(9);
        doc.setTextColor(34, 197, 94); // Green-500
        doc.text('💡 Solución:', margin + 12, yPosition);
        yPosition += 6;
        
        doc.setTextColor(75, 85, 99);
        const solutionLines = doc.splitTextToSize(problem.solution, contentWidth - 15);
        doc.text(solutionLines, margin + 12, yPosition);
        yPosition += (solutionLines.length * 4) + 8;
      }
    });

    // Agregar línea de cierre con estadísticas
    yPosition += 15;
    doc.setFillColor(240, 253, 250); // bg-teal-50
    doc.rect(margin - 5, yPosition - 2, contentWidth + 10, 25, 'F');
    doc.setDrawColor(13, 148, 136);
    doc.rect(margin - 5, yPosition - 2, contentWidth + 10, 25, 'S');
    
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136);
    doc.text('📊 RESUMEN DEL ANÁLISIS', margin, yPosition + 6);
    
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    const stats = [
      `✓ ${processedData.keyConcepts.length} conceptos identificados`,
      `✓ ${processedData.quizQuestions.length} preguntas generadas`,
      `✓ ${processedData.relatedProblems.length} problemas relacionados`
    ];
    doc.text(stats.join('  •  '), margin, yPosition + 16);

    // Footer mejorado en cada página
    const addFooter = (pageNumber: number, totalPages: number) => {
      // Línea decorativa en el footer
      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(0.5);
      doc.line(margin, 275, pageWidth - margin, 275);
      
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      
      // Información izquierda
      doc.text(`Página ${pageNumber} de ${totalPages}`, margin, 282);
      
      // Información central
      doc.text(`Generado el ${currentDate}`, pageWidth/2 - 30, 282);
      
      // Información derecha
      doc.text('Gauss∑ AI', pageWidth - margin - 30, 282);
    };

    // Agregar footer a todas las páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

      // Descargar el PDF
      const fileName = `gauss-ai-analisis-${subject.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      // Mostrar feedback de éxito
      setPdfGenerated(true);
      setTimeout(() => setPdfGenerated(false), 3000);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 sm:p-6 h-full">
      {/* Notificación de éxito */}
      {pdfGenerated && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            ¡PDF generado exitosamente y descargado!
          </span>
        </div>
      )}
      
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
            disabled={isGeneratingPDF}
            icon={isGeneratingPDF ? <LoaderCircleIcon className="w-4 h-4" /> : <FileTextIcon className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">
              {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
            </span>
            <span className="sm:hidden">
              {isGeneratingPDF ? '...' : 'PDF'}
            </span>
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