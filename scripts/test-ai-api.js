/**
 * Script para probar la API de Robertaso (Serenity Star).
 *
 * Uso:
 *   node scripts/test-ai-api.js --api-key ********
 *
 * Variables soportadas:
 *   SERENITYSTAR_API_KEY
 *   SERENITYSTAR_AGENT_BASE
 */

const DEFAULT_BASE = 'https://api.serenitystar.ai/api/v2/agent/robertaso';

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
  console.log('  node scripts/test-ai-api.js --api-key ********');
  console.log('');
  console.log('Variables soportadas:');
  console.log('  SERENITYSTAR_API_KEY');
  console.log('  SERENITYSTAR_AGENT_BASE');
}

async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
}

async function run(config) {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': config.apiKey,
  };

  console.log('--- 1. Primera solicitud (solo message) ---');
  const res1 = await fetch(`${config.base}/execute`, {
    method: 'POST',
    headers,
    body: JSON.stringify([{ key: 'message', value: 'Hola, que tal?' }]),
  });
  const data1 = await readJson(res1);
  console.log(`Status: ${res1.status}`);
  console.log(
    'Headers instance-id:',
    res1.headers.get('x-instance-id') || res1.headers.get('instance-id')
  );
  console.log('Body:', JSON.stringify(data1, null, 2));

  let instanceId = null;
  if (Array.isArray(data1)) {
    const idItem = data1.find((item) =>
      ['instanceId', 'chatId', 'id'].includes(item.key)
    );
    if (idItem) {
      instanceId = idItem.value;
    }
  } else if (data1.instanceId) {
    instanceId = data1.instanceId;
  } else if (data1.chatId) {
    instanceId = data1.chatId;
  }

  if (!instanceId && res1.headers.get('x-instance-id')) {
    instanceId = res1.headers.get('x-instance-id');
  }

  console.log(`\nInstanceId obtenido: ${instanceId || '(no encontrado)'}`);

  if (instanceId) {
    console.log('\n--- 2. Continuar conversacion (chatId + message) ---');
    const res2 = await fetch(`${config.base}/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        { key: 'chatId', value: instanceId },
        { key: 'message', value: 'Cuentame un dato breve sobre abejas.' },
      ]),
    });
    const data2 = await readJson(res2);
    console.log(`Status: ${res2.status}`);
    console.log('Body:', JSON.stringify(data2, null, 2));
  }

  console.log('\n--- 3. Execute con body [] ---');
  const res3 = await fetch(`${config.base}/execute`, {
    method: 'POST',
    headers,
    body: JSON.stringify([]),
  });
  const data3 = await readJson(res3);
  console.log(`Status: ${res3.status}`);
  console.log('Body:', JSON.stringify(data3, null, 2));

  console.log('\n--- 4. Conversation info ---');
  const res4 = await fetch(`${config.base}/conversation/info`, {
    method: 'POST',
    headers: { 'X-API-KEY': config.apiKey },
    body: '',
  });
  const data4 = await readJson(res4);
  console.log(`Status: ${res4.status}`);
  console.log('Body:', JSON.stringify(data4, null, 2));

  console.log('\nListo.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return 0;
  }

  const apiKey = args['api-key'] || process.env.SERENITYSTAR_API_KEY;
  if (!apiKey) {
    console.error('Falta la API key. Usa --api-key o SERENITYSTAR_API_KEY.');
    printUsage();
    return 1;
  }

  const base = args.base || process.env.SERENITYSTAR_AGENT_BASE || DEFAULT_BASE;
  await run({ apiKey, base });
  return 0;
}

main()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
