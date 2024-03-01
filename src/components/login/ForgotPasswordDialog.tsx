import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Button,
  Dialog,
  MD3Theme,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { useAuthService } from '../../services/authentication/useAuthService';
import { sanitizeFirebaseError } from '../../services/dataUtils';

type ForgotPasswordViewProps = {
  email: string;
  onDismissed: () => void;
};

const ForgotPasswordView = ({
  email,
  onDismissed,
}: ForgotPasswordViewProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>();
  const [title, setTitle] = useState<string>('Reset Password');
  const { sendPasswordResetEmail } = useAuthService();

  const handleSendPaswordResetLink = () => {
    if (resultText) {
      onDismissed();
      return;
    }
    setLoading(true);
    sendPasswordResetEmail(email)
      .then(() => {
        setTitle('Check your email');
        setResultText('We sent password recovery instructions.');
      })
      .catch(error => {
        setResultText(sanitizeFirebaseError(error.message));
      })
      .finally(() => setLoading(false));
  };

  return (
    <Portal>
      <Dialog visible={true} onDismiss={onDismissed}>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          {resultText ? (
            <Text variant="bodyMedium">{resultText}</Text>
          ) : (
            <Text variant="bodyMedium">
              Send password reset link to{' '}
              <Text style={styles.boldFont} variant="bodyMedium">
                {email}
              </Text>
              ?
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          {!resultText && <Button onPress={onDismissed}>Cancel</Button>}
          <Button
            loading={loading}
            labelStyle={styles.boldFont}
            onPress={handleSendPaswordResetLink}>
            {resultText ? 'Close' : 'Send'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    title: {
      color: theme.colors.primary,
    },
    boldFont: {
      fontWeight: 'bold',
    },
  });

export default ForgotPasswordView;
