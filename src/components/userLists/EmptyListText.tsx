import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { MD3Theme, Text, useTheme } from 'react-native-paper';

type EmptyListTextProps = {
  text: string;
};

const EmptyListText = forwardRef<View, EmptyListTextProps>(({ text }, ref) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View ref={ref}>
      <Text style={styles.emptyListText} variant="bodyLarge">
        {text}
      </Text>
    </View>
  );
});

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    emptyListText: {
      alignSelf: 'center',
      paddingVertical: 20,
      color: theme.colors.backdrop,
    },
  });
export default EmptyListText;
