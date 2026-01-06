# ApiTool - Aplicación Móvil de Gestión Apícola

## Descripción General
ApiTool es una aplicación móvil para la gestión integral de apiarios y colmenas. Permite a los apicultores llevar un control completo de sus operaciones, desde el registro de apiarios hasta el seguimiento de tratamientos, alimentación, cosecha y análisis estadístico.

---

## 1. AUTENTICACIÓN Y PERFIL

### 1.1 Login
- **Ubicación**: Pantalla de inicio cuando el usuario no está autenticado
- **Funcionalidad**: 
  - Inicio de sesión con email y contraseña
  - Redirección automática a la pantalla principal tras login exitoso

### 1.2 Perfil de Usuario
- **Acceso**: Desde la pantalla principal → Configuración
- **Funcionalidades**:
  - Visualización de información personal (nombre, apellido, email)
  - Resumen general de estadísticas (total de apiarios, colmenas, apiarios en cosecha)
  - Resumen de alimentación total (miel, azúcar, levudex en kg)
  - Acceso a gestión de dispositivos

### 1.3 Gestión de Dispositivos
- **Acceso**: Perfil → Gestionar Dispositivos
- **Funcionalidades**:
  - Lista de todos los dispositivos registrados asociados a la cuenta
  - Información de cada dispositivo: nombre, plataforma (iOS/Android), última actividad
  - Eliminación de dispositivos (excepto si solo hay uno)
  - Registro automático de dispositivos al usar la app

---

## 2. PANTALLA PRINCIPAL (HOME)

### 2.1 Dashboard Principal
- **Funcionalidades principales**:
  - Saludo personalizado según la hora del día
  - Información del usuario logueado
  - Campana de notificaciones (acceso rápido a notificaciones)
  - Estadísticas rápidas: total de apiarios y colmenas
  - Información del clima actual (temperatura y precipitaciones) basada en ubicación GPS

### 2.2 Accesos Directos
La pantalla principal incluye botones de acceso rápido a todas las secciones:

1. **Mis Apiarios**: Lista completa de apiarios
2. **Mapa**: Vista geográfica de apiarios en mapa interactivo
3. **ApiScanner**: Escáner de códigos de barras para tambores
4. **Estadísticas**: Análisis y reportes estadísticos
5. **Configuración**: Perfil y ajustes de la aplicación
6. **Asistente IA**: Chat con inteligencia artificial especializada en apicultura

---

## 3. GESTIÓN DE APIARIOS

### 3.1 Lista de Apiarios
- **Acceso**: Home → Mis Apiarios
- **Funcionalidades**:
  - Visualización de todos los apiarios en formato de tarjetas
  - Búsqueda por nombre de apiario
  - Ordenamiento automático por fecha de actualización (más recientes primero)
  - Pull-to-refresh para actualizar la lista
  - Botón flotante para agregar nuevo apiario (+)
  - Botón de cosecha global (ícono de rosa) que permite activar/desactivar el modo cosecha para todos los apiarios
  - Eliminación de apiarios: mantener presionado (long press) sobre una tarjeta para eliminar
  - Navegación al detalle del apiario al tocar una tarjeta

### 3.2 Detalle de Apiario
- **Acceso**: Lista de Apiarios → Tocar un apiario
- **Información mostrada**:
  - Imagen del apiario
  - Nombre del apiario
  - Botones de acceso rápido: Historial y Configuración
  - Información detallada organizada por categorías:
    - **Colonia**: Cantidad de colmenas
    - **Estado**: Estado actual del apiario
    - **Alimentación**: Miel (kg), Levudex (kg), Azúcar (kg)
    - **Tratamientos**: 
      - Oxálico (días desde último tratamiento)
      - Amitraz (días desde último tratamiento)
      - Flumetrina (días desde último tratamiento)
    - **Otros**: 
      - Transhumancia (cantidad de colmenas)
      - Cercado eléctrico (días desde última revisión)
    - **Alzas**: Alzas completas, medianas y pequeñas
  - Comentarios del apiario (si existen)

### 3.3 Agregar Nuevo Apiario
- **Acceso**: Lista de Apiarios → Botón "+"
- **Proceso**:
  1. **Pantalla de datos básicos**:
     - Nombre del apiario
     - Cantidad de colmenas
     - Estado inicial
     - Imagen del apiario (opcional, desde galería o cámara)
     - Ubicación geográfica (latitud/longitud) - opcional
  2. **Pantalla de configuración inicial**:
     - Configuración de alimentación (miel, levudex, azúcar)
     - Configuración de tratamientos (oxálico, amitraz, flumetrina)
     - Configuración de alzas (completas, medianas, pequeñas)
     - Configuración de otras opciones (transhumancia, cercado eléctrico)
     - Comentarios iniciales
  3. Guardado y creación del apiario

### 3.4 Configuración de Apiario
- **Acceso**: Detalle de Apiario → Botón de configuración (ícono de engranaje)
- **Funcionalidades**:
  - Edición de todos los parámetros del apiario
  - Configuración de visibilidad de campos (qué información mostrar/ocultar)
  - Gestión de tareas (lista de tareas pendientes y completadas)
  - Modo cosecha: activar/desactivar para el apiario específico
  - Cosecha automática: configuración de cosecha automática
  - Guardado de cambios

### 3.5 Visita a Apiario
- **Acceso**: Detalle de Apiario → Botón "Visitar"
- **Funcionalidades**:
  - Registro de visitas al apiario
  - Actualización de datos durante la visita
  - Registro de cambios y modificaciones
  - Actualización de tratamientos, alimentación, etc.

### 3.6 Historial de Apiario
- **Acceso**: Detalle de Apiario → Botón de historial (ícono de archivo)
- **Funcionalidades**:
  - Visualización cronológica de todos los cambios realizados en el apiario
  - Timeline visual con fechas y horas
  - Detalle de cada cambio: campo modificado, valor anterior y nuevo valor
  - Formato legible de variables técnicas (ej: "tOxalic" se muestra como "Oxálico")
  - Ordenamiento por fecha (más recientes primero)

### 3.7 Mapa de Apiarios
- **Acceso**: Home → Mapa
- **Funcionalidades**:
  - Vista de mapa interactivo con Google Maps
  - Marcadores amarillos con ícono de colmena para cada apiario
  - Ubicación automática del usuario (GPS)
  - Los apiarios se muestran en el mapa con sus ubicaciones
  - Al tocar un marcador:
    - El marcador se resalta con borde amarillo
    - Aparece una tarjeta flotante en la parte inferior con:
      - Nombre del apiario
      - Cantidad de colmenas
      - Estado (si está activo)
      - Botón "Ver Apiario" para navegar al detalle
      - Botón de cerrar (X) para ocultar la tarjeta
  - Zoom y navegación estándar del mapa
  - Vista de calles y rutas del mapa

---

## 4. APISCANNER (ESCÁNER DE TAMBORES)

### 4.1 Instrucciones
- **Acceso**: Home → ApiScanner
- **Funcionalidad**: Pantalla informativa con consejos para usar el escáner:
  - Distancia óptima para escanear (15-30 cm)
  - Requisitos de iluminación
  - Verificación de códigos de barras
  - Información sobre códigos duplicados
  - Botón "Empezar a Escanear" para continuar

### 4.2 Lista de Tambores Escaneados
- **Acceso**: Instrucciones → Empezar a Escanear
- **Funcionalidades**:
  - Lista de todos los tambores escaneados
  - Filtros: "Todos" (todos los tambores) y "Vendidos" (solo tambores marcados como vendidos)
  - Información por tambor:
    - Código de barras (formato: XX-XXXXXXXX-X)
    - Tara (kg)
    - Peso total (kg)
    - Peso neto calculado automáticamente (peso total - tara)
  - Indicador visual de códigos duplicados (borde amarillo y badge de alerta)
  - Eliminación de tambor: mantener presionado (long press) sobre un tambor
  - Botón flotante amarillo con cámara para escanear nuevo tambor
  - Menú de opciones (botón de tres puntos):
    - Exportar datos: Excel o Texto plano
    - Eliminar todos los tambores (solo no vendidos)
  - Resumen al final de la lista:
    - Total de tambores
    - Peso neto total calculado
  - Pull-to-refresh para actualizar

### 4.3 Escáner de Código de Barras
- **Acceso**: Lista de Tambores → Botón de cámara
- **Funcionalidades**:
  - Activación de cámara del dispositivo
  - Solicitud de permisos de cámara si es necesario
  - Marco visual de escaneo con animación
  - Escaneo automático de códigos de barras (UPC-A, UPC-E, EAN8, EAN13, Code128, Code39, Code93)
  - Formateo automático del código escaneado al formato estándar (XX-XXXXXXXX-X)
  - Validación del formato del código
  - Navegación automática al formulario tras escaneo exitoso
  - Opción de reescanear si el código es inválido

### 4.4 Formulario de Datos del Tambor
- **Acceso**: Automático tras escanear código válido
- **Funcionalidades**:
  - Código escaneado mostrado (no editable)
  - Campo de Tara (kg): con valor sugerido del último tambor escaneado
  - Campo de Peso Total (kg)
  - Cálculo automático y visualización del Peso Neto (peso total - tara)
  - Validaciones:
    - Ambos campos requeridos
    - Valores numéricos mayores a 0
    - Peso total debe ser mayor que la tara
  - Botón "Guardar Tambor" que:
    - Guarda el tambor
    - Guarda la tara para uso futuro
    - Navega de vuelta a la lista
  - Indicador de carga durante el guardado

---

## 5. ESTADÍSTICAS

### 5.1 Pantalla de Estadísticas
- **Acceso**: Home → Estadísticas
- **Secciones**:

#### 5.1.1 Estadísticas Generales
- Total de apiarios
- Total de colmenas
- Estado general más común

#### 5.1.2 Alimentación Total
- Total de miel (kg)
- Total de azúcar (kg)
- Total de levudex (kg)

#### 5.1.3 Cosecha
- Alzas totales (cálculo: alzas completas + alzas medianas × 0.75 + alzas pequeñas × 0.5)
- Alzas completas
- Cantidad de apiarios en modo cosecha

---

## 6. ASISTENTE DE INTELIGENCIA ARTIFICIAL

### 6.1 Chat con IA
- **Acceso**: Home → Botón "Chatea aquí" en la tarjeta promocional de IA
- **Funcionalidades**:
  - Interfaz de chat estilo mensajería
  - Mensajes del usuario a la derecha (fondo negro)
  - Respuestas de la IA a la izquierda (fondo blanco)
  - Avatares diferenciados (usuario e IA)
  - Timestamps en cada mensaje
  - Indicador de "Escribiendo..." cuando la IA está procesando
  - El historial de mensajes se guarda automáticamente
  - Continuidad de conversación: mantiene el contexto entre mensajes
  - Botón de limpiar chat (eliminar historial)
  - Botón de volver atrás
  - Campo de texto multilínea para escribir mensajes
  - Botón de envío (solo activo cuando hay texto)
  - Mensajes de error claros si algo sale mal

### 6.2 Especialización
- La IA está especializada en temas de apicultura
- Puede responder preguntas sobre:
  - Gestión de colmenas
  - Tratamientos apícolas
  - Alimentación de abejas
  - Cosecha de miel
  - Problemas comunes en apiarios
  - Mejores prácticas apícolas

---

## 7. NOTIFICACIONES

### 7.1 Pantalla de Notificaciones
- **Acceso**: Home → Campana de notificaciones (esquina superior derecha)
- **Funcionalidades**:
  - Lista de notificaciones recibidas
  - Información por notificación: mensaje y fecha/hora
  - Navegación automática desde notificaciones push a secciones relevantes
  - Estado: actualmente en desarrollo (muestra mensaje informativo)

---

## 8. CARACTERÍSTICAS Y PERMISOS

### 8.1 Diseño
- Interfaz moderna y limpia
- Colores principales: amarillo, negro, blanco
- Navegación intuitiva
- La interfaz se adapta a diferentes tamaños de dispositivos

### 8.2 Permisos Requeridos
- **Cámara**: Para escanear códigos de barras y tomar fotos de apiarios
- **Ubicación**: Para mostrar el clima y ubicar apiarios en el mapa
- **Almacenamiento**: Para guardar imágenes y datos
- **Notificaciones**: Para recibir alertas y notificaciones

---

## 9. FLUJOS DE USO PRINCIPALES

### 9.1 Flujo de Registro de Apiario
1. Home → Mis Apiarios
2. Tocar botón "+"
3. Completar datos básicos (nombre, colmenas, estado, imagen, ubicación)
4. Configurar parámetros iniciales (alimentación, tratamientos, alzas)
5. Guardar → Apiario creado y visible en la lista

### 9.2 Flujo de Escaneo de Tambor
1. Home → ApiScanner
2. Leer instrucciones → Empezar a Escanear
3. Tocar botón de cámara flotante
4. Escanear código de barras del tambor
5. Completar formulario (tara y peso total)
6. Guardar → Tambor agregado a la lista

### 9.3 Flujo de Consulta de Estadísticas
1. Home → Estadísticas
2. Visualizar resumen general
3. Revisar alimentación total
4. Consultar datos de cosecha

### 9.4 Flujo de Uso del Mapa
1. Home → Mapa
2. Visualizar apiarios en el mapa
3. Tocar marcador de apiario
4. Ver información en tarjeta flotante
5. Tocar "Ver Apiario" para ir al detalle completo

### 9.5 Flujo de Consulta con IA
1. Home → Botón "Chatea aquí" (tarjeta de IA)
2. Escribir pregunta sobre apicultura
3. Enviar mensaje
4. Recibir respuesta de la IA
5. Continuar conversación o limpiar chat

---

## 10. DATOS Y ENTIDADES PRINCIPALES

### 10.1 Apiario
- Nombre
- Imagen
- Cantidad de colmenas
- Estado (activo, inactivo, etc.)
- Ubicación geográfica (latitud, longitud)
- Alimentación: miel, levudex, azúcar (en kg)
- Tratamientos: oxálico, amitraz, flumetrina (días desde último tratamiento)
- Alzas: completas, medianas, pequeñas
- Otros: transhumancia, cercado eléctrico
- Comentarios
- Configuración: modo cosecha, visibilidad de campos, tareas

### 10.2 Tambor
- Código de barras (formato: XX-XXXXXXXX-X)
- Tara (kg)
- Peso total (kg)
- Peso neto (calculado: peso total - tara)
- Estado de venta (vendido/no vendido)
- Fechas de creación y actualización

### 10.3 Usuario
- Nombre y apellido
- Email
- Dispositivos asociados

---

## 12. CARACTERÍSTICAS ADICIONALES

### 12.1 Modo Cosecha
- Activación global desde la lista de apiarios
- Activación individual por apiario
- Modo automático configurable
- Afecta el cálculo de estadísticas

### 12.2 Búsqueda y Filtrado
- Búsqueda de apiarios por nombre
- Filtrado de tambores (todos/vendidos)
- Ordenamiento automático por fecha

### 12.3 Exportación de Datos
- Exportación de tambores a Excel
- Exportación de tambores a texto plano
- Compartir archivos generados

### 12.4 Gestión de Tareas
- Lista de tareas por apiario
- Tareas completadas/pendientes
- Almacenamiento en configuración del apiario

---

## 13. ESTADOS Y CONFIGURACIONES

### 13.1 Estados de Apiario
- Activo
- Inactivo
- Advertencia
- Otros estados personalizables

### 13.2 Configuraciones de Visibilidad
- Control de qué campos mostrar en el detalle del apiario
- Configuración por categoría (alimentación, tratamientos, otros)

### 13.3 Datos Guardados
- Historial de chat con IA
- Datos de usuario
- Preferencias de la app

---

Este documento describe todas las funcionalidades principales de la aplicación ApiTool. La app está diseñada para ser una herramienta completa de gestión apícola, facilitando el registro, seguimiento y análisis de todos los aspectos relacionados con la apicultura.

