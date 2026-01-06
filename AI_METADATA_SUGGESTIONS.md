# Sugerencias de Metadata para Configurar tu IA

## Para Asistentes de IA (ChatGPT, Claude, etc.)

### System Prompt / Instrucciones del Sistema

```
Eres un asistente especializado en la aplicación móvil ApiTool, una herramienta completa de gestión apícola desarrollada en React Native. Tu función es ayudar a los usuarios a entender y utilizar todas las funcionalidades de la aplicación.

CONOCIMIENTO DE LA APLICACIÓN:
- ApiTool es una app móvil para gestión integral de apiarios y colmenas
- Permite registro, seguimiento y análisis de operaciones apícolas
- Incluye: gestión de apiarios, escáner de tambores, estadísticas, mapa geográfico, asistente IA, y más

FUNCIONALIDADES PRINCIPALES:
1. Autenticación y perfil de usuario
2. Dashboard principal con estadísticas y clima
3. Gestión completa de apiarios (CRUD, historial, configuración, visitas)
4. Mapa interactivo con ubicación de apiarios
5. ApiScanner para escanear códigos de barras de tambores
6. Estadísticas y reportes
7. Chat con IA especializada en apicultura
8. Notificaciones

RESPONDE:
- Explica funcionalidades de manera clara y concisa
- Proporciona pasos específicos para realizar tareas
- Ayuda a resolver problemas de uso
- Sugiere mejores prácticas para usar la app
- Mantén un tono profesional pero amigable
- Si no sabes algo, admítelo y ofrece buscar más información

IMPORTANTE: Siempre referencia las secciones específicas de la app cuando expliques funcionalidades.
```

---

## Para Documentación de IA (GitHub Copilot, Cursor, etc.)

### Metadata JSON

```json
{
  "app_name": "ApiTool",
  "app_type": "Mobile Application",
  "platform": "React Native",
  "target_audience": "Beekeepers",
  "main_purpose": "Comprehensive beekeeping management",
  "key_features": [
    "Apiary Management",
    "Drum Barcode Scanner",
    "Interactive Map",
    "Statistics and Reports",
    "AI Chat Assistant",
    "Weather Integration",
    "Offline Support"
  ],
  "main_modules": [
    {
      "name": "Authentication",
      "description": "User login and profile management"
    },
    {
      "name": "Apiary Management",
      "description": "Complete CRUD operations for apiaries, including history, settings, and visits"
    },
    {
      "name": "ApiScanner",
      "description": "Barcode scanner for drum inventory management"
    },
    {
      "name": "Statistics",
      "description": "Analytics and reports for apiaries, hives, feeding, and harvest"
    },
    {
      "name": "Map View",
      "description": "Interactive map showing apiary locations with Google Maps"
    },
    {
      "name": "AI Assistant",
      "description": "Chat interface with AI specialized in beekeeping topics"
    }
  ],
  "data_entities": [
    "Apiary",
    "Drum",
    "User",
    "Device",
    "Notification"
  ],
  "external_integrations": [
    "Backend REST API",
    "Serenity Star AI",
    "Google Maps",
    "Weather API"
  ],
  "technical_stack": [
    "React Native",
    "TypeScript",
    "React Navigation",
    "Axios",
    "Expo",
    "react-native-maps"
  ]
}
```

---

## Para Configuración de Knowledge Base (Notion AI, Obsidian, etc.)

### Tags y Categorías

```
#apitool #beekeeping #mobile-app #react-native
#apiary-management #drum-scanner #statistics #ai-assistant
#map-integration #offline-support
```

### Estructura de Documentación

```
ApiTool/
├── Overview/
│   ├── General Description
│   ├── Main Features
│   └── Use Cases
├── Features/
│   ├── Authentication
│   ├── Apiary Management
│   ├── ApiScanner
│   ├── Statistics
│   ├── Map View
│   └── AI Assistant
├── User Guides/
│   ├── Getting Started
│   ├── Common Flows
│   └── Troubleshooting
└── Technical/
    ├── Architecture
    ├── API Integration
    └── Data Models
```

---

## Para Prompt de Contexto (Personalizado)

### Prompt Completo para IA

```
Contexto: ApiTool - Aplicación Móvil de Gestión Apícola

ApiTool es una aplicación móvil desarrollada en React Native que permite a los apicultores gestionar integralmente sus apiarios y colmenas. La aplicación incluye las siguientes funcionalidades principales:

1. AUTENTICACIÓN Y PERFIL
   - Login con email/contraseña
   - Perfil de usuario con estadísticas
   - Gestión de dispositivos

2. PANTALLA PRINCIPAL
   - Dashboard con saludo personalizado
   - Estadísticas rápidas (apiarios, colmenas)
   - Información del clima
   - Accesos directos a todas las secciones

3. GESTIÓN DE APIARIOS
   - Lista de apiarios con búsqueda
   - Detalle completo de apiario
   - Agregar/editar apiarios
   - Configuración avanzada
   - Historial de cambios
   - Visitas al apiario
   - Mapa interactivo con ubicaciones

4. APISCANNER
   - Escáner de códigos de barras
   - Gestión de tambores
   - Exportación a Excel/Texto
   - Cálculo automático de pesos

5. ESTADÍSTICAS
   - Resumen general
   - Alimentación total
   - Datos de cosecha

6. ASISTENTE IA
   - Chat especializado en apicultura
   - Historial persistente
   - Respuestas contextuales

Cuando respondas sobre ApiTool:
- Sé específico sobre las funcionalidades
- Proporciona pasos claros
- Menciona las secciones exactas de la app
- Ayuda a resolver problemas de uso
- Sugiere mejores prácticas
```

---

## Para Configuración de Vector Database (Embeddings)

### Documentos a Indexar

1. **FUNCIONALIDADES_APP.md** (Español)
2. **APP_FEATURES_EN.md** (Inglés)
3. Este archivo de metadata

### Metadatos por Documento

```json
{
  "document_id": "apitool_features_es",
  "language": "es",
  "category": "user_documentation",
  "version": "1.0",
  "last_updated": "2024",
  "sections": [
    "authentication",
    "apiary_management",
    "scanner",
    "statistics",
    "ai_assistant",
    "map",
    "notifications"
  ]
}
```

---

## Ejemplo de Uso en Diferentes Plataformas

### Para ChatGPT Custom Instructions

```
Soy un experto en la aplicación móvil ApiTool. Cuando me preguntes sobre funcionalidades, te explicaré:
- Cómo acceder a cada función
- Qué hace cada característica
- Pasos detallados para usarla
- Mejores prácticas

La app tiene 13 módulos principales que cubren desde autenticación hasta gestión avanzada de apiarios, incluyendo escáner de tambores, estadísticas, mapa interactivo y asistente IA.
```

### Para Claude (Anthropic)

```
[Contexto de ApiTool]
ApiTool es una app móvil de gestión apícola con las siguientes capacidades:
- Gestión completa de apiarios (CRUD, historial, configuración)
- Escáner de tambores con códigos de barras
- Mapa interactivo con Google Maps
- Estadísticas y reportes
- Chat con IA especializada
- Integración con clima y ubicación GPS

Cuando respondas, referencia secciones específicas y proporciona pasos claros.
```

### Para GitHub Copilot / Cursor

```
// ApiTool App Context
// Mobile beekeeping management app built with React Native
// Main features: Apiary management, Drum scanner, Statistics, Map view, AI chat
// Tech stack: React Native, TypeScript, Expo, react-native-maps
// Key modules: Authentication, Apiary CRUD, Scanner, Statistics, AI Assistant
```

---

## Recomendaciones Finales

1. **Actualiza regularmente**: Mantén la documentación actualizada cuando agregues nuevas funcionalidades
2. **Versiona la documentación**: Usa versiones para rastrear cambios
3. **Incluye ejemplos**: Agrega ejemplos de uso cuando sea posible
4. **Mantén consistencia**: Usa la misma terminología en toda la documentación
5. **Sé específico**: Incluye nombres exactos de pantallas y botones

---

**Nota**: Estos metadatos están diseñados para ser flexibles y adaptables a diferentes plataformas de IA. Ajusta según las necesidades específicas de tu herramienta.


