import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { 
  BookOpenIcon, 
  GlobeIcon, 
  VideoIcon, 
  FileTextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  StarIcon
} from './Icons';

export interface EnhancedSource {
  uri: string;
  title: string;
  domain: string;
  type: 'academic' | 'educational' | 'video' | 'article' | 'other';
  reliability: 'high' | 'medium' | 'low';
  lastAccessed?: string;
}

interface EnhancedSourcesDisplayProps {
  sources: EnhancedSource[];
  title?: string;
  collapsible?: boolean;
}

export const EnhancedSourcesDisplay: React.FC<EnhancedSourcesDisplayProps> = ({
  sources,
  title = "Fuentes Consultadas",
  collapsible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Función para obtener el icono según el tipo de fuente
  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <StarIcon className="w-4 h-4 text-blue-600" />;
      case 'educational':
        return <BookOpenIcon className="w-4 h-4 text-green-600" />;
      case 'video':
        return <VideoIcon className="w-4 h-4 text-red-600" />;
      case 'article':
        return <FileTextIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <GlobeIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  // Función para obtener el color de confiabilidad
  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener el texto de confiabilidad
  const getReliabilityText = (reliability: string) => {
    switch (reliability) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Desconocida';
    }
  };

  // Función para extraer el dominio de la URL
  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  // Función para categorizar la fuente automáticamente
  const categorizeSource = (url: string, title: string): EnhancedSource['type'] => {
    const domain = extractDomain(url).toLowerCase();
    const titleLower = title.toLowerCase();

    // Fuentes académicas
    if (domain.includes('arxiv.org') || domain.includes('researchgate.net') || 
        domain.includes('scholar.google.com') || domain.includes('academia.edu') ||
        domain.includes('jstor.org') || domain.includes('ieee.org') ||
        domain.includes('springer.com') || domain.includes('sciencedirect.com')) {
      return 'academic';
    }

    // Fuentes educativas
    if (domain.includes('khanacademy.org') || domain.includes('ck12.org') ||
        domain.includes('openstax.org') || domain.includes('mit.edu') ||
        domain.includes('harvard.edu') || domain.includes('stanford.edu')) {
      return 'educational';
    }

    // Videos
    if (domain.includes('youtube.com') || domain.includes('vimeo.com') ||
        titleLower.includes('video') || titleLower.includes('tutorial')) {
      return 'video';
    }

    // Artículos
    if (domain.includes('wikipedia.org') || domain.includes('medium.com') ||
        domain.includes('blog') || titleLower.includes('artículo')) {
      return 'article';
    }

    return 'other';
  };

  // Función para evaluar la confiabilidad
  const evaluateReliability = (type: string, domain: string): EnhancedSource['reliability'] => {
    const domainLower = domain.toLowerCase();
    
    // Fuentes de alta confiabilidad
    if (type === 'academic' || 
        domainLower.includes('khanacademy.org') || 
        domainLower.includes('mit.edu') ||
        domainLower.includes('harvard.edu') ||
        domainLower.includes('stanford.edu') ||
        domainLower.includes('openstax.org')) {
      return 'high';
    }

    // Fuentes de confiabilidad media
    if (type === 'educational' || 
        domainLower.includes('ck12.org') ||
        domainLower.includes('geogebra.org')) {
      return 'medium';
    }

    // Fuentes de confiabilidad baja
    if (domainLower.includes('youtube.com') || 
        domainLower.includes('reddit.com') ||
        domainLower.includes('blogspot.com')) {
      return 'low';
    }

    return 'medium';
  };

  // Procesar y mejorar las fuentes
  const enhancedSources: EnhancedSource[] = sources.map(source => {
    const domain = extractDomain(source.uri);
    const type = categorizeSource(source.uri, source.title);
    const reliability = evaluateReliability(type, domain);
    
    return {
      uri: source.uri,
      title: source.title,
      domain,
      type,
      reliability,
      lastAccessed: new Date().toLocaleDateString('es-ES')
    };
  });

  // Agrupar fuentes por tipo
  const groupedSources = enhancedSources.reduce((acc, source) => {
    if (!acc[source.type]) {
      acc[source.type] = [];
    }
    acc[source.type].push(source);
    return acc;
  }, {} as Record<string, EnhancedSource[]>);

  // Ordenar tipos por prioridad
  const typePriority = ['academic', 'educational', 'article', 'video', 'other'];

  if (sources.length === 0) {
    return null;
  }

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
          <BookOpenIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          {title}
        </h3>
        
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? <ChevronUpIcon className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
            className="min-h-[36px] sm:min-h-[32px]"
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3 sm:space-y-4">
          {/* Estadísticas de fuentes - Grid responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-700 text-sm sm:text-base">{enhancedSources.filter(s => s.reliability === 'high').length}</div>
              <div className="text-blue-600 text-xs">Alta Confiabilidad</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-700 text-sm sm:text-base">{enhancedSources.filter(s => s.type === 'academic').length}</div>
              <div className="text-green-600 text-xs">Académicas</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-700 text-sm sm:text-base">{enhancedSources.filter(s => s.type === 'educational').length}</div>
              <div className="text-purple-600 text-xs">Educativas</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-700 text-sm sm:text-base">{sources.length}</div>
              <div className="text-gray-600 text-xs">Total</div>
            </div>
          </div>

          {/* Fuentes agrupadas por tipo */}
          {typePriority.map(type => {
            const typeSources = groupedSources[type];
            if (!typeSources || typeSources.length === 0) return null;

            const typeLabels = {
              academic: 'Fuentes Académicas',
              educational: 'Recursos Educativos',
              article: 'Artículos y Documentos',
              video: 'Videos y Tutoriales',
              other: 'Otras Fuentes'
            };

            return (
              <div key={type} className="space-y-2 sm:space-y-3">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {typeLabels[type as keyof typeof typeLabels]}
                </h4>
                
                <div className="space-y-2 sm:space-y-3">
                  {typeSources.map((source, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getSourceIcon(source.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                            {source.title}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getReliabilityColor(source.reliability)}`}>
                            {getReliabilityText(source.reliability)}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                          <span className="font-mono text-xs truncate">{source.domain}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-xs">{source.lastAccessed}</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(source.uri, '_blank')}
                        icon={<ExternalLinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                        className="flex-shrink-0 min-h-[36px] sm:min-h-[32px] px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline">Abrir</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
