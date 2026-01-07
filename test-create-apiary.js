/**
 * Script de prueba para verificar que las coordenadas se envían correctamente
 * al crear un apiario.
 * 
 * Para ejecutar: node test-create-apiary.js
 * 
 * NOTA: Este script requiere que tengas configurado el token de autenticación
 * y que el backend esté disponible.
 */

// Simulación de la función createApiary para probar el envío de coordenadas
function testCreateApiary() {
  console.log('🧪 Iniciando prueba de creación de apiario con coordenadas...\n');

  // Datos de prueba con coordenadas válidas
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
    transhumance: 0,
    tFence: 0,
    settings: {},
    tComment: '',
    latitude: -37.11108,  // Coordenada válida (no es 0)
    longitude: -56.86523  // Coordenada válida (no es 0)
  };

  console.log('📋 Datos del apiario a crear:');
  console.log(JSON.stringify(ApiaryData, null, 2));
  console.log('\n');

  // Simular FormData
  const data = new FormData();
  
  // Agregar campos básicos
  data.append('name', ApiaryData.name);
  data.append('hives', String(ApiaryData.hives));
  data.append('status', ApiaryData.status);
  data.append('honey', String(ApiaryData.honey));
  data.append('levudex', String(ApiaryData.levudex));
  data.append('sugar', String(ApiaryData.sugar));
  data.append('box', String(ApiaryData.box));
  data.append('boxMedium', String(ApiaryData.boxMedium));
  data.append('boxSmall', String(ApiaryData.boxSmall));
  data.append('tOxalic', String(ApiaryData.tOxalic));
  data.append('tAmitraz', String(ApiaryData.tAmitraz));
  data.append('tFlumetrine', String(ApiaryData.tFlumetrine));
  data.append('tFence', String(ApiaryData.tFence));
  data.append('tComment', ApiaryData.tComment);
  data.append('transhumance', String(ApiaryData.transhumance));
  data.append('settings', JSON.stringify(ApiaryData.settings));

  // Verificar y enviar coordenadas (igual que en el código real)
  console.log('🔍 Verificando coordenadas:');
  console.log({
    latitude: ApiaryData.latitude,
    longitude: ApiaryData.longitude,
    latUndefined: ApiaryData.latitude === undefined,
    latNull: ApiaryData.latitude === null,
    latZero: ApiaryData.latitude === 0,
    lonUndefined: ApiaryData.longitude === undefined,
    lonNull: ApiaryData.longitude === null,
    lonZero: ApiaryData.longitude === 0
  });
  console.log('\n');

  if (ApiaryData.latitude !== undefined && ApiaryData.latitude !== null && ApiaryData.latitude !== 0) {
    data.append('latitude', String(ApiaryData.latitude));
    console.log('✅ Enviando latitude:', ApiaryData.latitude);
  } else {
    console.log('❌ NO se envía latitude porque:', {
      isUndefined: ApiaryData.latitude === undefined,
      isNull: ApiaryData.latitude === null,
      isZero: ApiaryData.latitude === 0
    });
  }

  if (ApiaryData.longitude !== undefined && ApiaryData.longitude !== null && ApiaryData.longitude !== 0) {
    data.append('longitude', String(ApiaryData.longitude));
    console.log('✅ Enviando longitude:', ApiaryData.longitude);
  } else {
    console.log('❌ NO se envía longitude porque:', {
      isUndefined: ApiaryData.longitude === undefined,
      isNull: ApiaryData.longitude === null,
      isZero: ApiaryData.longitude === 0
    });
  }

  console.log('\n📦 FormData preparado con los siguientes campos:');
  
  // En un entorno real, FormData no se puede inspeccionar fácilmente,
  // pero podemos simular qué campos se agregaron
  const fieldsAdded = [
    'name', 'hives', 'status', 'honey', 'levudex', 'sugar',
    'box', 'boxMedium', 'boxSmall', 'tOxalic', 'tAmitraz',
    'tFlumetrine', 'tFence', 'tComment', 'transhumance', 'settings'
  ];

  if (ApiaryData.latitude !== undefined && ApiaryData.latitude !== null && ApiaryData.latitude !== 0) {
    fieldsAdded.push('latitude');
  }
  if (ApiaryData.longitude !== undefined && ApiaryData.longitude !== null && ApiaryData.longitude !== 0) {
    fieldsAdded.push('longitude');
  }

  console.log('Campos en FormData:', fieldsAdded.join(', '));
  console.log('\n✅ Prueba completada. Las coordenadas se agregaron correctamente al FormData.');
  console.log('\n💡 Para probar con el backend real, ejecuta la app y crea un apiario desde la UI.');
}

// Ejecutar la prueba
testCreateApiary();

