# Configuración de Vercel para Gauss MathMind IA

## 🔑 Configuración de la API Key de Gemini

### Paso 1: Obtener API Key de Google AI Studio

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

### Paso 2: Configurar Variable de Entorno en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Navega a **Settings** > **Environment Variables**
3. Haz clic en **Add New**
4. Configura:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `tu_api_key_aqui` (pega la API key que copiaste)
   - **Environment**: Selecciona **Production** (y Development si quieres)
5. Haz clic en **Save**

### Paso 3: Verificar la Configuración

1. Ve a **Deployments** en tu proyecto de Vercel
2. Haz clic en el deployment más reciente
3. Haz clic en **Redeploy** para aplicar los cambios
4. Espera a que termine el deployment

### Paso 4: Probar la Aplicación

1. Ve a tu URL de Vercel (ej: `gauss-math-mind-ia.vercel.app`)
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña **Console**
4. Intenta procesar algunos apuntes
5. Verifica que aparezcan los logs de debugging

## 🔍 Troubleshooting

### Si ves "API Key no configurada":
- Verifica que la variable se llame exactamente `GEMINI_API_KEY`
- Asegúrate de que esté configurada para **Production**
- Haz un redeploy después de configurar la variable

### Si ves "Error de conexión":
- Verifica tu conexión a internet
- Asegúrate de que la API key sea válida
- Revisa la consola del navegador para más detalles

### Si ves "Cuota excedida":
- Verifica tu cuota en Google AI Studio
- Espera un tiempo y vuelve a intentar
- Considera actualizar tu plan si es necesario

## 📝 Logs de Debugging

La aplicación ahora incluye logs detallados en la consola del navegador:

- `API Key configurada: Sí/No`
- `API Key length: X`
- `API Key preview: AIza...`
- `Procesando apuntes para materia: X`
- `Longitud de apuntes: X`
- `Enviando solicitud a Gemini API...`
- `Respuesta recibida de Gemini API`
- `Parseando respuesta JSON...`
- `Procesamiento completado exitosamente`

## 🚀 Comandos Útiles

```bash
# Verificar variables de entorno localmente
echo $GEMINI_API_KEY

# Redeploy en Vercel
vercel --prod

# Ver logs de deployment
vercel logs
``` 