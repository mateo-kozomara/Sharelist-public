import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { MD3Theme, Text, useTheme } from 'react-native-paper';
import { COLORS } from '../../services/dataUtils';

type AuthActionTextProps = {
  text: string;
};

const AuthActionText = ({ text }: AuthActionTextProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  return (
    <View>
      <Text numberOfLines={1} style={styles.text} variant="headlineSmall">
        {text ? text : ' '}
      </Text>
    </View>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    text: {
      // backgroundColor: 'red',
      color: theme.colors.primary,
      fontWeight: '200',
      // maxWidth: 130,
    },
  });

export default AuthActionText;
