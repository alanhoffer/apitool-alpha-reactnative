/**
 * Script para crear un apiario de prueba con coordenadas.
 *
 * Uso:
 *   node create-apiary-test.js --email user@example.com --password ********
 *
 * Variables soportadas:
 *   APIARY_TEST_EMAIL
 *   APIARY_TEST_PASSWORD
 *   APIARY_TEST_BASE_URL
 *   APIARY_TEST_NAME
 */

const axios = require('axios');
const FormData = require('form-data');

const DEFAULT_BASE_URL = 'https://api.xn--cabaahoffer-4db.com.ar/';

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function printUsage() {
  console.log('Uso:');
  console.log('  node create-apiary-test.js --email user@example.com --password ********');
  console.log('');
  console.log('Variables soportadas:');
  console.log('  APIARY_TEST_EMAIL');
  console.log('  APIARY_TEST_PASSWORD');
  console.log('  APIARY_TEST_BASE_URL');
  console.log('  APIARY_TEST_NAME');
}

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

function maskSecret(secret, visiblePrefix = 6, visibleSuffix = 4) {
  if (!secret) {
    return '(oculto)';
  }
  if (secret.length <= visiblePrefix + visibleSuffix) {
    return '*'.repeat(secret.length);
  }
  return `${secret.slice(0, visiblePrefix)}...${secret.slice(-visibleSuffix)}`;
}

async function createApiaryWithCoordinates(config) {
  const baseUrl = ensureTrailingSlash(config.baseUrl);

  try {
    console.log('Iniciando sesion...');

    const loginResponse = await axios.post(`${baseUrl}auth/login`, {
      email: config.email,
      password: config.password,
    });

    const token =
      loginResponse.data.access_token ||
      loginResponse.data.token ||
      loginResponse.data.accessToken;

    if (!token) {
      const responseKeys = Object.keys(loginResponse.data || {});
      console.error('No se recibio token de autenticacion.');
      console.error(
        'Claves recibidas en la respuesta:',
        responseKeys.length ? responseKeys.join(', ') : '(sin cuerpo JSON)'
      );
      return 1;
    }

    console.log('Login exitoso.');
    console.log(`Token recibido: ${maskSecret(token)}`);

    const data = new FormData();
    data.append('name', config.apiaryName);
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

    const latitude = -37.11108;
    const longitude = -56.86523;

    console.log('Datos del apiario:');
    console.log(`  Nombre: ${config.apiaryName}`);
    console.log(`  Latitude: ${latitude}`);
    console.log(`  Longitude: ${longitude}`);

    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));

    console.log('Enviando peticion para crear apiario...');

    const createResponse = await axios.post(`${baseUrl}apiarys`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...data.getHeaders(),
      },
    });

    console.log('Apiario creado exitosamente.');
    const apiaryId = createResponse.data.id;
    console.log(`ID del apiario: ${apiaryId}`);
    console.log(JSON.stringify(createResponse.data, null, 2));

    if (createResponse.data.latitude && createResponse.data.longitude) {
      console.log('Las coordenadas se guardaron correctamente.');
      console.log(`  Latitude: ${createResponse.data.latitude}`);
      console.log(`  Longitude: ${createResponse.data.longitude}`);
      return 0;
    }

    console.log('Las coordenadas no aparecen en la respuesta de creacion.');
    console.log('Consultando el apiario para verificar si se guardaron...');

    try {
      const getResponse = await axios.get(`${baseUrl}apiarys/${apiaryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (getResponse.data.latitude && getResponse.data.longitude) {
        console.log('Las coordenadas si se guardaron.');
        console.log(`  Latitude: ${getResponse.data.latitude}`);
        console.log(`  Longitude: ${getResponse.data.longitude}`);
        return 0;
      }

      console.log('Las coordenadas no se guardaron en el backend.');
      return 1;
    } catch (getError) {
      console.log(`No se pudo consultar el apiario: ${getError.message}`);
      return 1;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No se recibio respuesta del servidor.');
    }
    return 1;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return 0;
  }

  const email = args.email || process.env.APIARY_TEST_EMAIL;
  const password = args.password || process.env.APIARY_TEST_PASSWORD;

  if (!email || !password) {
    console.error('Faltan credenciales. Usa argumentos o variables de entorno.');
    printUsage();
    return 1;
  }

  return createApiaryWithCoordinates({
    email,
    password,
    baseUrl: args['base-url'] || process.env.APIARY_TEST_BASE_URL || DEFAULT_BASE_URL,
    apiaryName: args.name || process.env.APIARY_TEST_NAME || 'Test Apiary',
  });
}

main()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error(`Error no controlado: ${error.message}`);
    process.exit(1);
  });
