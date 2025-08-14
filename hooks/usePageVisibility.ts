import { useEffect, useState, useCallback } from 'react';

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastVisibilityChange, setLastVisibilityChange] = useState(Date.now());

  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    const wasVisible = isVisible;
    const isNowVisible = !document.hidden;
    
    setIsVisible(isNowVisible);
    setLastVisibilityChange(now);

    // Si la página se oculta, podemos pausar procesos activos
    if (wasVisible && !isNowVisible) {
      console.log('Página oculta - pausando procesos activos');
      // Aquí podrías emitir un evento o llamar a una función de pausa
      document.dispatchEvent(new CustomEvent('pageHidden'));
    }

    // Si la página se vuelve visible, podemos reanudar procesos
    if (!wasVisible && isNowVisible) {
      console.log('Página visible - reanudando procesos activos');
      // Aquí podrías emitir un evento o llamar a una función de reanudación
      document.dispatchEvent(new CustomEvent('pageVisible'));
    }
  }, [isVisible]);

  useEffect(() => {
    // Eventos estándar de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Eventos adicionales para mejor compatibilidad
    window.addEventListener('blur', () => {
      if (isVisible) {
        setIsVisible(false);
        setLastVisibilityChange(Date.now());
        document.dispatchEvent(new CustomEvent('pageHidden'));
      }
    });

    window.addEventListener('focus', () => {
      if (!isVisible) {
        setIsVisible(true);
        setLastVisibilityChange(Date.now());
        document.dispatchEvent(new CustomEvent('pageVisible'));
      }
    });

    // Limpiar event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', () => {});
      window.removeEventListener('focus', () => {});
    };
  }, [handleVisibilityChange]);

  // Función para verificar si la página ha estado oculta por mucho tiempo
  const getHiddenDuration = useCallback(() => {
    if (isVisible) return 0;
    return Date.now() - lastVisibilityChange;
  }, [isVisible, lastVisibilityChange]);

  // Función para verificar si la página ha estado oculta más de un tiempo límite
  const isHiddenTooLong = useCallback((maxHiddenTime = 5 * 60 * 1000) => { // 5 minutos por defecto
    return getHiddenDuration() > maxHiddenTime;
  }, [getHiddenDuration]);

  return {
    isVisible,
    lastVisibilityChange,
    getHiddenDuration,
    isHiddenTooLong
  };
};
