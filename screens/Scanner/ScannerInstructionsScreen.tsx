// src/screens/InstructionsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Swiper from 'react-native-swiper';




const InstructionsScreen: React.FC = ({ navigation }: any) => {

  return (
    <Swiper
      showsPagination={true}
      paginationStyle={styles.pagination}
      activeDotColor='#53bce9'
      dotColor="#ccc"
    >
      {/* <View style={styles.slide}>
        <Text style={styles.title}>Bienvenido a ApiScanner</Text>
        <Image
          style={styles.image}
          source={require('../../assets/images/logos/icon-white-yellow.png')} // Asegúrate de tener esta imagen en tu proyecto
        />
        <Text style={styles.text}>
          Con nuestra aplicación, podrás escanear códigos de barras en los tambores,
          registrar información detallada y mantener un control preciso de tus inventarios.
        </Text>
      </View> */}

      <View style={styles.slide}>
        <Text style={styles.title}>¿Cómo usar la aplicación?</Text>
        <Image
          style={styles.icon}
          source={require('../../assets/images/icons/camera.png')} // Asegúrate de tener esta imagen en tu proyecto
        />
        <Text style={styles.text}>
          Usa la cámara para escanear códigos de barras. La app detectará automáticamente cada tambor y abrirá un formulario de entrada.
        </Text>
        <Image
          style={styles.icon}
          source={require('../../assets/images/icons/drum.png')} // Asegúrate de tener esta imagen en tu proyecto
        />
        <Text style={styles.text}>
          Ingresa el código, la tara y el peso del tambor para un seguimiento preciso.
        </Text>
        <Image
          style={styles.icon}
          source={require('../../assets/images/icons/paper-plane.png')} // Asegúrate de tener esta imagen en tu proyecto
        />
        <Text style={styles.text}>
          Guarda los datos, visualiza la lista de tambores, y destaca los repetidos con un color específico. Exporta o comparte la información en Excel o texto plano.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ListScreen')}>
          <View >
            <Text style={styles.buttonText}>Empezar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    resizeMode: 'contain',
    width: 150,
    height: 200,
    marginBottom: 20,
  },
  icon: {
    width: 40,
    height: 40,
    marginVertical: 10,
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
    padding: 10,
    width: '100%',
    fontSize: 16,
    color: 'white',
    backgroundColor: '#53bce9',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  pagination: {
    bottom: 10,
  },
});

export default InstructionsScreen;
