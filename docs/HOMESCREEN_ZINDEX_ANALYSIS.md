# Análisis de zIndex en HomeScreen

## Estructura de elementos y zIndex

### 1. **Wrapper (View principal)**
- **zIndex**: No definido (por defecto: 0)
- **backgroundColor**: `white`
- **Ubicación**: Línea 260-262

### 2. **FlyingBees (Componente de abejas)**
- **zIndex**: `1`
- **position**: `absolute` (cubre toda la pantalla)
- **opacity**: `0.4`
- **pointerEvents**: `none` (no interfiere con toques)
- **Ubicación**: Línea 139

### 3. **ScrollView (container)**
- **zIndex**: `2`
- **backgroundColor**: `transparent` ✅
- **paddingHorizontal**: 40
- **paddingTop**: 40
- **Ubicación**: Línea 140-150, estilos línea 264-270

### 4. **Elementos dentro del ScrollView** (todos con zIndex heredado: 2)

#### 4.1. **userContainer**
- **backgroundColor**: `white` ❌ (bloquea abejas)
- **borderRadius**: 10
- **marginBottom**: 15
- **Ubicación**: Línea 152-159, estilos línea 271-275

#### 4.2. **statsContainer**
- **backgroundColor**: `#F9F9F9` ❌ (bloquea abejas)
- **borderRadius**: 10
- **marginVertical**: 20
- **Ubicación**: Línea 161-198, estilos línea 281-289

#### 4.3. **quickAccessButton** (múltiples botones)
- **backgroundColor**: `#F9F9F9` ❌ (bloquea abejas)
- **width**: `45%`
- **height**: 120
- **borderRadius**: 10
- **Ubicación**: Línea 201-228, estilos línea 348-356

#### 4.4. **aiPromoButton**
- **backgroundColor**: `colors.WHITE` ❌ (bloquea abejas)
- **elevation**: `3` ⚠️ (Android - puede afectar zIndex)
- **borderWidth**: 1
- **borderColor**: `colors.GREY_LIGHT`
- **shadowColor/Offset/Opacity/Radius**: Definidos (iOS)
- **Ubicación**: Línea 230-252, estilos línea 367-381

## Problema identificado

**Las abejas no se ven porque:**
1. Todos los elementos dentro del ScrollView tienen **fondos opacos** (blanco o gris)
2. Aunque las abejas tienen `zIndex: 1` y el ScrollView `zIndex: 2`, los elementos con fondo opaco dentro del ScrollView **bloquean visualmente** las abejas
3. El `elevation: 3` en `aiPromoButton` puede crear capas adicionales en Android

## Soluciones posibles

### Opción 1: Hacer fondos semi-transparentes
- Cambiar `backgroundColor: 'white'` a `backgroundColor: 'rgba(255, 255, 255, 0.9)'` o similar
- Cambiar `backgroundColor: '#F9F9F9'` a `backgroundColor: 'rgba(249, 249, 249, 0.9)'`

### Opción 2: Aumentar zIndex de las abejas
- Cambiar `zIndex: 1` a `zIndex: 10` en FlyingBees
- Asegurar que el ScrollView tenga `zIndex: 5` o menor

### Opción 3: Cambiar estructura (recomendado)
- Mantener abejas con `zIndex: 1`
- ScrollView con `zIndex: 2` y fondo transparente ✅ (ya está)
- Elementos con fondos opacos pero asegurar que las abejas estén en áreas sin contenido

### Opción 4: Usar overlay con blend mode
- Crear un overlay semi-transparente que permita ver las abejas a través de los elementos

## Recomendación

**Combinar Opción 2 y 3:**
1. Aumentar `zIndex` de FlyingBees a `10`
2. Mantener ScrollView con `zIndex: 2` y fondo transparente
3. Aumentar opacidad de las abejas a `0.5-0.6` para mejor visibilidad
4. Asegurar que las abejas se muevan en áreas visibles (parte superior de la pantalla)

