import React from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import { useAuthContext } from './services/authentication/AuthContext';
import ListDetailsScreen from './screens/ListDetailsScreen';
import MyListsScreen from './screens/MyListsScreen';
import FriendsScreen from './screens/FriendsScreen';
import { Button, IconButton, useTheme } from 'react-native-paper';
import HeaderText from './components/HeaderText';
import FriendsButton from './components/friends/FriendsButton';
import ListSettingsScreen from './screens/ListSettingsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListActivityScreen from './screens/ListActivityScreen';
import { COLORS } from './services/dataUtils';
import ProfileScreen from './screens/ProfileScreen';
import UserAvatarButton from './components/UserAvatarButton';
import { User } from './services/dataTypes';

export enum SCREENS {
  Welcome = 'Welcome',
  MyLists = 'MyLists',
  ListDetails = 'ListDetails',
  Friends = 'Friends',
  ListSettings = 'ListSettings',
  ListActivity = 'ListActivity',
  Profile = 'Profile',
}

export type RootStackParamList = {
  Welcome: undefined;
  MyLists: undefined;
  ListDetails: { userListId: string };
  Friends: undefined;
  ListSettings: { userListId: string };
  ListActivity: { userListId: string };
  Profile: { user: User };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { currentUserId } = useAuthContext();
  const theme = useTheme();

  const modalScreenOptions: {} = {
    animation: 'slide_from_bottom',
    presentation: 'modal',
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: 'white',
    // eslint-disable-next-line react/no-unstable-nested-components
    headerTitle: () => <HeaderText title={''} />,
  };

  console.log('render app navigator');
  return (
    <RootStack.Navigator initialRouteName="Welcome">
      {currentUserId ? (
        <>
          <RootStack.Screen
            name="MyLists"
            component={MyListsScreen}
            options={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: 'white',
              // eslint-disable-next-line react/no-unstable-nested-components
              headerTitle: () => <HeaderText title={'My Sharelists'} />,
              // eslint-disable-next-line react/no-unstable-nested-components
              headerLeft: () => <FriendsButton notificationsCount={0} />,
              // eslint-disable-next-line react/no-unstable-nested-components
              headerRight: () => <UserAvatarButton />,
            }}
          />
          <RootStack.Screen
            name="ListDetails"
            component={ListDetailsScreen}
            options={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: 'white',
              headerBackTitle: 'My Sharelists',
              // eslint-disable-next-line react/no-unstable-nested-components
              headerTitle: () => <HeaderText title={''} />,
              // eslint-disable-next-line react/no-unstable-nested-components
              headerRight: () => (
                <>
                  <IconButton icon={'sine-wave'} />
                  <IconButton icon={'cog'} />
                </>
              ),
            }}
          />
          <RootStack.Screen
            name="Friends"
            component={FriendsScreen}
            options={modalScreenOptions}
          />
          <RootStack.Screen
            name="ListSettings"
            component={ListSettingsScreen}
            options={modalScreenOptions}
          />
          <RootStack.Screen
            name="ListActivity"
            component={ListActivityScreen}
            options={modalScreenOptions}
          />
          <RootStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              ...modalScreenOptions,
              // eslint-disable-next-line react/no-unstable-nested-components
              headerRight: () => (
                <Button textColor={'white'} mode="text">
                  Save
                </Button>
              ),
            }}
          />
        </>
      ) : (
        <RootStack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            headerStyle: {
              backgroundColor: COLORS.GreyBackground,
            },
            headerTitle: '',
          }}
        />
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator;
