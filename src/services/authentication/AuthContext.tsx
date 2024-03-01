import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { User } from '../dataTypes';
import database from '@react-native-firebase/database';

type AuthContextProps = {
  initializing: boolean;
  currentUser?: User;
  currentUserId?: string;
};

const AuthContext = createContext<AuthContextProps>({
  initializing: true,
  currentUser: undefined,
  currentUserId: undefined,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [currentUserId, setCurrentUserId] = useState<string>();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(
      (userState: FirebaseAuthTypes.User | null) => {
        setCurrentUserId(userState?.uid);
        !userState && setInitializing(false);
      },
    );
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setCurrentUser(undefined);
      return;
    }

    const onValueChange = database()
      .ref('/users')
      .orderByKey()
      .equalTo(currentUserId)
      .on('value', snapshot => {
        const userData = snapshot.val();
        if (userData) {
          setCurrentUser({
            uid: currentUserId,
            ...userData[currentUserId],
          });
        }
        setInitializing(false);
      });

    // Stop listening for updates when no longer required
    return () => database().ref('/users').off('value', onValueChange);
  }, [currentUserId]);

  const value = useMemo(
    () => ({
      initializing,
      currentUser,
      currentUserId,
    }),
    [currentUser, initializing, currentUserId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
