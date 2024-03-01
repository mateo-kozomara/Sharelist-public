import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { User } from '../services/dataTypes';
import UserAvatar from './UserAvatar';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, SCREENS } from '../AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type UserViewProps = {
  user: User;
  textColor?: string;
  size?: 'regular' | 'small';
  showDisabled?: boolean;
  style?: ViewStyle;
};

const UserView = ({
  user,
  textColor,
  style,
  showDisabled = false,
  size = 'regular',
}: UserViewProps) => {
  const styles = useStyles(size, textColor);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onSelectAvatar = (usr: User) => {
    navigation.navigate(SCREENS.Profile, { user: usr });
  };
  return (
    <View
      style={{
        ...styles.container,
        ...style,
        ...(showDisabled && styles.disabledContainer),
      }}>
      <UserAvatar user={user} size={size} onPress={onSelectAvatar} />
      <Text
        style={styles.emailText}
        variant={size === 'regular' ? 'titleMedium' : 'titleSmall'}>
        {user.displayName}
      </Text>
    </View>
  );
};
const useStyles = (size: 'regular' | 'small', textColor?: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconLetter: {
      textAlign: 'center',
      color: 'white',
    },
    emailText: {
      marginHorizontal: size === 'small' ? 5 : 10,
      flexShrink: 1,
      flexWrap: 'wrap',
      color: textColor ? textColor : 'black',
    },
    disabledContainer: {
      opacity: 0.3,
    },
  });
export default UserView;
