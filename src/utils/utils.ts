import { Alert } from 'react-native';

export const showConfirmDialog = (
  text: string,
  cancelButtonText: string = 'Cancel',
  acceptButtonText: string = 'Delete',
  headerText: string = 'Are you sure?',
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Alert.alert(headerText, text, [
      {
        text: cancelButtonText,
        onPress: reject,
        style: 'cancel',
      },
      { text: acceptButtonText, onPress: () => resolve() },
    ]);
  });
};
