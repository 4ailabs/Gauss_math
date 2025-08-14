import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { FinalReport, Source } from '../services/researchService';

interface ExportOptions {
  filename?: string;
  includeMetadata?: boolean;
  includeSources?: boolean;
  format?: 'a4' | 'letter';
}

export const exportReportToPDF = async (
  report: FinalReport,
  topic: string,
  sources: Source[] = [],
  options: ExportOptions = {}
): Promise<void> => {
  const {
    filename = `reporte-${topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now()}`,
    includeMetadata = true,
    includeSources = true,
    format = 'a4'
  } = options;

  try {
    console.log('Iniciando exportación a PDF...');
    
    // Crear el PDF
    const pdf = new jsPDF('p', 'mm', format);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;

    // Configurar fuentes y estilos
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    
    // Título principal
    const title = `Reporte de Investigación: ${topic}`;
    const titleLines = pdf.splitTextToSize(title, contentWidth);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 8 + 15;

    // Metadata si se incluye
    if (includeMetadata) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      
      const metadata = [
        `Fecha de generación: ${new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        `Fuentes consultadas: ${sources.length}`,
        `Generado con Gauss MathMind IA`
      ];
      
      metadata.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
      pdf.setTextColor(0);
    }

    // Función para añadir nueva página si es necesario
    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Resumen ejecutivo
    if (report.summary && report.summary.length > 0) {
      checkAndAddPage(30);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Resumen Ejecutivo', margin, yPosition);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      report.summary.forEach((item, index) => {
        checkAndAddPage(20);
        
        const bulletPoint = `${index + 1}. ${item}`;
        const lines = pdf.splitTextToSize(bulletPoint, contentWidth - 10);
        
        pdf.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 5 + 3;
      });
      
      yPosition += 10;
    }

    // Contenido del reporte
    if (report.report) {
      checkAndAddPage(30);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Reporte Completo', margin, yPosition);
      yPosition += 12;
      
      // Procesar el contenido markdown a texto plano
      const content = processMarkdownToText(report.report);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      const contentLines = pdf.splitTextToSize(content, contentWidth);
      
      contentLines.forEach((line: string) => {
        checkAndAddPage(6);
        
        // Detectar encabezados y aplicar formato
        if (line.startsWith('###')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text(line.replace('### ', ''), margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          yPosition += 8;
        } else if (line.startsWith('##')) {
          checkAndAddPage(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text(line.replace('## ', ''), margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          yPosition += 10;
        } else if (line.startsWith('#')) {
          checkAndAddPage(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.text(line.replace('# ', ''), margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          yPosition += 12;
        } else if (line.trim()) {
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        } else {
          yPosition += 3;
        }
      });
    }

    // Fuentes si se incluyen
    if (includeSources && sources.length > 0) {
      checkAndAddPage(50);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Fuentes Consultadas', margin, yPosition);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      sources.forEach((source, index) => {
        checkAndAddPage(15);
        
        const sourceText = `${index + 1}. ${source.title}`;
        const sourceLines = pdf.splitTextToSize(sourceText, contentWidth - 5);
        
        pdf.text(sourceLines, margin, yPosition);
        yPosition += sourceLines.length * 4;
        
        if (source.uri) {
          pdf.setTextColor(0, 0, 255);
          pdf.text(source.uri, margin + 5, yPosition);
          pdf.setTextColor(0);
          yPosition += 6;
        }
        
        yPosition += 3;
      });
    }

    // Guardar el PDF
    pdf.save(`${filename}.pdf`);
    
          console.log('PDF exportado exitosamente:', `${filename}.pdf`);
    
  } catch (error) {
          console.error('Error al exportar PDF:', error);
    throw new Error(`Error al exportar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Función auxiliar para procesar markdown a texto plano
const processMarkdownToText = (markdown: string): string => {
  return markdown
    // Eliminar código inline y bloques
    .replace(/```[\s\S]*?```/g, '[Código]')
    .replace(/`([^`]+)`/g, '$1')
    
    // Convertir listas
    .replace(/^\* (.+)$/gm, '• $1')
    .replace(/^\d+\. (.+)$/gm, '$1')
    
    // Limpiar formato
    .replace(/\*\*(.+?)\*\*/g, '$1') // Negritas
    .replace(/\*(.+?)\*/g, '$1')     // Cursivas
    .replace(/^> (.+)$/gm, '» $1')   // Citas
    .replace(/^---$/gm, '')          // Separadores
    
    // Limpiar espacios extra
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};

// Función para exportar usando html2canvas (alternativa más visual)
export const exportReportToPDFAdvanced = async (
  elementId: string,
  filename?: string
): Promise<void> => {
  try {
    console.log('Iniciando exportación avanzada a PDF...');
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento con ID "${elementId}" no encontrado`);
    }

    // Configurar opciones para html2canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgScaledWidth = imgWidth * ratio;
    const imgScaledHeight = imgHeight * ratio;
    
    const marginX = (pdfWidth - imgScaledWidth) / 2;
    const marginY = (pdfHeight - imgScaledHeight) / 2;

    pdf.addImage(imgData, 'PNG', marginX, marginY, imgScaledWidth, imgScaledHeight);
    
    const finalFilename = filename || `reporte-${Date.now()}`;
    pdf.save(`${finalFilename}.pdf`);
    
          console.log('PDF avanzado exportado exitosamente');
    
  } catch (error) {
          console.error('Error al exportar PDF avanzado:', error);
    throw new Error(`Error al exportar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};