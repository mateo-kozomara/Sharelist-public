import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { useDataService } from '../data/useDataService';
import { useAuthContext } from '../authentication/AuthContext';

export const usePushNotificationToken = () => {
  const { updateUserPushNotificationToken } = useDataService();
  const { currentUser } = useAuthContext();

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    const getAuthStatus = async () => {
      Platform.OS === 'android'
        ? await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          )
        : await messaging().requestPermission();

      const token = await messaging().getToken();
      updateUserPushNotificationToken(token);
    };
    getAuthStatus();
  }, [currentUser?.uid, updateUserPushNotificationToken]);
};
