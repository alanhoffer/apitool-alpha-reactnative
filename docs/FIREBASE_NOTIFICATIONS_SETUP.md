# Configuración de Firebase para Push Notifications

## Problema Actual

El código está intentando usar Firebase Cloud Messaging (FCM) pero no está correctamente configurado. Hay dos opciones:

1. **Usar Expo Push Notifications** (Recomendado para empezar - ya está corregido)
2. **Configurar Firebase completamente** (Para usar FCM directamente)

## Opción 1: Expo Push Notifications (Ya Configurado)

El código ahora usa **Expo Push Notifications** que funciona automáticamente. Solo necesitas:

1. ✅ Tener el `projectId` en `app.json` (ya está: `08a09d84-4abe-477b-ba0f-6efb2172acf4`)
2. ✅ Tener `expo-notifications` instalado (ya está)
3. ✅ Hacer un build nativo (no funciona en Expo Go)

### Cómo funciona:

- En **builds nativos**, Expo automáticamente usa FCM para Android y APNs para iOS
- El token que obtienes puede ser un token nativo (FCM/APNs) o un token de Expo
- El backend puede usar el token directamente o convertirlo según necesite

### Para probar:

1. Hacer un build nativo:
   ```bash
   eas build --profile preview --platform android
   # o
   eas build --profile preview --platform ios
   ```

2. Instalar la app en un dispositivo físico
3. Verificar que el token se registre en el backend

---

## Opción 2: Configurar Firebase Completamente

Si quieres usar FCM directamente (sin pasar por Expo), necesitas:

### Para Android:

1. **Configurar `google-services.json` en `app.json`:**

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/adaptive-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

2. **Verificar que `google-services.json` esté en la raíz del proyecto** ✅ (ya está)

3. **Hacer un nuevo build** después de agregar la configuración

### Para iOS:

1. **Descargar `GoogleService-Info.plist` desde Firebase Console:**
   - Ve a Firebase Console → Project Settings → iOS App
   - Descarga el archivo `GoogleService-Info.plist`

2. **Colocar el archivo en la raíz del proyecto**

3. **Configurar en `app.json`:**

```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

4. **Hacer un nuevo build**

### Verificar Configuración de Firebase:

1. **Firebase Console:**
   - Ve a https://console.firebase.google.com/
   - Selecciona el proyecto `apitool-f47c7`
   - Verifica que las apps Android e iOS estén registradas

2. **Android App:**
   - Package name: `com.hoffer.apitool` ✅
   - Verifica que `google-services.json` coincida

3. **iOS App:**
   - Bundle ID: (debe coincidir con el de tu app iOS)
   - Verifica que `GoogleService-Info.plist` esté descargado

---

## Solución de Problemas

### Error: "Project ID no encontrado"

**Solución:** Verifica que `app.json` tenga:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "08a09d84-4abe-477b-ba0f-6efb2172acf4"
      }
    }
  }
}
```

### Error: "Push notifications solo funcionan en dispositivos físicos"

**Solución:** Esto es normal. Las notificaciones push no funcionan en emuladores/simuladores. Usa un dispositivo físico.

### Error: "No se pudo obtener el token"

**Posibles causas:**
1. No hay permisos de notificaciones → Verificar permisos en configuración del dispositivo
2. No es un build nativo → Hacer build con EAS
3. Firebase no está configurado → Seguir pasos de configuración de Firebase

### Token se obtiene pero las notificaciones no llegan

**Verificar:**
1. El backend está enviando notificaciones correctamente
2. El token está registrado en el backend
3. El formato del token es correcto (Expo tokens empiezan con `ExponentPushToken[...]`, FCM tokens son diferentes)
4. El backend está usando el servicio correcto para enviar notificaciones

---

## Envío de Notificaciones desde el Backend

### Con Expo Push Notifications:

```javascript
// El backend puede usar la API de Expo
const response = await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'ExponentPushToken[xxxxx]',
    sound: 'default',
    title: 'Notificación',
    body: 'Mensaje de la notificación',
    data: { apiaryId: 123 },
  }),
});
```

### Con FCM directamente:

```javascript
// El backend usa Firebase Admin SDK
const admin = require('firebase-admin');
admin.messaging().send({
  token: 'fcm-token-here',
  notification: {
    title: 'Notificación',
    body: 'Mensaje de la notificación',
  },
  data: {
    apiaryId: '123',
  },
});
```

---

## Recomendación

**Para producción, usa Expo Push Notifications** porque:
- ✅ Funciona automáticamente con builds nativos
- ✅ No requiere configuración adicional de Firebase en el código
- ✅ Expo maneja la conversión a FCM/APNs automáticamente
- ✅ Más simple de mantener

**Solo usa FCM directamente si:**
- Necesitas características específicas de FCM
- Ya tienes una infraestructura de Firebase establecida
- Necesitas más control sobre el envío de notificaciones

---

## Estado Actual

✅ **Código corregido** para usar Expo Push Notifications correctamente
✅ **Project ID configurado** en `app.json`
✅ **google-services.json** presente (para Android)
⚠️ **Falta** `GoogleService-Info.plist` (para iOS, solo si quieres usar FCM directamente)
⚠️ **Falta** configuración explícita de Firebase en `app.json` (opcional, Expo lo maneja automáticamente)

## Próximos Pasos

1. Hacer un build nativo y probar en dispositivo físico
2. Verificar que el token se registre correctamente
3. Probar envío de notificaciones desde el backend
4. Si todo funciona, no necesitas configurar Firebase manualmente

