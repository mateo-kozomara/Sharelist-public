import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Keyboard,
} from 'react-native';

import { useAuthContext } from '../services/authentication/AuthContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import HeaderText from '../components/HeaderText';
import UserAvatar from '../components/UserAvatar';
import {
  Button,
  HelperText,
  IconButton,
  MD3Theme,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { COLORS } from '../services/dataUtils';
import { useAuthService } from '../services/authentication/useAuthService';
import { useDataService } from '../services/data/useDataService';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList, SCREENS } from '../AppNavigator';

const ProfileScreen = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { currentUser } = useAuthContext();
  const route = useRoute<RouteProp<RootStackParamList, SCREENS.Profile>>();
  const user = route.params.user;
  const isMyProfile = user.uid === currentUser?.uid;
  const { changeDisplayName, setUserPicture, updateUserPushNotificationToken } =
    useDataService();
  const navigation = useNavigation();
  const { signOut } = useAuthService();
  const [displayName, setDisplayName] = useState<string>(
    user ? user.displayName : '',
  );
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string>();

  const onSaveChanges = useCallback(() => {
    setLoading(true);
    changeDisplayName(displayName)
      .then(() => {
        return imageUri ? setUserPicture(imageUri) : Promise.resolve();
      })
      .then(() => {
        navigation.goBack();
      })
      .catch((e: Error) => {
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [displayName, imageUri, navigation, changeDisplayName, setUserPicture]);

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerTitle: () => <HeaderText title={'Profile'} />,
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () =>
        hasChanges && (
          <Button
            loading={loading}
            textColor={'white'}
            mode="text"
            onPress={onSaveChanges}>
            Save
          </Button>
        ),
    });
  }, [hasChanges, loading, navigation, onSaveChanges]);

  const onChangePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
    });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setHasChanges(true);
      setImageUri(result.assets[0].uri);
    }
  };
  const onChangeDisplayName = (username: string) => {
    setError(undefined);
    setHasChanges(username.length > 0);
    setDisplayName(username);
  };
  const onSignOut = () => {
    updateUserPushNotificationToken().then(signOut);
  };

  return (
    <Pressable
      pointerEvents={loading ? 'none' : 'auto'}
      style={styles.container}
      onPress={Keyboard.dismiss}>
      <TouchableOpacity disabled={!isMyProfile} onPress={onChangePhoto}>
        <UserAvatar user={user} size="big" imageUri={imageUri} />
        {isMyProfile && (
          <IconButton
            style={styles.editIcon}
            icon={'pencil'}
            mode="contained"
          />
        )}
      </TouchableOpacity>
      <TextInput
        disabled={!isMyProfile}
        placeholder={'Username'}
        style={styles.displayName}
        value={displayName}
        onChangeText={onChangeDisplayName}
      />
      {error && <HelperText type="error">{error}</HelperText>}
      <View style={styles.fullWidthContainer}>
        <View style={styles.userPropContainer}>
          <Text style={styles.userPropTitle} variant="titleMedium">
            Email
          </Text>
          <Text style={styles.userPropValue} variant="titleMedium">
            {user.email}
          </Text>
        </View>
      </View>
      {isMyProfile && (
        <Button
          style={styles.signOutButton}
          textColor="white"
          buttonColor={theme.colors.error}
          mode={'contained'}
          icon={'logout'}
          onPress={onSignOut}>
          Sign out
        </Button>
      )}
    </Pressable>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 20,
    },
    editIcon: {
      position: 'absolute',
      right: -10,
      top: -10,
      width: 35,
      height: 35,
    },
    displayName: {
      backgroundColor: COLORS.GreyBackground,
      minWidth: 200,
      textAlign: 'center',
      fontSize: 25,
    },
    fullWidthContainer: {
      width: '100%',
    },
    userPropContainer: {
      flexDirection: 'row',
      marginTop: 80,
      marginHorizontal: 40,
      justifyContent: 'space-between',
    },
    userPropTitle: {
      fontSize: 15,
      color: theme.colors.primary,
    },
    userPropValue: {
      paddingLeft: 20,
      textAlign: 'right',
      color: 'grey',
    },
    signOutButton: {
      color: 'white',
      width: 150,
      bottom: 0,
      marginTop: 'auto',
      marginBottom: 75,
    },
  });

export default ProfileScreen;
