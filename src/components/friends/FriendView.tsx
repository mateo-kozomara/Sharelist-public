import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Divider, IconButton, useTheme } from 'react-native-paper';
import { User } from '../../services/dataTypes';
import { COLORS } from '../../services/dataUtils';
import UserView from '../UserView';

export enum FriendViewMode {
  AddFriend = 'AddFriend',
  RemoveFriend = 'RemoveFriend',
  Friend = 'Friend',
  InvitedFriend = 'InvitedFriend',
  FriendRequest = 'FriendRequest',
}

export enum FriendViewAction {
  AddFriend = 'AddFriend',
  RemoveFriend = 'RemoveFriend',
  CancelInvite = 'CancelInvite',
  AcceptFriendRequest = 'AcceptFriendRequest',
  DeclineFriendRequest = 'DeclineFriendRequest',
}

type FriendViewProps = {
  user: User;
  mode: FriendViewMode;
  onActionTriggered: (action: FriendViewAction, user: User) => void;
};

const FriendView = ({ user, mode, onActionTriggered }: FriendViewProps) => {
  const theme = useTheme();
  return (
    <>
      <View style={styles.container}>
        <UserView
          user={user}
          showDisabled={mode === FriendViewMode.InvitedFriend}
        />
        {mode === FriendViewMode.FriendRequest && (
          <>
            <IconButton
              mode={'contained-tonal'}
              icon={'account-plus'}
              onPress={() =>
                onActionTriggered(FriendViewAction.AcceptFriendRequest, user)
              }
            />
            <IconButton
              mode={'contained-tonal'}
              icon={'delete'}
              onPress={() =>
                onActionTriggered(FriendViewAction.DeclineFriendRequest, user)
              }
            />
          </>
        )}
        {mode === FriendViewMode.AddFriend && (
          <IconButton
            mode={'contained-tonal'}
            icon={'account-plus'}
            onPress={() => onActionTriggered(FriendViewAction.AddFriend, user)}
          />
        )}
        {mode === FriendViewMode.RemoveFriend && (
          <IconButton
            mode={'contained-tonal'}
            iconColor={theme.colors.primary}
            icon={'delete'}
            onPress={() =>
              onActionTriggered(FriendViewAction.RemoveFriend, user)
            }
          />
        )}
        {mode === FriendViewMode.InvitedFriend && (
          <Button
            mode={'contained-tonal'}
            textColor={theme.colors.primary}
            icon={'delete'}
            onPress={() =>
              onActionTriggered(FriendViewAction.CancelInvite, user)
            }>
            Invite
          </Button>
        )}
      </View>
      <Divider />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.GreyBackground,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default FriendView;
