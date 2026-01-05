# Documentación de Cambios en la API - ApiTool

## 1. Actualización de `createApiary` y `updateApiary`

**Endpoint:** `POST /apiarys` y `PUT /apiarys/:id`

### Cambios Requeridos en Backend:
El backend debe aceptar y procesar dos nuevos campos numéricos opcionales:
- `latitude` (Float/Double)
- `longitude` (Float/Double)

Si el backend usa un ORM (como TypeORM o Sequelize), actualizar el modelo `Apiary` para incluir:
```typescript
@Column({ type: 'float', nullable: true })
latitude: number;

@Column({ type: 'float', nullable: true })
longitude: number;
```

## 2. Actualización de `ApiarySettings`

**Endpoint:** `PUT /apiarys/settings/:id`

### Cambios Requeridos en Backend:
El backend debe permitir guardar un campo de texto largo (JSON string) llamado `tasks` en la tabla/entidad `ApiarySettings`.

Si el backend usa un ORM:
```typescript
@Column({ type: 'text', nullable: true }) // O 'longtext' si se espera mucho contenido
tasks: string;
```

Este campo almacenará un array de objetos JSON con la estructura:
```json
[
  {
    "id": "1715628392",
    "text": "Llevar alzas",
    "completed": false
  },
  ...
]
```

## 3. Consideraciones de Seguridad
Asegurarse de sanear el input del campo `tasks` si se renderiza en algún panel web administrativo para evitar XSS, aunque en la app móvil se maneja como texto plano.

















