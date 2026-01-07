/**
 * Script para crear un apiario de prueba con coordenadas
 * Usa las credenciales: admin@admin.com / 15441109
 */

const axios = require('axios');

const BASE_URL = 'https://api.xn--cabaahoffer-4db.com.ar/';

async function createApiaryWithCoordinates() {
  try {
    console.log('🔐 Iniciando sesión...\n');
    
    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}auth/login`, {
      email: 'admin@admin.com',
      password: '15441109'
    });

    const token = loginResponse.data.access_token || loginResponse.data.token || loginResponse.data.accessToken;
    
    if (!token) {
      console.error('❌ No se recibió token de autenticación');
      console.log('Respuesta completa:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }

    console.log('✅ Login exitoso');
    console.log('Token recibido:', token.substring(0, 20) + '...\n');

    // 2. Crear FormData para el apiario
    const FormData = require('form-data');
    const data = new FormData();

    // Datos del apiario
    data.append('name', 'Test Apiary');
    data.append('hives', '10');
    data.append('status', 'Bueno');
    data.append('honey', '0');
    data.append('levudex', '0');
    data.append('sugar', '0');
    data.append('box', '0');
    data.append('boxMedium', '0');
    data.append('boxSmall', '0');
    data.append('tOxalic', '0');
    data.append('tAmitraz', '0');
    data.append('tFlumetrine', '0');
    data.append('tFence', '0');
    data.append('tComment', '');
    data.append('transhumance', '0');
    data.append('settings', JSON.stringify({}));
    data.append('image', '');

    // Coordenadas (Pinamar/Madariaga)
    const latitude = -37.11108;
    const longitude = -56.86523;

    console.log('📋 Datos del apiario:');
    console.log('  Nombre: Test Apiary');
    console.log('  Latitude:', latitude);
    console.log('  Longitude:', longitude);
    console.log('');

    // Agregar coordenadas al FormData
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));

    console.log('✅ Coordenadas agregadas al FormData:');
    console.log('  latitude:', latitude);
    console.log('  longitude:', longitude);
    console.log('');

    // 3. Crear el apiario
    console.log('📤 Enviando petición para crear apiario...\n');

    const createResponse = await axios.post(`${BASE_URL}apiarys`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...data.getHeaders()
      }
    });

    console.log('✅ Apiario creado exitosamente!');
    const apiaryId = createResponse.data.id;
    console.log('ID del apiario:', apiaryId);
    console.log('Respuesta del servidor:');
    console.log(JSON.stringify(createResponse.data, null, 2));
    
    if (createResponse.data.latitude && createResponse.data.longitude) {
      console.log('\n✅ Las coordenadas se guardaron correctamente:');
      console.log('  Latitude:', createResponse.data.latitude);
      console.log('  Longitude:', createResponse.data.longitude);
    } else {
      console.log('\n⚠️  Las coordenadas no aparecen en la respuesta de creación');
      console.log('  Consultando el apiario para verificar si se guardaron...\n');
      
      // Consultar el apiario recién creado
      try {
        const getResponse = await axios.get(`${BASE_URL}apiarys/${apiaryId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📥 Respuesta al consultar el apiario:');
        if (getResponse.data.latitude && getResponse.data.longitude) {
          console.log('✅ Las coordenadas SÍ se guardaron:');
          console.log('  Latitude:', getResponse.data.latitude);
          console.log('  Longitude:', getResponse.data.longitude);
        } else {
          console.log('❌ Las coordenadas NO se guardaron en el backend');
          console.log('  El backend no está procesando los campos latitude y longitude');
        }
      } catch (getError) {
        console.log('⚠️  No se pudo consultar el apiario:', getError.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.request) {
      console.error('No se recibió respuesta del servidor');
    }
  }
}

// Ejecutar
createApiaryWithCoordinates();

