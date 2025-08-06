# Gauss MathMind IA 🧮

Una aplicación inteligente para estudiantes avanzados de matemáticas que combina un editor de apuntes con IA conversacional especializada. Diseñada para maximizar la eficiencia del estudio mediante el procesamiento automático de apuntes y asistencia personalizada.

## ✨ Características

- **📝 Editor de Apuntes**: Soporte completo para LaTeX y fórmulas matemáticas
- **🤖 IA Conversacional**: Asistente especializado en materias matemáticas
- **🎤 Reconocimiento de Voz**: Dictado automático de apuntes
- **📷 Escaneo de Imágenes**: Extracción de texto de fotos de apuntes
- **📊 Procesamiento Inteligente**: Análisis automático con resúmenes, conceptos clave y ejercicios
- **📄 Exportación PDF**: Generación de documentos para estudio offline
- **📱 Diseño Responsive**: Funciona perfectamente en desktop y móvil

## 🚀 Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS
- **IA**: Google Gemini 2.5 Flash
- **Matemáticas**: KaTeX
- **Exportación**: jsPDF + html2canvas

## 📦 Instalación Local

### Prerrequisitos
- Node.js 18+ 
- API Key de Google Gemini

### Pasos

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/4ailabs/gauss-mathmind-ia.git
   cd gauss-mathmind-ia
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp env.example .env.local
   ```
   Edita `.env.local` y agrega tu API key de Gemini:
   ```
   GEMINI_API_KEY=tu_api_key_aqui
   ```

4. **Ejecuta en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abre en tu navegador**
   ```
   http://localhost:5173
   ```

## 🌐 Deployment en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. **Conecta tu repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración

2. **Configura la variable de entorno**
   - En el dashboard de Vercel, ve a Settings > Environment Variables
   - Agrega `GEMINI_API_KEY` con tu API key de Gemini

3. **¡Listo!** Tu app se desplegará automáticamente

### Opción 2: Deploy Manual

1. **Instala Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configura variables de entorno**
   ```bash
   vercel env add GEMINI_API_KEY
   ```

## 🔧 Configuración

### Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Copia la key y configúrala en las variables de entorno

### Materias Soportadas

La aplicación está configurada para:
- Investigación en Matemáticas Aplicadas y Computación
- Administración de Bases de Datos  
- Elementos de Finanzas e Inversiones

Puedes modificar las materias en `App.tsx` línea 50.

## 📱 Uso

1. **Editor**: Escribe o pega tus apuntes matemáticos
2. **IA**: Haz preguntas específicas sobre la materia
3. **Procesamiento**: Analiza automáticamente tus apuntes
4. **Exportación**: Genera PDFs para estudio offline

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**4ailabs** - [GitHub](https://github.com/4ailabs)

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
