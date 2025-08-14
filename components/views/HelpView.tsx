import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { 
  BookOpenIcon, 
  LightbulbIcon, 
  MessageCircleIcon, 
  CameraIcon, 
  MicIcon, 
  DownloadIcon, 
  SearchIcon, 
  TargetIcon, 
  ZapIcon, 
  HelpCircleIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  PlayIcon,
  StarIcon,
  GraduationCapIcon,
  ChartBarIcon,
  NetworkIcon,
  SettingsIcon,
  FileTextIcon,
  CalculatorIcon,
  ClockIcon,
  CheckIcon,
  BrainCircuitIcon
} from '../ui/Icons';

const HelpView: React.FC = React.memo(() => {
  const { setActiveView } = useApp();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));
  const [activeTab, setActiveTab] = useState('overview');

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId);

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: <BookOpenIcon className="w-4 h-4" /> },
    { id: 'features', label: 'Funcionalidades', icon: <ZapIcon className="w-4 h-4" /> },
    { id: 'tutorials', label: 'Tutoriales', icon: <PlayIcon className="w-4 h-4" /> },
    { id: 'prompt-engineering', label: 'Prompt Engineering', icon: <BrainCircuitIcon className="w-4 h-4" /> },
    { id: 'faq', label: 'Preguntas Frecuentes', icon: <HelpCircleIcon className="w-4 h-4" /> },
    { id: 'tips', label: 'Consejos y Trucos', icon: <LightbulbIcon className="w-4 h-4" /> },
    { id: 'troubleshooting', label: 'Solución de Problemas', icon: <SettingsIcon className="w-4 h-4" /> }
  ];

  const features = [
    {
      icon: <BookOpenIcon className="w-6 h-6" />,
      title: 'Procesamiento Inteligente de Apuntes',
      description: 'IA avanzada que extrae conceptos clave, identifica dificultades y crea mapas conceptuales',
      category: 'core'
    },
    {
      icon: <TargetIcon className="w-6 h-6" />,
      title: 'Generación de Quizzes Adaptativos',
      description: 'Preguntas personalizadas por dificultad y tipo, con explicaciones detalladas',
      category: 'learning'
    },
    {
      icon: <CalculatorIcon className="w-6 h-6" />,
      title: 'Problemas de Práctica Inteligentes',
      description: 'Ejercicios paso a paso con soluciones detalladas y conceptos aplicados',
      category: 'learning'
    },
    {
      icon: <MessageCircleIcon className="w-6 h-6" />,
      title: 'Chat IA Especializado',
      description: 'Asistente matemático para aclarar dudas y profundizar en conceptos',
      category: 'interactive'
    },
    {
      icon: <CameraIcon className="w-6 h-6" />,
      title: 'Escaneo de Imágenes (OCR)',
      description: 'Extrae texto matemático de fotos, diagramas y apuntes escritos a mano',
      category: 'input'
    },
    {
      icon: <MicIcon className="w-6 h-6" />,
      title: 'Grabación de Voz',
      description: 'Dicta tus apuntes y convierte automáticamente a texto',
      category: 'input'
    },
    {
      icon: <NetworkIcon className="w-6 h-6" />,
      title: 'Mapas Conceptuales',
      description: 'Visualiza relaciones entre conceptos y jerarquías de aprendizaje',
      category: 'advanced'
    },
    {
      icon: <ChartBarIcon className="w-6 h-6" />,
      title: 'Análisis de Dificultad',
      description: 'Clasificación automática de conceptos por nivel de complejidad',
      category: 'advanced'
    },
    {
      icon: <FileTextIcon className="w-6 h-6" />,
      title: 'Historial y Progreso',
      description: 'Seguimiento de tu aprendizaje y acceso a análisis anteriores',
      category: 'core'
    },
    {
      icon: <DownloadIcon className="w-6 h-6" />,
      title: 'Exportación Avanzada',
      description: 'Guarda resultados en múltiples formatos para estudio offline',
      category: 'core'
    }
  ];

  const tutorials = [
    {
      id: 'first-analysis',
      title: 'Tu Primer Análisis de Apuntes',
      steps: [
        'Selecciona "Investigación en Matemáticas" como materia',
        'Pega tus apuntes en el área de texto (mínimo 100 caracteres)',
        'Haz clic en "Procesar apuntes" y espera el análisis',
        'Revisa los conceptos extraídos y su nivel de dificultad',
        'Explora el mapa conceptual para ver relaciones entre temas'
      ],
      duration: '3-5 minutos',
      difficulty: 'Principiante'
    },
    {
      id: 'quiz-generation',
      title: 'Generando Quizzes Personalizados',
      steps: [
        'Procesa tus apuntes primero para extraer conceptos',
        'Selecciona "Generar quiz" como tipo de análisis',
        'Revisa las preguntas generadas por dificultad',
        'Usa el chat para solicitar preguntas específicas',
        'Exporta el quiz para estudio offline'
      ],
      duration: '2-3 minutos',
      difficulty: 'Intermedio'
    },
    {
      id: 'image-scanning',
      title: 'Escaneando Imágenes Matemáticas',
      steps: [
        'Haz clic en el botón de cámara en la entrada de texto',
        'Selecciona una imagen clara de tus apuntes',
        'Espera el procesamiento OCR (puede tomar unos segundos)',
        'Revisa el texto extraído y edita si es necesario',
        'Procesa el texto extraído normalmente'
      ],
      duration: '1-2 minutos',
      difficulty: 'Principiante'
    },
    {
      id: 'voice-input',
      title: 'Usando Entrada de Voz',
      steps: [
        'Haz clic en el botón de micrófono',
        'Habla claramente sobre el tema matemático',
        'El sistema transcribe tu voz en tiempo real',
        'Revisa la transcripción y edita si es necesario',
        'Procesa el texto transcrito'
      ],
      duration: '1-2 minutos',
      difficulty: 'Principiante'
    }
  ];

  const faq = [
    {
      question: '¿Qué materias matemáticas soporta la aplicación?',
      answer: 'Actualmente soporta: Investigación en Matemáticas Aplicadas y Computación, Administración de Bases de Datos, y Elementos de Finanzas e Inversiones. La IA se adapta al contenido específico de cada materia.'
    },
    {
      question: '¿Puedo usar la app sin conexión a internet?',
      answer: 'La app requiere conexión para el procesamiento inicial, pero puedes exportar y guardar resultados para estudio offline. El historial local también está disponible sin conexión.'
    },
    {
      question: '¿Qué tan precisos son los análisis generados?',
      answer: 'La precisión depende de la calidad de los apuntes. Para mejores resultados, incluye definiciones claras, fórmulas y ejemplos. La IA usa múltiples pasadas para mejorar la exactitud.'
    },
    {
      question: '¿Puedo personalizar el nivel de dificultad de los quizzes?',
      answer: 'Sí, la app genera automáticamente preguntas de diferentes niveles (básico, intermedio, avanzado) basándose en el contenido de tus apuntes. También puedes solicitar ajustes específicos en el chat.'
    },
    {
      question: '¿Cómo funciona el análisis de dificultad?',
      answer: 'La IA analiza el contenido matemático y clasifica conceptos por complejidad. Considera factores como: uso de fórmulas avanzadas, conexiones entre temas, y nivel de abstracción requerido.'
    },
    {
      question: '¿Puedo importar apuntes desde otros formatos?',
      answer: 'Actualmente soporta texto plano, imágenes (OCR) y entrada de voz. Estamos trabajando en soporte para PDF, Word y otros formatos comunes.'
    },
    {
      question: '¿La app recuerda mi progreso de estudio?',
      answer: 'Sí, guarda automáticamente tu historial de análisis, conceptos estudiados y progreso. Puedes acceder a todo tu historial desde la biblioteca.'
    },
    {
      question: '¿Cómo puedo obtener mejores resultados?',
      answer: 'Sé específico en tus apuntes, incluye fórmulas y ejemplos, usa LaTeX para notación matemática, y proporciona contexto suficiente para que la IA entienda el tema.'
    }
  ];

  const tips = [
    {
      category: 'Entrada de Datos',
      items: [
        'Usa LaTeX para fórmulas: \\(x^2 + y^2 = r^2\\)',
        'Incluye definiciones y ejemplos en tus apuntes',
        'Organiza el contenido por temas o capítulos',
        'Para imágenes, asegúrate de que el texto sea legible',
        'Habla claramente cuando uses entrada de voz'
      ]
    },
    {
      category: 'Análisis',
      items: [
        'Procesa apuntes completos para mejores resultados',
        'Revisa el mapa conceptual para entender relaciones',
        'Usa el chat para profundizar en conceptos específicos',
        'Exporta resultados para estudio posterior',
        'Compara diferentes análisis del mismo tema'
      ]
    },
    {
      category: 'Estudio',
      items: [
        'Comienza con conceptos básicos identificados por la IA',
        'Usa los quizzes para evaluar tu comprensión',
        'Practica con los problemas generados',
        'Revisa regularmente tu historial de aprendizaje',
        'Combina el análisis de la IA con tu estudio tradicional'
      ]
    }
  ];

  const promptEngineering = [
    {
      category: 'Conceptos Básicos',
      title: '¿Qué es Prompt Engineering?',
      description: 'El arte de formular instrucciones claras y efectivas para obtener las mejores respuestas de la IA',
      examples: [
        {
          prompt: 'Explica el concepto de derivada',
          improvement: 'Explica el concepto de derivada usando ejemplos visuales y aplicaciones prácticas en física'
        },
        {
          prompt: 'Resuelve esta ecuación',
          improvement: 'Resuelve paso a paso la ecuación 2x² + 5x - 3 = 0, explicando cada método utilizado'
        }
      ]
    },
    {
      category: 'Matemáticas Específicas',
      title: 'Prompts para Conceptos Matemáticos',
      description: 'Técnicas especializadas para obtener explicaciones matemáticas claras y detalladas',
      examples: [
        {
          prompt: '¿Qué es la integral?',
          improvement: 'Define la integral definida e indefinida, proporciona ejemplos geométricos y aplicaciones en cálculo de áreas'
        },
        {
          prompt: 'Explica las matrices',
          improvement: 'Explica las matrices 2x2 y 3x3, incluye operaciones básicas, determinantes y aplicaciones en sistemas de ecuaciones'
        }
      ]
    },
    {
      category: 'Resolución de Problemas',
      title: 'Prompts para Ejercicios',
      description: 'Cómo solicitar soluciones paso a paso y explicaciones detalladas',
      examples: [
        {
          prompt: 'Resuelve este problema',
          improvement: 'Resuelve paso a paso este problema de optimización, explicando la lógica detrás de cada paso y verificando la solución'
        },
        {
          prompt: '¿Cómo se hace?',
          improvement: 'Muéstrame el proceso completo para resolver este tipo de problema, incluyendo estrategias y verificaciones'
        }
      ]
    },
    {
      category: 'Comprensión Profunda',
      title: 'Prompts para Aprendizaje',
      description: 'Técnicas para obtener explicaciones que fomenten la comprensión conceptual',
      examples: [
        {
          prompt: '¿Por qué funciona?',
          improvement: 'Explica la intuición matemática detrás de este concepto, usando analogías y ejemplos del mundo real'
        },
        {
          prompt: '¿Cuál es la conexión?',
          improvement: 'Muéstrame cómo este concepto se relaciona con otros temas matemáticos y por qué es importante'
        }
      ]
    }
  ];

  const troubleshooting = [
    {
      problem: 'La app no procesa mis apuntes',
      solutions: [
        'Verifica que tengas conexión a internet',
        'Asegúrate de que el texto tenga al menos 100 caracteres',
        'Intenta con un texto más simple primero',
        'Revisa que no haya caracteres especiales problemáticos'
      ]
    },
    {
      problem: 'Los resultados no son precisos',
      solutions: [
        'Revisa la calidad y claridad de tus apuntes',
        'Incluye más contexto y definiciones',
        'Usa el chat para solicitar aclaraciones',
        'Procesa apuntes más completos del mismo tema'
      ]
    },
    {
      problem: 'La app es lenta',
      solutions: [
        'Verifica tu conexión a internet',
        'Reduce la cantidad de texto en una sola entrada',
        'Cierra otras aplicaciones que consuman recursos',
        'Usa el modo de procesamiento básico si es necesario'
      ]
    },
    {
      problem: 'No puedo escanear imágenes',
      solutions: [
        'Verifica que la imagen sea clara y legible',
        'Asegúrate de que el texto esté bien iluminado',
        'Intenta con una imagen de mejor resolución',
        'Verifica que la app tenga permisos de cámara'
      ]
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-teal-600" />
                ¿Qué es Gauss∑ AI?
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Gauss∑ AI es tu asistente personal de matemáticas universitarias, diseñado específicamente para estudiantes de 7mo semestre. 
                Utiliza inteligencia artificial avanzada para transformar tus apuntes en recursos de aprendizaje estructurados y personalizados.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    <TargetIcon className="w-8 h-8 mx-auto" />
                  </div>
                  <div className="text-sm text-gray-600">Precisión Matemática</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    <ZapIcon className="w-8 h-8 mx-auto" />
                  </div>
                  <div className="text-sm text-gray-600">Aprendizaje Acelerado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    <LightbulbIcon className="w-8 h-8 mx-auto" />
                  </div>
                  <div className="text-sm text-gray-600">Comprensión Profunda</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCapIcon className="w-5 h-5 text-blue-600" />
                  Para Estudiantes
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Análisis inteligente de apuntes</li>
                  <li>• Generación de quizzes personalizados</li>
                  <li>• Identificación de conceptos clave</li>
                  <li>• Seguimiento del progreso de aprendizaje</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-green-600" />
                  Para Profesores
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Creación rápida de material didáctico</li>
                  <li>• Evaluación de comprensión estudiantil</li>
                  <li>• Identificación de áreas de dificultad</li>
                  <li>• Generación de problemas de práctica</li>
                </ul>
              </Card>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start gap-3">
                    <div className="text-teal-600 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        feature.category === 'core' ? 'bg-blue-100 text-blue-800' :
                        feature.category === 'learning' ? 'bg-green-100 text-green-800' :
                        feature.category === 'interactive' ? 'bg-purple-100 text-purple-800' :
                        feature.category === 'input' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {feature.category === 'core' ? 'Núcleo' :
                         feature.category === 'learning' ? 'Aprendizaje' :
                         feature.category === 'interactive' ? 'Interactivo' :
                         feature.category === 'input' ? 'Entrada' : 'Avanzado'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'tutorials':
        return (
          <div className="space-y-6">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{tutorial.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {tutorial.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ChartBarIcon className="w-4 h-4" />
                      {tutorial.difficulty}
                    </span>
                  </div>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  {tutorial.steps.map((step, index) => (
                    <li key={index} className="leading-relaxed">
                      <span className="font-medium text-gray-900">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            {faq.map((item, index) => (
              <Card key={index} className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  {item.question}
                </h4>
                <p className="text-gray-700 leading-relaxed">{item.answer}</p>
              </Card>
            ))}
          </div>
        );

      case 'prompt-engineering':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BrainCircuitIcon className="w-6 h-6 text-purple-600" />
                Prompt Engineering para Matemáticas
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Aprende a formular instrucciones efectivas para obtener las mejores respuestas de la IA en matemáticas. 
                Un buen prompt puede transformar una explicación básica en una comprensión profunda y detallada.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-700 mb-2">🎯 Principios Clave</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Sé específico y detallado</li>
                    <li>• Solicita ejemplos y aplicaciones</li>
                    <li>• Pide explicaciones paso a paso</li>
                    <li>• Solicita conexiones con otros temas</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-700 mb-2">💡 Beneficios</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Explicaciones más claras</li>
                    <li>• Comprensión conceptual profunda</li>
                    <li>• Aprendizaje más efectivo</li>
                    <li>• Mejor retención de conceptos</li>
                  </ul>
                </div>
              </div>
            </div>

            {promptEngineering.map((category, index) => (
              <Card key={index} className="p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BrainCircuitIcon className="w-5 h-5 text-purple-600" />
                    {category.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </div>
                
                <div className="space-y-4">
                  {category.examples.map((example, exampleIndex) => (
                    <div key={exampleIndex} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium text-red-600 mb-2 text-sm">❌ Prompt Básico</div>
                          <div className="bg-white p-3 rounded border border-red-200 text-sm text-gray-700">
                            "{example.prompt}"
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600 mb-2 text-sm">✅ Prompt Mejorado</div>
                          <div className="bg-white p-3 rounded border border-green-200 text-sm text-gray-700">
                            "{example.improvement}"
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LightbulbIcon className="w-5 h-5 text-blue-600" />
                Consejos Adicionales para Prompts Matemáticos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">📐 Para Geometría y Visualización</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Solicita diagramas y representaciones visuales</li>
                    <li>• Pide ejemplos del mundo real</li>
                    <li>• Solicita diferentes métodos de resolución</li>
                    <li>• Pide verificación de resultados</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">🧮 Para Álgebra y Cálculo</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Solicita pasos intermedios detallados</li>
                    <li>• Pide explicación de cada transformación</li>
                    <li>• Solicita verificación de cada paso</li>
                    <li>• Pide conexiones con conceptos previos</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'tips':
        return (
          <div className="space-y-6">
            {tips.map((category, index) => (
              <Card key={index} className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LightbulbIcon className="w-5 h-5 text-yellow-600" />
                  {category.category}
                </h4>
                <ul className="space-y-2">
                  {category.items.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <LightbulbIcon className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="space-y-6">
            {troubleshooting.map((item, index) => (
              <Card key={index} className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-red-600" />
                  {item.problem}
                </h4>
                <div className="space-y-2">
                  {item.solutions.map((solution, solutionIndex) => (
                    <div key={solutionIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckIcon className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>{solution}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Centro de Ayuda y Recursos
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubre cómo aprovechar al máximo Gauss∑ AI para tu aprendizaje matemático
        </p>
      </div>

      {/* Tabs de Navegación */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Sección de Contacto */}
      <Card className="p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          ¿Necesitas más ayuda?
        </h3>
        <p className="text-gray-600 mb-4">
          Si tienes preguntas específicas o necesitas asistencia adicional, 
          no dudes en contactarnos o usar el chat integrado de la aplicación.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveView('search')}
            icon={<MessageCircleIcon className="w-4 h-4" />}
          >
            Ir a Búsqueda
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setActiveView('library')}
            icon={<BookOpenIcon className="w-4 h-4" />}
          >
            Ver Biblioteca
          </Button>
        </div>
      </Card>
      
      {/* El Layout ya incluye el footer con el crédito */}
    </div>
  );
});

export default HelpView;