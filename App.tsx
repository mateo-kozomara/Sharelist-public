/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { AuthProvider } from './src/services/authentication/AuthContext';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import AppNavigator from './src/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { DataServiceProvider } from './src/services/data/DataContext';
function App(): JSX.Element {
  const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
    },
  };
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={styles.root}>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <DataServiceProvider>
              <AppNavigator />
            </DataServiceProvider>
          </AuthProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
