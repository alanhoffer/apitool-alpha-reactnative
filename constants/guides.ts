export type GuideItem = {
    id: string;
    title: string;
    description: string;
    category: string;
    readTime: string;
    icon: string;
    color: string;
    markdown: string;
    featured?: boolean;
};

export const APICULTURE_GUIDES: GuideItem[] = [
    {
        id: 'spring-inspection',
        title: 'Inspeccion de primavera',
        description: 'Revision inicial para confirmar postura, reservas y fuerza de la colonia al comienzo de la temporada.',
        category: 'Estacional',
        readTime: '4 min',
        icon: 'flower-outline',
        color: '#4CAF50',
        featured: true,
        markdown: `# Inspeccion de primavera

## Objetivo
Verificar que la colonia salio bien del invierno, confirmar la presencia de postura, evaluar reservas y anticipar necesidades de espacio o manejo sanitario.

## Cuando hacerla
- En un dia templado, seco y con poco viento.
- Preferiblemente con buena actividad de vuelo.
- Evita abrir la colmena si hace frio o si la colonia esta debil.

## Que revisar
- **Poblacion**: cantidad de abejas y fuerza general de la colonia.
- **Reina o postura**: huevos, larvas y patron de cria compacto.
- **Reservas**: miel y polen disponibles.
- **Sanidad**: signos de varroa, cria irregular, humedad o malos olores.
- **Espacio**: si la colonia necesita mas cuadros o alza.

## Paso a paso
1. Observa la piquera antes de abrir.
   - Revisa actividad de vuelo, ingreso de polen y comportamiento general.
2. Abre con suavidad y usa humo moderado.
   - Evita enfriar la cria o alterar demasiado a la colonia.
3. Evalua los cuadros centrales primero.
   - Busca huevos, larvas y cria operculada.
4. Revisa los cuadros laterales.
   - Confirma reservas de miel y polen.
5. Verifica el estado del material.
   - Detecta cuadros viejos, rotos o con exceso de humedad.
6. Toma nota de lo observado.
   - Fuerza, postura, reservas, sanidad y acciones necesarias.

## Senales de buena condicion
- Postura reciente y uniforme.
- Cria compacta, sin demasiados huecos.
- Entrada constante de polen.
- Reservas suficientes para varios dias.
- Abejas activas y calmadas.

## Acciones recomendadas
- **Si faltan reservas**: aportar alimentacion de apoyo.
- **Si falta espacio**: agregar cuadros o alza segun desarrollo.
- **Si hay cuadros muy viejos**: planificar renovacion gradual.
- **Si sospechas enfermedad o plaga**: aislar observacion y seguir un plan sanitario.

## Errores comunes
- Abrir demasiado temprano con clima frio.
- Revisar por mucho tiempo y enfriar la cria.
- Usar humo en exceso.
- Buscar a la reina innecesariamente en cada inspeccion.
- No registrar hallazgos y olvidar el seguimiento.`,
    },
    {
        id: 'swarm-prevention',
        title: 'Prevencion de enjambrazon',
        description: 'Medidas simples para bajar el impulso de enjambrazon y sostener colonias productivas en expansion.',
        category: 'Manejo',
        readTime: '5 min',
        icon: 'git-branch-outline',
        color: '#FF9800',
        markdown: `# Prevencion de enjambrazon

## Objetivo
Reducir el riesgo de que la colonia enjamble durante la temporada de crecimiento, manteniendo espacio, ventilacion y equilibrio interno.

## Por que ocurre
La enjambrazon suele aparecer cuando la colonia esta muy poblada, tiene poco espacio, abundan los recursos y la reina queda limitada para poner.

## Senales de alerta
- Mucha congestion de abejas dentro de la colmena.
- Presencia de celdas reales, especialmente en bordes o parte baja de los cuadros.
- Poco espacio libre para postura.
- Entrada intensa de nectar y polen con rapido crecimiento poblacional.
- Formacion de barbas de abejas en la piquera en dias templados.

## Medidas practicas
- **Dar espacio a tiempo**
  - Agrega cuadros o alzas antes de que la colmena se sature.
- **Mejorar ventilacion**
  - Facilita circulacion de aire si hay calor y alta densidad de abejas.
- **Renovar cuadros viejos**
  - Favorece una postura mas continua y ordenada.
- **Equilibrar colonias**
  - Si una colonia esta demasiado fuerte, puede aliviarse con cria o abejas para reforzar otra.
- **Vigilar celdas reales**
  - Inspecciona con frecuencia en el periodo de mayor crecimiento.

## Paso a paso de control
1. Revisa la colmena semanalmente en temporada critica.
2. Comprueba si la reina tiene espacio para seguir poniendo.
3. Agrega alzas antes de la saturacion, no despues.
4. Observa y registra aparicion de celdas reales.
5. Si la presion de enjambrazon es alta, aplica una medida de alivio de poblacion segun tu manejo.

## Buenas decisiones de manejo
- Anticiparse funciona mejor que corregir tarde.
- Colonias muy fuertes necesitan revisiones mas frecuentes.
- El exceso de miel almacenada en la camara de cria puede bloquear la postura.
- Una colonia equilibrada suele ser mas productiva y mas estable.

## Errores comunes
- Esperar a ver celdas reales para recien dar espacio.
- Agregar alzas demasiado tarde.
- Confundir calor o sobrepoblacion con un problema menor.
- Eliminar celdas reales sin corregir la causa de fondo.
- Hacer inspecciones irregulares en plena temporada de crecimiento.`,
    },
    {
        id: 'varroa-monitoring',
        title: 'Control y monitoreo de varroa',
        description: 'Guia breve para detectar, medir y reducir la carga de varroa con revisiones y registros oportunos.',
        category: 'Sanidad',
        readTime: '5 min',
        icon: 'bug-outline',
        color: '#C96A3D',
        markdown: `# Control y monitoreo de varroa

## Objetivo
Detectar a tiempo la presencia de **Varroa destructor**, estimar su nivel de infestacion y actuar antes de que afecte la salud de la colonia.

## Que observar en cada revision
- Cria salteada o irregular.
- Abejas con alas deformadas o abdomen pequeno.
- Menor poblacion adulta sin causa evidente.
- Bajo rendimiento y debilitamiento general.
- Presencia de acaros sobre abejas o en bandejas sanitarias.

## Como monitorear
### 1. Revision visual rapida
- Observa piquera, cuadros de cria y abejas nodrizas.
- Busca signos de debilitamiento o deformaciones.
- Registra fecha, colmena y hallazgos.

### 2. Conteo con bandeja sanitaria
- Coloca la bandeja limpia bajo piso sanitario.
- Dejela entre 24 y 72 horas.
- Cuenta acaros caidos y compara entre colmenas.
- Repite siempre con el mismo tiempo de exposicion para poder comparar.

### 3. Muestreo de abejas adultas
- Toma una muestra del sector de cria.
- Usa un metodo estandarizado en todas las colmenas del lote.
- Registra el porcentaje o nivel detectado.
- Si una colmena destaca por encima del resto, prioriza su manejo.

## Frecuencia recomendada
- En temporada activa: cada 3 a 4 semanas.
- Antes y despues de cosecha: control obligatorio.
- Al final de temporada: evaluacion clave para invernada.
- Despues de un tratamiento: verificacion de eficacia.

## Medidas de control practico
- Mantiene registros por colmena.
- Renueva reinas si la colonia muestra bajo vigor sostenido.
- Evita colmenas muy debiles, porque favorecen reinfestacion y pillaje.
- Coordina tratamientos en todo el apiario para reducir rebote.
- Alterna herramientas autorizadas segun plan sanitario local para evitar fallas de control.

## Senales de alerta para actuar rapido
- Aumento claro de caida natural de acaros.
- Varias colmenas con cria despareja.
- Aparicion de abejas deformes.
- Descenso brusco de poblacion antes de epoca fria.

## Registro minimo util
- Fecha.
- Numero de colmena.
- Metodo de monitoreo.
- Resultado.
- Accion tomada.
- Revision de seguimiento.

## Errores comunes
- Revisar solo cuando la colmena ya esta debil.
- No registrar datos y decidir a ojo.
- Monitorear una vez y asumir que el problema esta resuelto.
- Tratar solo algunas colmenas del apiario.
- No comprobar si el tratamiento realmente funciono.`,
    },
    {
        id: 'biosecurity-signs',
        title: 'Signos tempranos de enfermedades y bioseguridad',
        description: 'Pistas tempranas de problemas sanitarios y rutina basica para no contagiar el resto del apiario.',
        category: 'Sanidad',
        readTime: '6 min',
        icon: 'shield-checkmark-outline',
        color: '#2F8F6B',
        markdown: `# Signos tempranos de enfermedades y bioseguridad del apiario

## Objetivo
Identificar cambios tempranos en la colonia y reducir el riesgo de contagio dentro del apiario.

## Signos tempranos que no deben pasar desapercibidos
### En abejas adultas
- Abejas temblorosas o desorientadas.
- Dificultad para volar.
- Mortalidad inusual frente a la piquera.
- Abdomen hinchado o aspecto debil.

### En la cria
- Cria salteada o con operculos hundidos.
- Larvas con color, olor o textura anormal.
- Restos pegados al fondo de celdas.
- Pupas mal formadas o cria interrumpida.

### En el comportamiento de la colonia
- Menor actividad de pecoreo.
- Irritabilidad fuera de lo habitual.
- Disminucion rapida de poblacion.
- Pillaje o defensa debil.

## Que hacer ante una sospecha
- Marca la colmena y revisala al final de la ronda.
- Evita intercambiar cuadros, alzas o material con otras colmenas.
- Registra signos observados con fecha.
- Aisla herramientas usadas hasta limpiarlas.
- Si el cuadro clinico progresa, consulta apoyo tecnico local.

## Bioseguridad basica del apiario
### Manejo de herramientas y ropa
- Limpia palanca, guantes y cepillo entre colmenas sospechosas.
- Prioriza materiales faciles de lavar y desinfectar.
- Mantiene ropa de trabajo limpia y seca.

### Orden de revision
- Revisa primero colmenas fuertes y sanas.
- Deja para el final las debiles o sospechosas.
- Evita volver a colmenas sanas despues de revisar una enferma sin higiene previa.

### Movimiento de material biologico
- No traslades cuadros de colmenas con signos dudosos.
- No unifiques colonias sin revisar su estado sanitario.
- Evita alimentar de forma que provoque pillaje.

### Higiene del apiario
- Mantiene el lugar seco, ventilado y ordenado.
- Retira material abandonado o muy deteriorado.
- Reduce acceso a residuos de miel o cera expuesta.

## Senales que exigen mayor atencion
- Olor anormal en la cria.
- Muchas larvas muertas o decoloradas.
- Colmenas que caen de poblacion en pocos dias.
- Repeticion del mismo signo en varias colmenas.

## Rutina breve de prevencion
- Observar piquera antes de abrir.
- Revisar cria, reservas y poblacion.
- Anotar cualquier cambio pequeno.
- Limpiar herramientas al terminar.
- Programar recontrol de colmenas sospechosas.

## Errores comunes
- Compartir cuadros entre colmenas sin evaluacion sanitaria.
- Revisar colmenas enfermas y luego seguir con sanas sin limpieza.
- Ignorar cambios leves porque todavia producen.
- Dejar restos de cera, miel o material contaminado en el apiario.
- Esperar demasiado antes de pedir apoyo tecnico.`,
    },
    {
        id: 'strategic-feeding',
        title: 'Alimentacion estrategica en epocas de escasez',
        description: 'Como sostener la colonia cuando faltan nectar y polen sin provocar saqueo ni errores de manejo.',
        category: 'Nutricion',
        readTime: '4 min',
        icon: 'nutrition-outline',
        color: '#D97706',
        markdown: `# Alimentacion estrategica en epocas de escasez

## Objetivo
Mantener colonias fuertes y estables cuando la floracion baja, evitando perdida de poblacion, saqueo y debilitamiento de la reina.

## Cuando conviene alimentar
Usa alimentacion estrategica cuando observes una o varias de estas senales:
- Poca entrada de nectar o polen durante varios dias.
- Marcos livianos y reservas reducidas.
- Menor postura de la reina por falta de alimento.
- Abejas mas inquietas o con tendencia al saqueo.
- Sequia, lluvias prolongadas o transicion entre floraciones.

## Que revisar antes de alimentar
- Cantidad real de miel y polen almacenados.
- Fuerza de la colonia y numero de cuadros cubiertos con abejas.
- Presencia de reina activa y postura reciente.
- Estado sanitario general.
- Disponibilidad natural en el entorno.

## Tipos de alimentacion util
### Jarabe energetico
Sirve para aportar energia cuando faltan nectar y reservas.

Uso practico:
- Administralo en pequenas cantidades si buscas sostener la colonia sin provocar saqueo.
- Ofrecelo al atardecer para reducir pillaje.
- Usa alimentadores limpios y bien cerrados.

### Suplemento proteico
Puede ayudar cuando falta polen o la cria comienza a disminuir.

Uso practico:
- Colocalo solo si realmente hay deficit de polen.
- Revisa consumo y retira restos viejos o humedos.
- No reemplaza una buena oferta floral, solo acompana.

## Como hacerlo de forma segura
- Alimenta solo a colonias que realmente lo necesiten.
- Evita derrames cerca de las colmenas.
- Reduce piqueras si hay riesgo de saqueo.
- Mantiene uniformidad de manejo dentro del apiario.
- Revisa cada pocos dias y ajusta segun consumo y clima.

## Senales de que la estrategia funciona
- La colonia se mantiene tranquila.
- La reina conserva una postura regular.
- No hay caida brusca de poblacion.
- Mejora el peso de los cuadros de reserva.
- Disminuye la conducta de busqueda desesperada.

## Recomendaciones rapidas
- Prioriza colonias productivas, nucleos y colonias jovenes.
- No sobrealimentes si se acerca una floracion importante.
- Registra fecha, tipo de alimento y respuesta de cada colmena.
- Suspende o reduce cuando vuelva el ingreso natural de recursos.

## Errores comunes
- Alimentar sin revisar reservas reales.
- Dar grandes volumenes y desencadenar saqueo.
- Usar alimentadores sucios o con fugas.
- Mantener alimento viejo dentro de la colmena.
- Confundir falta de comida con problemas de reina o sanidad.`,
    },
    {
        id: 'winter-prep',
        title: 'Preparacion del apiario para invierno o epoca fria',
        description: 'Pasos esenciales para llegar al frio con fuerza, reservas suficientes y menos humedad en la colmena.',
        category: 'Estacional',
        readTime: '5 min',
        icon: 'snow-outline',
        color: '#2563EB',
        markdown: `# Preparacion del apiario para invierno o epoca fria

## Objetivo
Ayudar a las colonias a pasar la epoca fria con buena poblacion, reservas suficientes y menor estres por humedad, viento y falta de alimento.

## Cuando empezar
La preparacion debe hacerse antes de que lleguen los frios intensos.

Idealmente, comienza cuando aun hay clima manejable para:
- Evaluar fuerza de cada colonia.
- Corregir problemas sanitarios.
- Ordenar reservas.
- Mejorar la proteccion del apiario.

## Revision basica de cada colmena
- Presencia de reina y patron de postura aceptable.
- Cantidad de abejas adultas suficientes para formar un buen racimo.
- Reservas de miel y polen.
- Estado de pisos, techos y tapas.
- Humedad interna, grietas o entradas de aire excesivas.

## Acciones clave de preparacion
### 1. Unificar colonias debiles si es necesario
Colonias muy pequenas suelen pasar peor el frio.

- Evalua si conviene reforzar o unir.
- Evita invernar colonias inviables que consumiran recursos sin recuperarse.

### 2. Asegurar reservas
La colonia necesita alimento suficiente para sostenerse cuando no puede pecorear.

- Deja cuadros con miel bien distribuidos.
- Confirma reservas cercanas al area donde se agruparan las abejas.
- Complementa solo si hace falta y con tiempo.

### 3. Reducir espacio innecesario
Un volumen excesivo dificulta conservar calor.

- Retira alzas o cuadros vacios que no se usen.
- Ajusta el tamano interno a la fuerza real de la colonia.

### 4. Mejorar proteccion del apiario
- Revisa techos para evitar filtraciones.
- Mantiene las colmenas niveladas y elevadas del suelo.
- Protege del viento dominante con barreras naturales o artificiales.
- Asegura buena ventilacion sin corrientes fuertes directas.

### 5. Controlar humedad
La humedad interna puede ser mas danina que el frio moderado.

- Evita condensacion dentro de la colmena.
- Mantiene tapas y cubiertas en buen estado.
- No cierres en exceso si eso retiene vapor.

## Manejo durante la epoca fria
- Abre solo cuando sea realmente necesario.
- Aprovecha dias templados para revisiones breves.
- Observa movimiento en piquera y peso general de la colmena.
- Retira obstaculos en la entrada si aparecen.
- Mantiene agua disponible en el apiario si el entorno lo permite.

## Senales de buena preparacion
- Colonias tranquilas y compactas.
- Consumo de reservas sin caida brusca.
- Piquera limpia y con actividad en dias favorables.
- Sin exceso de humedad ni moho interno.
- Buena recuperacion al inicio de la siguiente temporada.

## Lista practica final
- Revisar reina y poblacion.
- Confirmar reservas suficientes.
- Reducir espacio sobrante.
- Proteger del viento y la lluvia.
- Corregir filtraciones y humedad.
- Dejar el apiario ordenado y estable.

## Errores comunes
- Entrar al invierno con colonias debiles.
- Dejar poco alimento disponible.
- Mantener demasiado espacio vacio dentro de la colmena.
- Cerrar en exceso y favorecer humedad interna.
- Hacer revisiones largas en dias frios.`,
    },
    {
        id: 'honey-harvest',
        title: 'Cosecha de miel paso a paso',
        description: 'Extraccion ordenada y limpia para obtener miel madura sin debilitar la colonia ni estresar a las abejas.',
        category: 'Cosecha',
        readTime: '5 min',
        icon: 'water-outline',
        color: '#E3A008',
        markdown: `# Cosecha de miel paso a paso

## Objetivo
Extraer miel madura de forma limpia, segura y eficiente, sin debilitar la colonia.

## Antes de comenzar
- Revisa que la mayoria de los cuadros esten operculados al menos en un 80%.
- Elige un dia seco, tranquilo y con buena luz.
- Prepara ahumador, cepillo, palanca, alzas vacias, tapa, baldes con tapa y equipo de proteccion.
- Verifica que la sala o area de extraccion este limpia.

## Paso a paso
### 1. Confirmar que la miel esta madura
- Revisa los cuadros del alza melaria.
- Si la miel esta muy abierta o liquida, espera un poco mas.
- La miel madura reduce el riesgo de fermentacion.

### 2. Calmar la colonia
- Usa humo suave en la entrada y debajo de la tapa.
- Espera unos segundos antes de abrir.
- Evita exceso de humo para no alterar el sabor ni agitar a las abejas.

### 3. Retirar los cuadros con miel
- Quita primero los cuadros mas llenos y operculados.
- Sacude o cepilla suavemente las abejas hacia la colmena.
- Coloca los cuadros en un alza vacia o recipiente cubierto.

### 4. Mantener la miel protegida
- Tapa de inmediato los cuadros cosechados.
- No los dejes expuestos al sol, polvo o pillaje.
- Traslada rapido al lugar de extraccion.

### 5. Desopercular
- Usa cuchillo o peine desoperculador limpio.
- Retira solo la capa de cera que cubre la miel.
- Trabaja sobre una bandeja para recuperar miel y cera.

### 6. Extraer la miel
- Coloca los cuadros en el extractor.
- Gira de forma progresiva para evitar romper el panal.
- Extrae ambos lados del cuadro.

### 7. Filtrar y decantar
- Pasa la miel por un colador o filtro adecuado.
- Dejala reposar en un tanque o balde limpio para que suban burbujas e impurezas.
- Mantiene todo bien tapado.

### 8. Envasar correctamente
- Usa envases limpios, secos y de grado alimentario.
- Llena y cierra bien cada recipiente.
- Etiqueta con fecha y lote si aplica.

### 9. Devolver los cuadros
- Regresa los cuadros vacios a las abejas para limpieza, si el manejo lo permite.
- Hazlo al atardecer o con cuidado para evitar pillaje.

## Recomendaciones practicas
- Cosecha solo excedentes; no quites reservas necesarias.
- Mantiene herramientas y manos limpias durante todo el proceso.
- Trabaja con calma para reducir roturas y agresividad.
- Separa miel de alzas melarias de cualquier cuadro con cria.

## Seguridad
- Usa velo, guantes y ropa adecuada.
- Tene especial cuidado si trabajas con colonias defensivas.
- Si hay riesgo de alergia, no trabajes solo.

## Errores comunes
- Cosechar miel con poca operculacion.
- Dejar cuadros destapados cerca del apiario.
- Usar demasiado humo.
- Extraer miel en un lugar sucio o humedo.
- Mezclar cuadros de cria con cuadros de miel.
- Envasar sin filtrar ni dejar decantar.`,
    },
    {
        id: 'supers-storage',
        title: 'Almacenamiento de alzas y cuadros fuera de temporada',
        description: 'Como guardar material seco y limpio, protegido contra polilla, roedores y humedad hasta la siguiente floracion.',
        category: 'Materiales',
        readTime: '4 min',
        icon: 'archive-outline',
        color: '#6B8E23',
        markdown: `# Almacenamiento de alzas y cuadros fuera de temporada

## Objetivo
Conservar alzas y cuadros en buen estado entre temporadas, evitando polilla, hongos, roedores y humedad.

## Antes de guardar
- Selecciona solo material sano y en buen estado.
- Separa cuadros rotos, muy viejos o con senales de enfermedad.
- No almacenes material sospechoso de loque u otras patologias.

## Paso a paso
### 1. Retirar restos de miel y cera suelta
- Revisa cada alza y cada cuadro.
- Quita cera sobrante, propoleo excesivo y residuos.
- Si los cuadros aun tienen miel, evita guardarlos asi por mucho tiempo.

### 2. Secar y ventilar el material
- Asegurate de que todo este seco antes de almacenar.
- Un cuadro humedo favorece moho y fermentacion.
- Trabaja en un lugar aireado y limpio.

### 3. Clasificar por tipo y estado
- Separa alzas completas, cuadros estirados y cuadros para reparar.
- Marca el material mas nuevo y el mas viejo.
- Esto facilita el uso ordenado en la proxima temporada.

### 4. Proteger contra polilla de la cera
- Almacena en pilas ordenadas con buena ventilacion o segun el metodo sanitario que uses en tu zona.
- Revisa periodicamente senales de larvas, telaranas o dano en cera.
- Si usas un tratamiento, respeta dosis, seguridad y normativa local.

### 5. Evitar humedad y calor excesivo
- Guarda en un lugar seco, fresco y bajo techo.
- No apoyes directamente sobre el suelo.
- Usa bases, pallets o estantes.

### 6. Cerrar el acceso a plagas
- Protege el material de roedores, hormigas y otros insectos.
- Usa tapas, mallas o barreras fisicas segun necesidad.
- Mantiene el deposito limpio alrededor.

### 7. Hacer controles periodicos
- Revisa el material cada pocas semanas.
- Busca olor extrano, moho, polilla o deformaciones.
- Actua rapido si aparece una infestacion.

## Recomendaciones practicas
- Almacena los cuadros estirados con especial cuidado; son los mas atractivos para la polilla.
- Renueva cuadros demasiado oscuros o deteriorados.
- Mantiene un pequeno registro de fecha de guardado y revisiones.
- Si puedes, rota el stock para usar primero el material mas antiguo en buen estado.

## Que no guardar
- Cuadros con signos de enfermedad.
- Material mojado o fermentado.
- Madera muy danada o con olor fuerte a moho.

## Errores comunes
- Guardar cuadros con humedad.
- Apilar material sin ventilacion ni control.
- Ignorar los primeros signos de polilla.
- Mezclar material sano con material dudoso.
- Dejar alzas apoyadas en el piso.
- Revisar solo al inicio y olvidarse el resto de la temporada.`,
    },
];

export const GUIDE_CATEGORIES = ['Todas', ...Array.from(new Set(APICULTURE_GUIDES.map((guide) => guide.category)))];

export const getGuideById = (guideId?: string) =>
    APICULTURE_GUIDES.find((guide) => guide.id === guideId);
