// Prompts especializados para Elementos de Finanzas e Inversiones
// Basado en el temario oficial de la UNAM FES Acatlán

export const finanzasInversionesPrompts = {
  // Unidad 1: Elementos básicos de matemáticas financieras (20 horas)
  unidad1: {
    conceptos: [
      'Definición de interés',
      'Interés simple vs interés compuesto',
      'Valor presente y valor futuro',
      'Tasa de interés efectiva y nominal',
      'Anualidades ordinarias y anticipadas',
      'Capitalización y descuento',
      'Factor de capitalización',
      'Factor de actualización'
    ],
    prompt: `Analiza este contenido desde la perspectiva de matemáticas financieras básicas. 
    Enfócate en: cálculos de interés, valor temporal del dinero, fórmulas de capitalización y descuento, 
    y conceptos fundamentales para la toma de decisiones financieras.`
  },

  // Unidad 2: Aplicaciones de las matemáticas financieras (16 horas)
  unidad2: {
    conceptos: [
      'Tablas de amortización',
      'Sistemas de amortización (francés, alemán, americano)',
      'Depreciación (línea recta, suma de dígitos, doble declinación)',
      'Capitalización de rentas',
      'Gradientes aritméticos y geométricos',
      'Análisis de préstamos y créditos',
      'Cálculo de cuotas y saldos'
    ],
    prompt: `Analiza este contenido enfocándose en aplicaciones prácticas de matemáticas financieras. 
    Enfócate en: construcción de tablas de amortización, métodos de depreciación, cálculo de cuotas, 
    y análisis cuantitativo de productos financieros como préstamos y créditos.`
  },

  // Unidad 3: Mercado de dinero, de capitales y derivados (14 horas)
  unidad3: {
    conceptos: [
      'Sistema financiero mexicano',
      'Mercado de dinero: CETES, papel comercial, aceptaciones bancarias',
      'Mercado de capitales: acciones, bonos, obligaciones',
      'Productos derivados: futuros, opciones, swaps',
      'Valuación de bonos y acciones',
      'Riesgo y rendimiento',
      'Índices bursátiles',
      'Regulación financiera'
    ],
    prompt: `Analiza este contenido desde la perspectiva de mercados financieros. 
    Enfócate en: estructura del sistema financiero, instrumentos de inversión, valuación de activos financieros, 
    y comprensión de productos derivados para la gestión de riesgos.`
  },

  // Unidad 4: Métodos de evaluación financiera (14 horas)
  unidad4: {
    conceptos: [
      'Valor Actual Neto (VAN)',
      'Tasa Interna de Retorno (TIR)',
      'Período de recuperación (Payback)',
      'Índice de rentabilidad',
      'Análisis de sensibilidad',
      'Evaluación de proyectos de inversión',
      'Flujos de efectivo',
      'Costo de capital'
    ],
    prompt: `Analiza este contenido enfocándose en métodos de evaluación financiera de proyectos. 
    Enfócate en: cálculo e interpretación de VAN y TIR, análisis de flujos de efectivo, 
    métodos de evaluación de inversiones, y toma de decisiones basada en criterios financieros.`
  }
};

// Detección automática de unidad basada en contenido
export const detectarUnidadFinanzas = (contenido: string): string => {
  const contenidoLower = contenido.toLowerCase();
  
  if (contenidoLower.includes('interés') || contenidoLower.includes('simple') || 
      contenidoLower.includes('compuesto') || contenidoLower.includes('valor presente') || 
      contenidoLower.includes('valor futuro') || contenidoLower.includes('anualidades')) {
    return 'finanzas_unidad1';
  }
  
  if (contenidoLower.includes('amortización') || contenidoLower.includes('depreciación') || 
      contenidoLower.includes('capitalización') || contenidoLower.includes('gradientes') || 
      contenidoLower.includes('préstamos')) {
    return 'finanzas_unidad2';
  }
  
  if (contenidoLower.includes('mercado') || contenidoLower.includes('dinero') || 
      contenidoLower.includes('capitales') || contenidoLower.includes('derivados') || 
      contenidoLower.includes('instrumentos financieros') || contenidoLower.includes('bonos') || 
      contenidoLower.includes('acciones')) {
    return 'finanzas_unidad3';
  }
  
  if (contenidoLower.includes('van') || contenidoLower.includes('tir') || 
      contenidoLower.includes('valor actual neto') || contenidoLower.includes('tasa interna') || 
      contenidoLower.includes('payback') || contenidoLower.includes('evaluación')) {
    return 'finanzas_unidad4';
  }
  
  // Default: análisis general de finanzas
  return 'general';
};

// Prompt general para finanzas e inversiones
export const promptGeneralFinanzas = `Eres un experto en finanzas e inversiones. 
Analiza este contenido académico considerando:

1. Matemáticas financieras (interés, valor temporal del dinero)
2. Productos y mercados financieros
3. Métodos de evaluación de inversiones
4. Gestión de riesgos financieros
5. Análisis cuantitativo para toma de decisiones

Enfócate en generar contenido que ayude a un estudiante de 7mo semestre a desarrollar 
habilidades en el análisis financiero y evaluación de inversiones.`;

// Sugerencias específicas por unidad
export const sugerenciasPorUnidadFinanzas = {
  finanzas_unidad1: [
    'Cálculo de interés simple y compuesto',
    'Valor presente y futuro de flujos',
    'Anualidades y rentas perpetuas'
  ],
  finanzas_unidad2: [
    'Construcción de tablas de amortización',
    'Métodos de depreciación',
    'Análisis de préstamos hipotecarios'
  ],
  finanzas_unidad3: [
    'Valuación de bonos y acciones',
    'Productos derivados básicos',
    'Análisis de mercados financieros'
  ],
  finanzas_unidad4: [
    'Cálculo de VAN y TIR',
    'Evaluación de proyectos de inversión',
    'Análisis de sensibilidad financiera'
  ]
};