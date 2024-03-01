import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { useCallback } from 'react';

export const useAuthService = () => {
  const login = useCallback(
    (email: string, password: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        auth()
          .signInWithEmailAndPassword(email, password)
          .then(() => resolve())
          .catch(reject);
      });
    },
    [],
  );

  const createUser = useCallback(
    (email: string, password: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        auth()
          .createUserWithEmailAndPassword(email, password)
          .then(userData => {
            return database().ref(`/users/${userData.user.uid}`).update({
              email: userData.user.email,
              displayName: userData.user.email,
            });
          })
          .then(resolve)
          .catch(error => {
            auth().currentUser?.delete();
            reject(error);
          });
      });
    },
    [],
  );

  const checkEmailExists = useCallback((email: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      auth()
        .fetchSignInMethodsForEmail(email)
        .then(signInMethods => {
          signInMethods.length ? resolve(true) : resolve(false);
        })
        .catch(reject);
    });
  }, []);

  const sendPasswordResetEmail = useCallback((email: string): Promise<void> => {
    return auth().sendPasswordResetEmail(email);
  }, []);

  const signOut = useCallback((): Promise<void> => {
    return auth().signOut();
  }, []);

  return {
    login,
    createUser,
    checkEmailExists,
    sendPasswordResetEmail,
    signOut,
  };
};
