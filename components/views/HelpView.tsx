import React from 'react';
import { Card } from '../ui/Card';

const HelpView: React.FC = React.memo(() => {
  const features = [
    'Procesamiento de apuntes con IA',
    'Generación de quizzes personalizados',
    'Búsqueda de problemas relacionados',
    'Chat interactivo con IA especializada',
    'Escaneo de imágenes con OCR',
    'Grabación de voz para entrada de texto',
    'Historial de análisis y progreso',
    'Exportación de resultados',
  ];

  const steps = [
    'Selecciona la materia que quieres estudiar',
    'Pega tus apuntes o describe lo que quieres aprender',
    'Elige el tipo de análisis: procesar, generar quiz o encontrar problemas',
    'Haz clic en el botón correspondiente para procesar',
    'Revisa el análisis generado con conceptos, preguntas y problemas',
    'Usa el chat para hacer preguntas adicionales',
    'Guarda o exporta tus resultados para estudio posterior',
  ];

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ayuda y Guía de Uso</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Cómo usar Gauss∑ AI?</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                {steps.map((step, index) => (
                  <li key={index} className="leading-relaxed">
                    <span className="font-medium text-blue-900">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funciones Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Consejos para Mejores Resultados</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">💡</span>
                  <span>Sé específico en tus apuntes: incluye fórmulas, definiciones y ejemplos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">💡</span>
                  <span>Usa LaTeX para fórmulas matemáticas: \(x^2 + y^2 = r^2\)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">💡</span>
                  <span>El chat puede ayudarte a clarificar conceptos específicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">💡</span>
                  <span>Guarda tus análisis para revisar tu progreso de estudio</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Materias Soportadas</h3>
            <div className="space-y-3">
              {[
                'Investigación en Matemáticas Aplicadas y Computación',
                'Administración de Bases de Datos', 
                'Elementos de Finanzas e Inversiones'
              ].map((subject) => (
                <div key={subject} className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <span className="text-teal-800 font-medium text-sm">
                    {subject}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

export default HelpView;