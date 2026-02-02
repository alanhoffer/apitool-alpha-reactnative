# Prueba de Envío de Coordenadas al Crear Apiario

## Script de Prueba

He creado un script de prueba (`test-create-apiary.js`) que simula el proceso de creación de un apiario con coordenadas.

## Cómo usar el script

1. **Ejecutar el script de prueba:**
   ```bash
   node test-create-apiary.js
   ```

2. **El script verificará:**
   - Que las coordenadas no sean `undefined`, `null` o `0`
   - Que se agreguen correctamente al FormData
   - Que los valores sean correctos

## Prueba Real en la App

Para probar en la app real:

1. **Abre la consola de desarrollo** (Metro bundler o React Native Debugger)

2. **Crea un nuevo apiario:**
   - Ve a la lista de apiarios
   - Presiona el botón "+"
   - Completa el nombre
   - **Presiona "Seleccionar Ubicación"**
   - Selecciona una ubicación en el mapa
   - Presiona "OK"
   - Completa el resto del formulario
   - Presiona "Finalizar"

3. **Revisa los logs en la consola:**
   - `[ApiaryAddScreen] Ubicación seleccionada:` - Debe mostrar las coordenadas
   - `[ApiaryAddScreen] Estado actualizado con coordenadas:` - Debe confirmar que se guardaron
   - `[ApiaryAddScreen] Enviando apiaryData:` - Debe mostrar las coordenadas antes de enviar
   - `[createApiary] Recibido ApiaryData:` - Debe mostrar las coordenadas recibidas
   - `[createApiary] ✅ Enviando latitude:` - Debe confirmar que se envía
   - `[createApiary] ✅ Enviando longitude:` - Debe confirmar que se envía

## Valores de Prueba

Coordenadas de ejemplo (Pinamar/Madariaga):
- **Latitude:** -37.11108
- **Longitude:** -56.86523

## Posibles Problemas

Si ves `❌ NO se envía latitude porque:`, verifica:
- Que el valor no sea `0`
- Que el valor no sea `undefined`
- Que el valor no sea `null`

## Verificación en el Backend

Después de crear el apiario, verifica en el backend que:
- El campo `latitude` tiene el valor correcto
- El campo `longitude` tiene el valor correcto
- Los valores no son `0`, `null` o `undefined`



























