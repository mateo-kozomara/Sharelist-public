import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  TextInput as RNTextInput,
  Pressable,
} from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  Text,
  useTheme,
  MD3Theme,
} from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { LOTTIE_ANIMATIONS } from '../assets/lottie';
import { useAuthService } from '../services/authentication/useAuthService';
import AuthActionText from './login/AuthActionText';
import ForgotPasswordView from './login/ForgotPasswordDialog';
import { validateEmail, sanitizeFirebaseError } from '../services/dataUtils';

const LoginForm = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const yOffsetAnimation = useRef<Animated.Value>(
    new Animated.Value(0),
  ).current;
  const [authenticationError, setAuthenticationError] = useState<Error | null>(
    null,
  );
  const [authenticationInProgress, setAuthenticationInProgress] =
    useState<boolean>(false);
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<
    'EMAIL_CHECK' | 'LOGIN' | 'REGISTER'
  >('EMAIL_CHECK');
  const [helperText, setHelperText] = useState<string>('');
  const emailInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const { login, createUser, checkEmailExists } = useAuthService();
  const [showForgotPasswordView, setShowForgotPasswordView] =
    useState<boolean>(false);

  const handleReset = (): void => {
    emailInputRef.current?.focus();
    setFormMode('EMAIL_CHECK');
    setPassword('');
    setAuthenticationError(null);
    setAuthenticationInProgress(false);
    setHelperText('');
    animateHidePassword();
  };

  const handleSubmit = (): void => {
    setAuthenticationError(null);
    switch (formMode) {
      case 'EMAIL_CHECK':
        handleCheckEmail();
        break;
      case 'LOGIN':
        handleLogin();
        break;
      case 'REGISTER':
        handleRegister();
        break;
      default:
        console.log('Error state');
        break;
    }
  };

  const handleCheckEmail = (): void => {
    setAuthenticationInProgress(true);
    checkEmailExists(email as string)
      .then(emailExists => {
        emailExists ? handleExistingEmail() : handleNewEmail();
        passwordInputRef.current?.focus();
      })
      .catch(error => {
        setAuthenticationError(error);
      })
      .finally(() => {
        setAuthenticationInProgress(false);
      });
  };

  const handleLogin = (): void => {
    setAuthenticationInProgress(true);
    login(email as string, password as string)
      .catch(error => {
        setAuthenticationError(error);
      })
      .finally(() => {
        setAuthenticationInProgress(false);
      });
  };

  const handleRegister = (): void => {
    setAuthenticationInProgress(true);
    createUser(email as string, password as string)
      .catch(error => {
        setAuthenticationError(error);
      })
      .finally(() => {
        setAuthenticationInProgress(false);
      });
  };

  const handleNewEmail = (): void => {
    setHelperText('Create a new account');
    setFormMode('REGISTER');
    animateShowPassword();
  };
  const handleExistingEmail = (): void => {
    setHelperText('Login');
    setFormMode('LOGIN');
    animateShowPassword();
  };
  const handleForgotPassword = (): void => {
    !validateEmail(email)
      ? setAuthenticationError(Error('Please enter a valid email address'))
      : setShowForgotPasswordView(true);
  };

  const animateShowPassword = (): void => {
    Animated.timing(yOffsetAnimation, {
      toValue: 56,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const animateHidePassword = (): void => {
    Animated.timing(yOffsetAnimation, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable style={styles.screen} onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.screen}
        enabled
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <Text
            style={styles.logoText}
            variant={
              Platform.OS === 'android' ? 'displaySmall' : 'displayMedium'
            }>
            Sharelist
          </Text>
          <LottieView
            style={styles.animation}
            source={LOTTIE_ANIMATIONS.checkList}
            autoPlay
            loop
          />
          <AuthActionText text={helperText} />
          <HelperText
            style={styles.helperText}
            type="error"
            visible={!!authenticationError}>
            {authenticationError
              ? sanitizeFirebaseError(authenticationError.message)
              : ''}
          </HelperText>
          <TextInput
            error={!!authenticationError}
            style={styles.input}
            value={email ? email : ''}
            ref={emailInputRef}
            mode="outlined"
            autoCapitalize="none"
            returnKeyType={'next'}
            label="Your Email"
            keyboardType="email-address"
            onFocus={handleReset}
            onSubmitEditing={handleSubmit}
            onChangeText={newEmail => setEmail(newEmail)}
          />
          <Animated.View
            style={{
              ...styles.passwordContainer,
              transform: [{ translateY: yOffsetAnimation }],
            }}>
            <TextInput
              error={!!authenticationError}
              style={styles.input}
              value={password ? password : ''}
              ref={passwordInputRef}
              mode="outlined"
              autoCapitalize="none"
              returnKeyType={'next'}
              label="Your Password"
              secureTextEntry
              keyboardType="default"
              onSubmitEditing={handleSubmit}
              onChangeText={newPassword => setPassword(newPassword)}
            />
          </Animated.View>
          <Animated.View
            style={{
              ...styles.buttonContainer,
              transform: [{ translateY: yOffsetAnimation }],
            }}>
            <Button
              loading={authenticationInProgress}
              disabled={
                (formMode === 'EMAIL_CHECK' && !email) ||
                (formMode !== 'EMAIL_CHECK' && !password)
              }
              mode="outlined"
              onPress={handleSubmit}>
              {formMode === 'EMAIL_CHECK'
                ? 'Next'
                : formMode === 'LOGIN'
                ? 'Login'
                : 'Register'}
            </Button>
            <Button
              style={styles.forgotPassword}
              mode="text"
              onPress={handleForgotPassword}>
              Forgot password?
            </Button>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
      {showForgotPasswordView && (
        <ForgotPasswordView
          email={email!}
          onDismissed={() => setShowForgotPasswordView(false)}
        />
      )}
    </Pressable>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    logoText: {
      color: theme.colors.primary,
      fontWeight: '200',
      marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    content: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 100,
      marginHorizontal: 40,
      maxWidth: 400,
    },
    input: {
      alignSelf: 'stretch',
    },
    passwordContainer: {
      alignSelf: 'stretch',
      marginTop: -56,
      zIndex: -1,
    },
    buttonContainer: {
      alignSelf: 'stretch',
      marginTop: 15,
      marginBottom: 30,
    },
    forgotPassword: {
      marginTop: 20,
      alignSelf: 'center',
    },
    animation: {
      width: 150,
      height: 150,
      alignSelf: 'center',
    },
    helperText: {
      textAlign: 'center',
      borderRadius: 20,
      marginBottom: 10,
    },
  });

export default LoginForm;
