import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MD3Theme, Text, useTheme } from 'react-native-paper';
import { User } from '../../services/dataTypes';
import UserView from '../UserView';

type ListOwnerViewProps = {
  owner: User;
};

const ListOwnerView = ({ owner }: ListOwnerViewProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.ownerLabel}>OWNER</Text>
      <View style={styles.userContainer}>
        <UserView user={owner} size="small" />
      </View>
    </View>
  );
};
const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      width: 260,
      height: 50,
      backgroundColor: 'white',
      borderRadius: 20,
      alignItems: 'center',
      alignSelf: 'center',
    },
    ownerLabel: {
      fontWeight: 'bold',
      fontSize: 12,
      top: 5,
      color: theme.colors.primary,
    },

    userContainer: {
      maxWidth: 230,
      bottom: 5,
    },
  });

export default ListOwnerView;
