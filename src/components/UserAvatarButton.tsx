import React from 'react';
import { User } from '../services/dataTypes';
import UserAvatar from './UserAvatar';
import { StyleSheet, View } from 'react-native';

type UserAvatarButtonProps = {
  user?: User;
  onPress?: () => void;
};

const UserAvatarButton = ({ user, onPress }: UserAvatarButtonProps) => {
  return (
    <View style={styles.container}>
      {user && <UserAvatar user={user} size="medium" onPress={onPress} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 1,
  },
});

export default UserAvatarButton;
