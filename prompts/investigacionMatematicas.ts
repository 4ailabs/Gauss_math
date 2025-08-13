// Prompts especializados para Investigación en Matemáticas Aplicadas y Computación
// Basado en el temario oficial de la UNAM FES Acatlán

export const investigacionMatematicasPrompts = {
  // Unidad 1: Qué es un artículo de investigación
  unidad1: {
    conceptos: [
      'Investigación y sociedad del conocimiento',
      'Ciencia y conocimiento público',
      'Artículo de investigación original',
      'Estructura IMRyD (Introducción, Material y Métodos, Resultados y Discusión)',
      'Artículo de revisión',
      'Ejemplos en Matemáticas Aplicadas y Computación'
    ],
    prompt: `Analiza este contenido desde la perspectiva de la investigación científica en matemáticas aplicadas y computación. 
    Enfócate en: estructura de artículos científicos, metodología de investigación, y la importancia de la investigación 
    para producir conocimiento en la sociedad actual.`
  },

  // Unidad 2: La revisión de la literatura
  unidad2: {
    conceptos: [
      'Información de calidad',
      'Revistas especializadas indexadas',
      'Web of Knowledge',
      'Factor de impacto',
      'Journal Citation Reports',
      'EigenFactor',
      'Contexto y antecedentes',
      'Administradores de referencias (EndNote, Mendeley)',
      'Estilos de aparato crítico (Chicago, APA, ISO, Vancouver)',
      'Current Contents Connect',
      'Citas textuales y paráfrasis'
    ],
    prompt: `Analiza este contenido enfocándose en fuentes de información científica de calidad, 
    revisión de literatura especializada en matemáticas aplicadas y computación, y metodología 
    para construir antecedentes sólidos en investigación académica.`
  },

  // Unidad 3: Métodos de investigación
  unidad3: {
    conceptos: [
      'Hipótesis',
      'Diseños experimentales',
      'Diseños cuasiexperimentales',
      'Diseños no experimentales',
      'Diseños longitudinales',
      'Instrumentos de recolección de datos',
      'Observación, encuestas, muestreo',
      'Cuestionarios y entrevistas'
    ],
    prompt: `Analiza este contenido desde la perspectiva de metodología de investigación cuantitativa 
    en matemáticas aplicadas y computación. Enfócate en diseños de investigación, formulación de 
    hipótesis verificables con datos empíricos, y métodos de recolección de datos apropiados.`
  },

  // Unidad 4: Presentación de resultados
  unidad4: {
    conceptos: [
      'Uso de estándares y unidades',
      'Presentación discursiva',
      'Presentación de cuadros',
      'Figuras estadísticas'
    ],
    prompt: `Analiza este contenido enfocándose en la presentación apropiada de resultados de investigación 
    en matemáticas aplicadas y computación, incluyendo estándares, visualización de datos, y 
    comunicación efectiva de hallazgos científicos.`
  },

  // Unidad 5: Discusión
  unidad5: {
    conceptos: [
      'Explicación de resultados obtenidos',
      'Contraste con investigaciones semejantes',
      'Hallazgos',
      'Generalizaciones',
      'Limitaciones',
      'Investigaciones futuras'
    ],
    prompt: `Analiza este contenido desde la perspectiva de discusión científica en investigación matemática, 
    enfocándose en interpretación de resultados, contraste con literatura existente, identificación 
    de hallazgos significativos, y proyección de investigaciones futuras.`
  }
};

// Detección automática de unidad basada en contenido
export const detectarUnidad = (contenido: string): string => {
  const contenidoLower = contenido.toLowerCase();
  
  if (contenidoLower.includes('artículo') || contenidoLower.includes('imryd') || 
      contenidoLower.includes('estructura') || contenidoLower.includes('investigación original')) {
    return 'unidad1';
  }
  
  if (contenidoLower.includes('literatura') || contenidoLower.includes('referencias') || 
      contenidoLower.includes('citación') || contenidoLower.includes('índice') || 
      contenidoLower.includes('mendeley') || contenidoLower.includes('endnote')) {
    return 'unidad2';
  }
  
  if (contenidoLower.includes('hipótesis') || contenidoLower.includes('experimental') || 
      contenidoLower.includes('diseño') || contenidoLower.includes('metodología')) {
    return 'unidad3';
  }
  
  if (contenidoLower.includes('resultados') || contenidoLower.includes('cuadros') || 
      contenidoLower.includes('figuras') || contenidoLower.includes('estándares')) {
    return 'unidad4';
  }
  
  if (contenidoLower.includes('discusión') || contenidoLower.includes('conclusiones') || 
      contenidoLower.includes('limitaciones') || contenidoLower.includes('futuras')) {
    return 'unidad5';
  }
  
  // Default: análisis general de investigación
  return 'general';
};

// Prompt general para investigación en matemáticas aplicadas
export const promptGeneral = `Eres un experto en investigación en matemáticas aplicadas y computación. 
Analiza este contenido académico considerando:

1. Metodología de investigación científica
2. Estructura de artículos académicos (IMRyD)
3. Revisión de literatura especializada
4. Diseños experimentales y recolección de datos
5. Presentación de resultados científicos
6. Discusión académica y proyecciones futuras

Enfócate en generar contenido que ayude a un estudiante de 7mo semestre a desarrollar 
habilidades de investigación científica en el área de matemáticas aplicadas y computación.`;

// Sugerencias específicas por unidad
export const sugerenciasPorUnidad = {
  unidad1: [
    'Estructura IMRyD de artículos',
    'Ejemplos de investigación en matemáticas aplicadas',
    'Diferencia entre artículo original y de revisión'
  ],
  unidad2: [
    'Búsqueda en Web of Knowledge',
    'Análisis de factor de impacto',
    'Gestión de referencias con Mendeley'
  ],
  unidad3: [
    'Formulación de hipótesis verificables',
    'Diseños experimentales en computación',
    'Métodos de recolección de datos'
  ],
  unidad4: [
    'Estándares de presentación científica',
    'Visualización efectiva de datos',
    'Figuras estadísticas apropiadas'
  ],
  unidad5: [
    'Interpretación de resultados',
    'Comparación con literatura existente',
    'Proyección de investigaciones futuras'
  ]
};