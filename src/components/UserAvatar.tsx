import React from 'react';
import { Avatar } from 'react-native-paper';
import { User } from '../services/dataTypes';
import { TouchableOpacity } from 'react-native';

type UserAvatarProps = {
  user: User;
  imageUri?: string;
  size?: 'regular' | 'medium' | 'small' | 'big';
  onPress?: (user: User) => void;
};

const getSize = (size: 'regular' | 'medium' | 'small' | 'big'): number => {
  switch (size) {
    case 'regular':
      return 40;
    case 'medium':
      return 30;
    case 'small':
      return 20;
    case 'big':
      return 120;
  }
};

const UserAvatar = ({
  user,
  imageUri,
  size = 'regular',
  onPress,
}: UserAvatarProps) => {
  const photo = imageUri
    ? imageUri
    : user?.photoUrl
    ? user?.photoUrl
    : undefined;
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={() => onPress && onPress(user)}>
      {photo ? (
        <Avatar.Image size={getSize(size)} source={{ uri: photo }} />
      ) : (
        <Avatar.Text
          size={getSize(size)}
          label={user ? user.email.substring(0, 1).toUpperCase() : ''}
        />
      )}
    </TouchableOpacity>
  );
};
export default UserAvatar;
