import React, { ForwardedRef, ReactNode, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ActivityLogAction } from '../../services/dataTypes';
import { getActivityActionColor } from '../../services/dataUtils';

type ActivityActionTextProps = {
  action: ActivityLogAction;
  children: ReactNode;
};

const ActivityActionText = forwardRef(
  ({ action, children }: ActivityActionTextProps, ref: ForwardedRef<View>) => {
    const bgColor = getActivityActionColor(action);
    const styles = useStyles(bgColor);

    return (
      <View ref={ref} style={styles.container}>
        <Text numberOfLines={1} style={styles.actionTitle} variant="titleSmall">
          {children}
        </Text>
      </View>
    );
  },
);

const useStyles = (bgColor: string) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      backgroundColor: bgColor,
      height: 30,
      borderRadius: 15,
      paddingHorizontal: 10,
    },
    actionTitle: {
      color: 'white',
    },
  });

export default ActivityActionText;
