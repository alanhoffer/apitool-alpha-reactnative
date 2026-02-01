import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
}

interface FlyingBeesProps {
  beeCount?: number;
}

const FlyingBees: React.FC<FlyingBeesProps> = ({ beeCount = 5 }) => {
  const bees = useRef<Bee[]>([]);

  useEffect(() => {
    // Crear abejas con posiciones y animaciones aleatorias
    bees.current = Array.from({ length: beeCount }, (_, i) => {
      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.6); // Solo en la parte superior
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = startY + (Math.random() - 0.5) * 200;

      return {
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        rotation: new Animated.Value(0),
        size: 16 + Math.random() * 8, // Tamaño entre 16 y 24
        duration: 3000 + Math.random() * 2000, // Duración entre 3 y 5 segundos
        delay: i * 500, // Delay escalonado
      };
    });

    // Animar cada abeja
    bees.current.forEach((bee) => {
      // Animación de vuelo (movimiento en zigzag)
      const createFlightAnimation = () => {
        // Generar nueva posición aleatoria
        const randomX = Math.random() * (width - 40) + 20;
        const randomY = Math.random() * (height * 0.5) + 50;
        
        // Animación de rotación continua
        Animated.loop(
          Animated.sequence([
            Animated.timing(bee.rotation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(bee.rotation, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        // Animación de movimiento
        Animated.parallel([
          Animated.timing(bee.x, {
            toValue: randomX,
            duration: bee.duration,
            useNativeDriver: true,
          }),
          Animated.timing(bee.y, {
            toValue: randomY,
            duration: bee.duration,
            useNativeDriver: true,
          }),
        ]).start(() => {
          createFlightAnimation(); // Loop infinito
        });
      };

      // Iniciar animación después del delay
      setTimeout(() => {
        createFlightAnimation();
      }, bee.delay);
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {bees.current.map((bee) => {
        const rotate = bee.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '15deg'],
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
                  { rotate },
                ],
                width: bee.size,
                height: bee.size,
              },
            ]}
          >
            <Ionicons name="bug" size={bee.size} color={colors.YELLOW} />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  bee: {
    position: 'absolute',
    opacity: 0.6,
  },
});

export default FlyingBees;

