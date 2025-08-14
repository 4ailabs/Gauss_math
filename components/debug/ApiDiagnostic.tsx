import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircleIcon, AlertCircleIcon, XIcon, RefreshCwIcon } from '../ui/Icons';
import { isGeminiAvailable } from '../../services/researchService';
import { GoogleGenAI } from "@google/genai";

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const ApiDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Verificar variable de entorno
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      
      if (!apiKey) {
        diagnosticResults.push({
          test: 'API Key Configuration',
          status: 'error',
          message: 'API Key no encontrada',
          details: 'Variables verificadas: GEMINI_API_KEY, API_KEY'
        });
      } else if (apiKey.length < 30) {
        diagnosticResults.push({
          test: 'API Key Configuration',
          status: 'warning',
          message: 'API Key parece ser demasiado corta',
          details: `Longitud: ${apiKey.length} caracteres`
        });
      } else {
        diagnosticResults.push({
          test: 'API Key Configuration',
          status: 'success',
          message: 'API Key encontrada',
          details: `Longitud: ${apiKey.length} caracteres`
        });
      }

      // Test 2: Verificar isGeminiAvailable
      const geminiAvailable = isGeminiAvailable();
      diagnosticResults.push({
        test: 'Gemini Service Check',
        status: geminiAvailable ? 'success' : 'error',
        message: geminiAvailable ? 'Servicio disponible' : 'Servicio no disponible',
        details: `isGeminiAvailable(): ${geminiAvailable}`
      });

      // Test 3: Intentar crear instancia de GoogleGenAI
      try {
        const ai = new GoogleGenAI({ apiKey });
        diagnosticResults.push({
          test: 'GoogleGenAI Instance',
          status: 'success',
          message: 'Instancia creada correctamente',
          details: 'GoogleGenAI se inicializó sin errores'
        });

        // Test 4: Intentar una llamada simple a la API
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Solo responde con "OK" si recibes este mensaje'
          });
          
          const text = response.text.trim();
          if (text) {
            diagnosticResults.push({
              test: 'API Connectivity',
              status: 'success',
              message: 'Conexión exitosa con la API',
              details: `Respuesta: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
            });
          } else {
            diagnosticResults.push({
              test: 'API Connectivity',
              status: 'warning',
              message: 'Conexión establecida pero respuesta vacía',
              details: 'La API respondió pero sin contenido'
            });
          }
        } catch (apiError) {
          diagnosticResults.push({
            test: 'API Connectivity',
            status: 'error',
            message: 'Error al conectar con la API',
            details: apiError instanceof Error ? apiError.message : 'Error desconocido'
          });
        }
      } catch (instanceError) {
        diagnosticResults.push({
          test: 'GoogleGenAI Instance',
          status: 'error',
          message: 'Error al crear instancia',
          details: instanceError instanceof Error ? instanceError.message : 'Error desconocido'
        });
      }

      // Test 5: Verificar permisos de red
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/', { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        diagnosticResults.push({
          test: 'Network Access',
          status: 'success',
          message: 'Acceso a red disponible',
          details: 'Puede acceder a generativelanguage.googleapis.com'
        });
      } catch (networkError) {
        diagnosticResults.push({
          test: 'Network Access',
          status: 'warning',
          message: 'Posible problema de red',
          details: 'No se pudo verificar acceso a la API de Google'
        });
      }

      // Test 6: Verificar variables de entorno del navegador
      const envVars = {
        'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY,
        'VITE_API_KEY': import.meta.env.VITE_API_KEY,
        'NODE_ENV': import.meta.env.NODE_ENV,
        'MODE': import.meta.env.MODE
      };

      const hasViteVars = Object.values(envVars).some(v => v !== undefined);
      diagnosticResults.push({
        test: 'Environment Variables',
        status: hasViteVars ? 'success' : 'warning',
        message: hasViteVars ? 'Variables Vite encontradas' : 'Variables Vite no encontradas',
        details: JSON.stringify(envVars, null, 2)
      });

    } catch (error) {
      diagnosticResults.push({
        test: 'General Diagnostic',
        status: 'error',
        message: 'Error en diagnóstico general',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XIcon className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Diagnóstico de API de Gemini
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={runDiagnostic}
          disabled={isRunning}
          icon={<RefreshCwIcon className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />}
        >
          {isRunning ? 'Ejecutando...' : 'Repetir Diagnóstico'}
        </Button>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {result.test}
                </div>
                <div className="text-sm text-gray-600">
                  {result.message}
                </div>
                {result.details && showDetails && (
                  <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                    {result.details}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalles Técnicos
          </Button>
        </div>
      )}

      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          No hay resultados de diagnóstico disponibles.
        </div>
      )}
    </Card>
  );
};