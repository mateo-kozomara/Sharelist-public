import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, MD3Theme, Text, useTheme } from 'react-native-paper';
import { REMOVED_VALUE } from '../../services/dataTypes';

type ActivityLogValueTextProps = {
  data: any;
  masterComponent: View;
};

const ActivityLogValueText = ({
  data,
  masterComponent,
}: ActivityLogValueTextProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [xOffset, setXOffset] = useState<number>(0);
  if (masterComponent) {
    masterComponent.measure(
      (
        fx: number,
        _fy: number,
        width: number,
        _height: number,
        _px: number,
        _py: number,
      ) => {
        setXOffset(fx + (width - 20) / 2);
      },
    );
  }

  return (
    <View style={styles.actionDataContainer}>
      <View
        style={[styles.triangle, { transform: [{ translateX: xOffset }] }]}
      />

      {Object.keys(data).map(propName => (
        <View key={propName} style={styles.textContainer}>
          <Text variant="bodySmall" style={styles.actionDataTitle}>
            {propName}
          </Text>
          {propName === 'icon' && data[propName] !== REMOVED_VALUE ? (
            <Avatar.Icon icon={data[propName]} size={20} />
          ) : (
            <Text variant="bodySmall" style={styles.actionDataText}>
              {`${data[propName]}`}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    actionDataText: {
      color: 'white',
      padding: 3,
    },
    actionDataTitle: {
      color: 'white',
      fontWeight: 'bold',
      padding: 3,
      width: 100,
    },
    triangle: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 10,
      borderRightWidth: 10,
      borderBottomWidth: 10,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: theme.colors.secondary,
      left: 0,
      top: -10,
      position: 'absolute',
    },
    textContainer: {
      flexDirection: 'row',
    },
    actionDataContainer: {
      flex: 1,
      backgroundColor: theme.colors.secondary,
      borderRadius: 15,
      paddingHorizontal: 10,
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginBottom: 5,
      paddingVertical: 10,
    },
  });

export default ActivityLogValueText;
