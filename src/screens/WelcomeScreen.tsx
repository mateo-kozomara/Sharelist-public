import React, { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';

import LoginForm from '../components/LoginForm';
import { useAuthContext } from '../services/authentication/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../AppNavigator';
import LoadingAnimation from '../components/LoadingAnimation';
type WelcomeScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  SCREENS.Welcome
>;

const WelcomeScreen = () => {
  const { initializing, currentUser } = useAuthContext();
  const navigation = useNavigation<WelcomeScreenProp>();

  useEffect(() => {
    if (Platform.OS === 'android') {
      navigation.setOptions({
        headerShown: false,
      });
    }
  }, [navigation]);

  if (initializing) {
    return <LoadingAnimation />;
  }

  if (!currentUser?.email) {
    return <LoginForm />;
  }

  return (
    <View>
      <Text>Welcome {currentUser?.email}</Text>
    </View>
  );
};

export default WelcomeScreen;
