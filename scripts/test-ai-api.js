/**
 * Script para probar la API de Robertaso (Serenity Star).
 * Ejecutar desde la raíz del proyecto: node scripts/test-ai-api.js
 *
 * Prueba:
 * 1. POST execute con mensaje (primera solicitud)
 * 2. POST execute con chatId + mensaje (continuar conversación)
 * 3. POST execute con body [] (según doc)
 * 4. POST conversation/info (metadatos)
 */

const BASE = 'https://api.serenitystar.ai/api/v2/agent/robertaso';
const API_KEY = '84b7e0de-9d49-4395-ba0e-337a4b805c07';

const headers = {
  'Content-Type': 'application/json',
  'X-API-KEY': API_KEY,
};

async function run() {
  console.log('--- 1. Primera solicitud (solo message) ---');
  const res1 = await fetch(`${BASE}/execute`, {
    method: 'POST',
    headers,
    body: JSON.stringify([{ key: 'message', value: 'Hola, ¿qué tal?' }]),
  });
  const data1 = await res1.json();
  console.log('Status:', res1.status);
  console.log('Headers instance-id:', res1.headers.get('x-instance-id') || res1.headers.get('instance-id'));
  console.log('Body:', JSON.stringify(data1, null, 2));

  let instanceId = null;
  if (Array.isArray(data1)) {
    const idItem = data1.find((x) => x.key === 'instanceId' || x.key === 'chatId' || x.key === 'id');
    if (idItem) instanceId = idItem.value;
  } else if (data1.instanceId) instanceId = data1.instanceId;
  else if (data1.chatId) instanceId = data1.chatId;
  if (!instanceId && res1.headers.get('x-instance-id')) instanceId = res1.headers.get('x-instance-id');

  console.log('\nInstanceId obtenido:', instanceId || '(no encontrado)');

  if (instanceId) {
    console.log('\n--- 2. Continuar conversación (chatId + message) ---');
    const res2 = await fetch(`${BASE}/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        { key: 'chatId', value: instanceId },
        { key: 'message', value: 'Cuéntame un dato breve sobre abejas.' },
      ]),
    });
    const data2 = await res2.json();
    console.log('Status:', res2.status);
    console.log('Body:', JSON.stringify(data2, null, 2));
  }

  console.log('\n--- 3. Execute con body [] ---');
  const res3 = await fetch(`${BASE}/execute`, {
    method: 'POST',
    headers,
    body: JSON.stringify([]),
  });
  console.log('Status:', res3.status);
  const data3 = await res3.json().catch(() => ({}));
  console.log('Body:', JSON.stringify(data3, null, 2));

  console.log('\n--- 4. Conversation info ---');
  const res4 = await fetch(`${BASE}/conversation/info`, {
    method: 'POST',
    headers: { 'X-API-KEY': API_KEY },
    body: '',
  });
  console.log('Status:', res4.status);
  const data4 = await res4.json().catch(() => ({}));
  console.log('Body:', JSON.stringify(data4, null, 2));

  console.log('\nListo.');
}

run().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
