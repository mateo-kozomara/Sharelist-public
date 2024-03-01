import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Badge, IconButton } from 'react-native-paper';

type FriendsButtonProps = {
  notificationsCount: number;
  onPress?: () => void;
};

const FriendsButton = ({ notificationsCount, onPress }: FriendsButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <IconButton iconColor={'white'} icon={'account-group'} />
      {notificationsCount > 0 && (
        <Badge style={styles.badge} size={20}>
          {notificationsCount}
        </Badge>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
});
export default FriendsButton;
