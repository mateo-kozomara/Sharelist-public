import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MD3Theme, Text, useTheme } from 'react-native-paper';

type ActivityLogTextProps = {
  children: ReactNode;
};

const ActivityLogText = ({ children }: ActivityLogTextProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" numberOfLines={1} style={styles.actionTitle}>
        {children}
      </Text>
    </View>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
      paddingHorizontal: 5,
      flexDirection: 'row',
    },
    actionTitle: {
      backgroundColor: theme.colors.secondaryContainer,
      color: 'black',
      alignSelf: 'flex-start',
      borderRadius: 5,
      padding: 5,
      overflow: 'hidden',
    },
  });

export default ActivityLogText;
