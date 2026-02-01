/**
 * Script de prueba para verificar que las coordenadas se envían correctamente
 * Este script simula exactamente lo que hace createApiary en el código real
 */

console.log('🧪 PRUEBA: Verificación de envío de coordenadas al crear apiario\n');
console.log('=' .repeat(60));

// Simular datos de apiario con coordenadas válidas
const ApiaryData = {
  name: 'Test Apiary',
  image: '',
  hives: 10,
  status: 'Bueno',
  honey: 0,
  levudex: 0,
  sugar: 0,
  box: 0,
  boxMedium: 0,
  boxSmall: 0,
  tOxalic: 0,
  tAmitraz: 0,
  tFlumetrine: 0,
  tFence: 0,
  transhumance: 0,
  settings: {},
  tComment: '',
  latitude: -37.11108,   // Coordenada válida (Pinamar/Madariaga)
  longitude: -56.86523   // Coordenada válida
};

console.log('\n📋 Datos del apiario:');
console.log('  Nombre:', ApiaryData.name);
console.log('  Latitude:', ApiaryData.latitude);
console.log('  Longitude:', ApiaryData.longitude);
console.log('  Tipo de latitude:', typeof ApiaryData.latitude);
console.log('  Tipo de longitude:', typeof ApiaryData.longitude);

console.log('\n🔍 Verificando condiciones para enviar coordenadas:');
console.log('  latitude !== undefined:', ApiaryData.latitude !== undefined);
console.log('  latitude !== null:', ApiaryData.latitude !== null);
console.log('  latitude !== 0:', ApiaryData.latitude !== 0);
console.log('  longitude !== undefined:', ApiaryData.longitude !== undefined);
console.log('  longitude !== null:', ApiaryData.longitude !== null);
console.log('  longitude !== 0:', ApiaryData.longitude !== 0);

// Simular la lógica exacta de createApiary
const formDataFields = [];

// Campos básicos (siempre se envían)
formDataFields.push('name', 'hives', 'status', 'honey', 'levudex', 'sugar');
formDataFields.push('box', 'boxMedium', 'boxSmall', 'tOxalic', 'tAmitraz');
formDataFields.push('tFlumetrine', 'tFence', 'tComment', 'transhumance', 'settings');

console.log('\n📦 Procesando coordenadas (igual que en createApiary):\n');

// Verificar latitude
if (ApiaryData.latitude !== undefined && ApiaryData.latitude !== null && ApiaryData.latitude !== 0) {
  formDataFields.push('latitude');
  console.log('  ✅ LATITUDE se agregará al FormData');
  console.log('     Valor:', ApiaryData.latitude);
  console.log('     Como string:', String(ApiaryData.latitude));
} else {
  console.log('  ❌ LATITUDE NO se agregará al FormData');
  console.log('     Razón:', {
    isUndefined: ApiaryData.latitude === undefined,
    isNull: ApiaryData.latitude === null,
    isZero: ApiaryData.latitude === 0
  });
}

// Verificar longitude
if (ApiaryData.longitude !== undefined && ApiaryData.longitude !== null && ApiaryData.longitude !== 0) {
  formDataFields.push('longitude');
  console.log('  ✅ LONGITUDE se agregará al FormData');
  console.log('     Valor:', ApiaryData.longitude);
  console.log('     Como string:', String(ApiaryData.longitude));
} else {
  console.log('  ❌ LONGITUDE NO se agregará al FormData');
  console.log('     Razón:', {
    isUndefined: ApiaryData.longitude === undefined,
    isNull: ApiaryData.longitude === null,
    isZero: ApiaryData.longitude === 0
  });
}

console.log('\n📋 Campos que se enviarían en el FormData:');
console.log('  Total de campos:', formDataFields.length);
console.log('  Campos:', formDataFields.join(', '));

console.log('\n' + '='.repeat(60));
console.log('✅ RESULTADO:');
if (formDataFields.includes('latitude') && formDataFields.includes('longitude')) {
  console.log('  ✅ Las coordenadas SE ENVIARÁN correctamente');
  console.log('  ✅ Latitude:', ApiaryData.latitude);
  console.log('  ✅ Longitude:', ApiaryData.longitude);
} else {
  console.log('  ❌ Las coordenadas NO se enviarán');
  if (!formDataFields.includes('latitude')) {
    console.log('  ❌ Falta latitude');
  }
  if (!formDataFields.includes('longitude')) {
    console.log('  ❌ Falta longitude');
  }
}

console.log('\n💡 Para probar en la app real:');
console.log('  1. Abre la consola de desarrollo');
console.log('  2. Crea un apiario y selecciona ubicación en el mapa');
console.log('  3. Busca los logs que empiezan con [createApiary]');
console.log('  4. Deberías ver: ✅ Enviando latitude: y ✅ Enviando longitude:');


























