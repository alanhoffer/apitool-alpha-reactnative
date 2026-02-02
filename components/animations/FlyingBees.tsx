import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import beeIcon from '../../assets/images/icons/bee-icon.png';
import colors from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface Bee {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  size: number;
  duration: number;
  delay: number;
  direction: number; // 1 = derecha, -1 = izquierda
}

interface FlyingBeesProps {
  beeCount?: number;
}

const FlyingBees: React.FC<FlyingBeesProps> = ({ beeCount = 4 }) => {
  const [bees, setBees] = React.useState<Bee[]>([]);

  useEffect(() => {
    // Crear abejas con posiciones y animaciones aleatorias
    const newBees = Array.from({ length: beeCount }, (_, i) => {
      // Determinar dirección inicial (izquierda o derecha)
      const goingRight = Math.random() > 0.5;
      const startX = goingRight ? -50 : width + 50; // Empiezan fuera de la pantalla
      // Variar más las alturas, evitando la zona del saludo (primeros 150px)
      // Distribuir entre 150px y 400px desde arriba para más variedad
      const startY = 150 + Math.random() * (height * 0.4 - 150);

      return {
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        rotation: new Animated.Value(0),
        size: 20 + Math.random() * 12, // Tamaño entre 20 y 32 (más chicas)
        duration: 4000 + Math.random() * 2000, // Duración entre 4 y 6 segundos
        delay: i * 500, // Delay escalonado
        direction: goingRight ? 1 : -1, // 1 = derecha, -1 = izquierda
      };
    });
    
    setBees(newBees);

    // Animar cada abeja
    newBees.forEach((bee) => {
      // Animación de vuelo horizontal con movimiento en S
      const createFlightAnimation = () => {
        // Determinar destino (opuesto al inicio)
        const endX = bee.direction > 0 ? width + 50 : -50;
        const baseY = bee.y._value; // Mantener altura similar
        
        // Variar más el movimiento en S para que no siempre pasen por el mismo lugar
        const sVariation = 40 + Math.random() * 30; // Variación entre 40 y 70px
        const midX1 = bee.x._value + (endX - bee.x._value) * 0.33;
        const midY1 = Math.max(150, baseY - sVariation + Math.random() * 20); // Primera curva hacia arriba, pero no menos de 150px
        const midX2 = bee.x._value + (endX - bee.x._value) * 0.66;
        const midY2 = baseY + sVariation - Math.random() * 20; // Segunda curva hacia abajo
        
        // Animación de rotación más rápida y variada
        Animated.loop(
          Animated.sequence([
            Animated.timing(bee.rotation, {
              toValue: 1,
              duration: 600 + Math.random() * 400, // Entre 600 y 1000ms
              useNativeDriver: false,
            }),
            Animated.timing(bee.rotation, {
              toValue: 0,
              duration: 600 + Math.random() * 400,
              useNativeDriver: false,
            }),
          ])
        ).start();

        // Animación de movimiento en S (3 segmentos)
        const segmentDuration = bee.duration / 3;
        
        Animated.sequence([
          // Primer segmento: curva hacia arriba
          Animated.parallel([
            Animated.timing(bee.x, {
              toValue: midX1,
              duration: segmentDuration,
              useNativeDriver: false,
            }),
            Animated.timing(bee.y, {
              toValue: midY1,
              duration: segmentDuration,
              useNativeDriver: false,
            }),
          ]),
          // Segundo segmento: curva hacia abajo
          Animated.parallel([
            Animated.timing(bee.x, {
              toValue: midX2,
              duration: segmentDuration,
              useNativeDriver: false,
            }),
            Animated.timing(bee.y, {
              toValue: midY2,
              duration: segmentDuration,
              useNativeDriver: false,
            }),
          ]),
          // Tercer segmento: enderezar hacia el destino
          Animated.parallel([
            Animated.timing(bee.x, {
              toValue: endX,
              duration: segmentDuration,
              useNativeDriver: false,
            }),
            Animated.timing(bee.y, {
              toValue: baseY,
              duration: segmentDuration,
              useNativeDriver: false,
            }),
          ]),
        ]).start(() => {
          // Cambiar dirección y reiniciar desde el otro lado
          bee.direction *= -1;
          bee.x.setValue(endX);
          bee.y.setValue(baseY);
          createFlightAnimation(); // Loop infinito
        });
      };

      // Iniciar animación después del delay
      setTimeout(() => {
        createFlightAnimation();
      }, bee.delay);
    });
  }, [beeCount]);

  if (bees.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {bees.map((bee) => {
        const rotate = bee.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['-10deg', '10deg'],
        });
        
        // Rotación base para que la abeja mire horizontalmente (90 grados)
        // Si va a la derecha (direction > 0), rotar 90deg, si va a la izquierda, rotar -90deg
        const baseRotation = bee.direction > 0 ? 90 : -90;
        const totalRotation = bee.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: [`${baseRotation - 10}deg`, `${baseRotation + 10}deg`],
        });

        return (
          <Animated.View
            key={bee.id}
            style={[
              styles.bee,
              {
                transform: [
                  { translateX: bee.x },
                  { translateY: bee.y },
                  { rotate: totalRotation },
                ],
                width: bee.size,
                height: bee.size,
              },
            ]}
          >
            <Image 
              source={beeIcon} 
              style={[styles.beeImage, { tintColor: colors.YELLOW }]}
              resizeMode="contain"
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bee: {
    position: 'absolute',
    opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beeImage: {
    width: '100%',
    height: '100%',
  },
});

export default FlyingBees;

