import React from 'react';
import { StyleSheet, Text, View, Image, Animated } from 'react-native';
import { useState, useEffect } from 'react';




const SplashScreen = ():JSX.Element => {

  const [rotateValue, setRotateValue] = useState(new Animated.Value(0));


  useEffect(() => {
    
    animateWidth();
  }, []);



  function animateWidth() {
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 3000,
          delay: 1000,
          useNativeDriver:true,
        })
      ).start();
  }


  
  const RotateData = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

    return(
        <View style={viewsStyles.container}>

          <View >
            <Animated.Image 
              style={{
                height: 100,
                width: 100,
                resizeMode: 'contain',
                transform: [{ rotate: RotateData }],
              }}
              source={{
                uri: 'https://i.imgur.com/BWBW8rW.png',
              }}
            />
            <Text></Text>
          </View>
      </View>
    )
}

const viewsStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

const componentStyles = StyleSheet.create({
  image:{
    resizeMode: "contain",
    height: 80, 
    width: 80,
  },
  appName:{
    fontSize: 48
  }

});

export default SplashScreen;

