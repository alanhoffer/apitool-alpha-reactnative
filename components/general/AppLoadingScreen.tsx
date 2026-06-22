import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';
import { palette, fonts } from '../../constants/theme';

type AppLoadingScreenProps = {
  message?: string;
};

const dotCount = 3;

const AppLoadingScreen = ({ message = 'preparando la colmena' }: AppLoadingScreenProps) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [dotAnim, floatAnim]);

  const floatStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -7],
        }),
      },
      {
        rotate: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['-1deg', '1deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F2E4" />
      <HoneycombPattern />

      <View style={styles.content}>
        <View style={styles.markArea}>
          <FloatingHex style={[styles.hexTop, styles.hexStrong]} fill="#F5A524" />
          <FloatingHex style={[styles.hexLeftTop, styles.hexSoft]} fill="#F8DFA8" />
          <FloatingHex style={[styles.hexRightTop, styles.hexMedium]} fill="#F7C978" />
          <FloatingHex style={[styles.hexLeftBottom, styles.hexSoft]} fill="#F8DFA8" />
          <FloatingHex style={[styles.hexRightBottom, styles.hexSoft]} fill="#F8DFA8" />
          <FloatingHex style={[styles.hexBottom, styles.hexSoft]} fill="#F8DFA8" />

          <Animated.View style={[styles.mainMark, floatStyle]}>
            <BeeBadge />
          </Animated.View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.title}>Apitool</Text>
          <View style={styles.loadingLine}>
            <View style={styles.dots}>
              {Array.from({ length: dotCount }).map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: getDotOpacity(dotAnim, index),
                      transform: [{ scale: getDotScale(dotAnim, index) }],
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const getDotOpacity = (animation: Animated.Value, index: number) => {
  const start = index * 0.18;
  return animation.interpolate({
    inputRange: [0, start, start + 0.11, start + 0.24, 1],
    outputRange: [0.25, 0.25, 1, 0.25, 0.25],
    extrapolate: 'clamp',
  });
};

const getDotScale = (animation: Animated.Value, index: number) => {
  const start = index * 0.18;
  return animation.interpolate({
    inputRange: [0, start, start + 0.11, start + 0.24, 1],
    outputRange: [0.8, 0.8, 1.08, 0.8, 0.8],
    extrapolate: 'clamp',
  });
};

const HoneycombPattern = () => {
  const cells = [];
  const radius = 34;
  const stepX = radius * 1.52;
  const stepY = radius * 1.3;

  for (let row = -1; row < 19; row += 1) {
    for (let col = -1; col < 9; col += 1) {
      cells.push({
        x: col * stepX + (row % 2 ? stepX / 2 : 0) + 20,
        y: row * stepY + 28,
      });
    }
  }

  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
      <G opacity={0.4}>
        {cells.map((cell, index) => (
          <Polygon
            key={`${cell.x}-${cell.y}-${index}`}
            points={hexPoints(cell.x, cell.y, radius)}
            fill="none"
            stroke="#F5D99D"
            strokeWidth={1}
          />
        ))}
      </G>
    </Svg>
  );
};

const FloatingHex = ({ fill, style }: { fill: string; style: any }) => (
  <View style={[styles.floatingHex, style]} pointerEvents="none">
    <Svg width="100%" height="100%" viewBox="0 0 64 64">
      <Polygon points={hexPoints(32, 32, 28)} fill={fill} />
    </Svg>
  </View>
);

const BeeBadge = () => (
  <Svg width={112} height={112} viewBox="0 0 112 112">
    <Polygon points={hexPoints(56, 56, 47)} fill="#FFCB52" stroke="#A65F00" strokeWidth={3} />
    <G>
      <Ellipse cx={42} cy={42} rx={15} ry={11} fill="#FFF3C4" opacity={0.9} />
      <Ellipse cx={70} cy={42} rx={15} ry={11} fill="#FFF3C4" opacity={0.9} />
      <Circle cx={56} cy={38} r={11} fill="#0F1B2D" />
      <Path d="M38 58 Q56 46 74 58 L70 78 Q56 89 42 78 Z" fill="#0F1B2D" />
      <Rect x={42} y={58} width={28} height={5} rx={2.5} fill="#FFCB52" />
      <Rect x={40} y={68} width={32} height={5} rx={2.5} fill="#FFCB52" />
      <Circle cx={52} cy={36} r={2} fill="#FFCB52" />
      <Circle cx={60} cy={36} r={2} fill="#FFCB52" />
      <Path d="M48 27 L42 18" stroke="#0F1B2D" strokeWidth={2} strokeLinecap="round" />
      <Path d="M64 27 L70 18" stroke="#0F1B2D" strokeWidth={2} strokeLinecap="round" />
      <Circle cx={41} cy={17} r={2} fill="#0F1B2D" />
      <Circle cx={71} cy={17} r={2} fill="#0F1B2D" />
    </G>
  </Svg>
);

const hexPoints = (cx: number, cy: number, radius: number) => {
  const points = [];
  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI / 180) * (60 * index - 30);
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return points.join(' ');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F2E4',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  markArea: {
    width: 238,
    height: 276,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -42,
    marginBottom: 52,
  },
  mainMark: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHex: {
    position: 'absolute',
  },
  hexTop: {
    top: 0,
    left: 92,
    width: 56,
    height: 56,
  },
  hexLeftTop: {
    top: 56,
    left: 12,
    width: 54,
    height: 54,
  },
  hexRightTop: {
    top: 56,
    right: 12,
    width: 56,
    height: 56,
  },
  hexLeftBottom: {
    bottom: 82,
    left: 10,
    width: 56,
    height: 56,
  },
  hexRightBottom: {
    bottom: 82,
    right: 10,
    width: 56,
    height: 56,
  },
  hexBottom: {
    bottom: 30,
    left: 91,
    width: 56,
    height: 56,
  },
  hexStrong: {
    opacity: 1,
  },
  hexMedium: {
    opacity: 0.9,
  },
  hexSoft: {
    opacity: 0.72,
  },
  copyBlock: {
    alignItems: 'center',
  },
  title: {
    color: palette.navy,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.soraExtraBold,
    marginBottom: 12,
  },
  loadingLine: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dots: {
    width: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5A524',
  },
  message: {
    color: palette.inkMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.manropeSemiBold,
  },
});

export default AppLoadingScreen;
