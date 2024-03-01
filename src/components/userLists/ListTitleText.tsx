import React, { forwardRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { MD3Theme, Text, useTheme } from 'react-native-paper';
import { COLORS } from '../../services/dataUtils';

type HeaderTextProps = {
  title: string;
  style?: ViewStyle;
};

const ListTitleText = forwardRef<View, HeaderTextProps>(
  ({ title, style }, ref) => {
    const theme = useTheme();
    const styles = useStyles(theme);

    return (
      <View ref={ref} style={[styles.container, style]}>
        <Text style={styles.title} variant="titleMedium">
          {title}
        </Text>
      </View>
    );
  },
);
const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      height: 60,
      backgroundColor: COLORS.GreyBackground,
      justifyContent: 'center',
    },
    title: {
      paddingTop: 20,
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
  });
export default ListTitleText;
