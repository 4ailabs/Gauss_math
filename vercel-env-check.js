// Script para verificar configuración de variables de entorno en Vercel
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno desde .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

console.log('🔍 Verificando configuración de variables de entorno...');
console.log('='.repeat(60));

// Verificar variables disponibles
const checks = {
  'VITE_GEMINI_API_KEY': process.env.VITE_GEMINI_API_KEY,
  'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
  'NODE_ENV': process.env.NODE_ENV,
  'VERCEL': process.env.VERCEL,
  'VERCEL_ENV': process.env.VERCEL_ENV
};

console.log('📋 Variables de entorno disponibles:');
Object.entries(checks).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const preview = value ? `${value.substring(0, 10)}...` : 'No definida';
  console.log(`${status} ${key}: ${preview}`);
});

console.log('='.repeat(60));

// Verificar configuración específica para Vercel
if (process.env.VERCEL) {
  console.log('🚀 Ejecutándose en Vercel');
  
  // En Vercel, GEMINI_API_KEY es suficiente
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ CRÍTICO: GEMINI_API_KEY no está configurada en Vercel');
    console.log('📝 Para configurar en Vercel:');
    console.log('   1. Ve a tu dashboard de Vercel');
    console.log('   2. Settings → Environment Variables');
    console.log('   3. Agrega: GEMINI_API_KEY = tu_api_key');
    console.log('   4. Aplica a: Production, Preview, Development');
    process.exit(1);
  } else {
    console.log('✅ GEMINI_API_KEY configurada correctamente en Vercel');
  }
} else {
  console.log('💻 Ejecutándose en desarrollo local');
}

console.log('✅ Verificación completa');