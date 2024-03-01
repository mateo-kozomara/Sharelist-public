import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { LOTTIE_ANIMATIONS } from '../assets/lottie';

const LoadingAnimation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        style={styles.animation}
        source={LOTTIE_ANIMATIONS.loading}
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '75%',
  },
  animation: {
    flex: 1,
  },
});

export default LoadingAnimation;
