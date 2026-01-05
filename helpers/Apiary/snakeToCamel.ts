/**
 * Convierte una cadena de snake_case a camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convierte una cadena de PascalCase a camelCase
 * Maneja casos especiales como "TOxalic" -> "tOxalic", "TAmitraz" -> "tAmitraz"
 */
function pascalToCamel(str: string): string {
  if (!str) return str;
  
  // Casos especiales: si empieza con "T" mayúscula seguida de otra mayúscula (ej: "TOxalic", "TAmitraz", "TFlumetrine", "TFence", "TComment")
  // Convertir a "tOxalic", "tAmitraz", etc.
  if (str.length > 1 && str[0] === 'T' && str[1] === str[1].toUpperCase() && str[1] !== str[1].toLowerCase()) {
    return 't' + str.slice(1);
  }
  
  // Si las primeras dos letras son mayúsculas (ej: "TOxalic"), solo convertir la primera
  if (str.length > 1 && str[0] === str[0].toUpperCase() && str[1] === str[1].toUpperCase()) {
    return str[0].toLowerCase() + str.slice(1);
  }
  
  // Caso normal: "Name" -> "name", "UpdatedAt" -> "updatedAt", "Hives" -> "hives"
  return str[0].toLowerCase() + str.slice(1);
}

/**
 * Convierte un objeto de snake_case o PascalCase a camelCase recursivamente
 */
export function transformSnakeToCamel<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformSnakeToCamel(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        let camelKey: string;
        let processedKey = key;
        
        // Remover prefijo de guión bajo si existe (ej: "_id" -> "id", "_name" -> "name")
        if (key.startsWith('_')) {
          processedKey = key.substring(1);
        }
        
        // Detectar si es snake_case o PascalCase
        if (processedKey.includes('_') && !processedKey.startsWith('_')) {
          camelKey = snakeToCamel(processedKey);
        } else if (processedKey[0] === processedKey[0].toUpperCase() && processedKey !== processedKey.toUpperCase()) {
          // Es PascalCase (ej: "Name", "UpdatedAt", "TOxalic")
          camelKey = pascalToCamel(processedKey);
        } else {
          camelKey = processedKey; // Ya está en el formato correcto
        }
        
        let value = obj[key];
        
        // Convertir strings numéricos a números si es necesario
        if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
          // Campos numéricos conocidos
          const numericFields = ['honey', 'levudex', 'sugar', 'box', 'boxMedium', 'boxSmall', 
                                 'tOxalic', 'tAmitraz', 'tFlumetrine', 'tFence', 'transhumance',
                                 'hives', 'id', 'userId', 'apiaryId', 'apiaryUserId'];
          if (numericFields.includes(camelKey)) {
            value = Number(value);
          }
        }
        
        transformed[camelKey] = transformSnakeToCamel(value);
      }
    }
    
    return transformed as T;
  }

  return obj as T;
}

