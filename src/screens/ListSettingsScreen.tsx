import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthContext } from '../services/authentication/AuthContext';
import { User, UserList } from '../services/dataTypes';
import { RootStackParamList, SCREENS } from '../AppNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Button, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HeaderText from '../components/HeaderText';
import ListOwnerView from '../components/userLists/ListOwnerView';
import InviteCollaboratorsView from '../components/listInvites/InviteCollaboratorsView';
import { useDataContext } from '../services/data/DataContext';
import { friendIdsToUsers } from '../services/dataUtils';
import { useDataService } from '../services/data/useDataService';
import FriendsListView from '../components/friends/FriendsListView';
import {
  FriendViewAction,
  FriendViewMode,
} from '../components/friends/FriendView';

type ListSettingsScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  SCREENS.ListSettings
>;

const ListSettingsScreen = () => {
  const theme = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, SCREENS.ListSettings>>();
  const navigation = useNavigation<ListSettingsScreenProp>();
  const userListId: string = route.params.userListId;
  const { currentUser } = useAuthContext();
  const { userLists, friendships, linkedUsers, listInvites } = useDataContext();

  const {
    inviteCollaboratorToList,
    removeCollaboratorFromList,
    cancelListInvite,
  } = useDataService();

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerTitle: () => <HeaderText title={'List Settings'} />,
    });
  }, [navigation]);

  const [list, setList] = useState<UserList | null>(null);
  const [showInviteCollaborators, setShowInviteCollaborators] =
    useState<boolean>(false);
  const [invitedCollaborators, setInvitedCollaborators] = useState<User[]>([]);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const isMyList: boolean = list?.owner === currentUser?.uid;

  useEffect(() => {
    const lists = userLists.filter(l => l.uid === userListId);
    lists.length > 0 ? setList(lists[0]) : setList(null);
  }, [userListId, userLists]);

  const handleInviteCollaborator = (user: User) => {
    inviteCollaboratorToList(user, list!);
  };
  const handleRemoveCollaboratorAction = (user: User) => {
    removeCollaboratorFromList(user, list!);
  };
  const handleCancelInviteAction = () => {
    const invites = listInvites.filter(invite => invite.listId === userListId);
    const invite = invites.length > 0 ? invites[0] : null;
    if (invite) {
      const friendId = invite.users.filter(u => u !== currentUser?.uid)[0];
      const invitedUser = invitedCollaborators.filter(
        u => u.uid === friendId,
      )[0];
      invite && cancelListInvite(invite, invitedUser);
    }
  };

  const onFriendActionTriggered = (action: FriendViewAction, user: User) => {
    switch (action) {
      case FriendViewAction.RemoveFriend:
        handleRemoveCollaboratorAction(user);
        break;
      case FriendViewAction.CancelInvite:
        handleCancelInviteAction();
        break;
      case FriendViewAction.AddFriend:
        handleInviteCollaborator(user);
        break;
      default:
        break;
    }
  };
  const onLeaveList = () => {
    currentUser &&
      removeCollaboratorFromList(currentUser, list!).then(() =>
        navigation.navigate(SCREENS.MyLists),
      );
  };

  const onInviteCollaborators = () => {
    setShowInviteCollaborators(true);
  };

  useEffect(() => {
    const collabs: string[] =
      list && currentUser ? list.users.filter(u => u !== currentUser.uid) : [];
    const invitees: string[] = [];
    const frens: string[] = [];

    listInvites.map(invite => {
      if (
        !!invite.inviter &&
        invite.listId === userListId &&
        invite.inviter === currentUser?.uid
      ) {
        const friendId = invite.users.filter(u => u !== currentUser.uid)[0];
        invitees.indexOf(friendId) < 0 && invitees.push(friendId);
      }
    });

    friendships.map(friendship => {
      friendship.areFriends &&
        invitees.indexOf(friendship.friendId) < 0 &&
        collabs.indexOf(friendship.friendId) &&
        frens.push(friendship.friendId);
    });

    setFriends(friendIdsToUsers(frens, linkedUsers));
    setCollaborators(friendIdsToUsers(collabs, linkedUsers));
    setInvitedCollaborators(friendIdsToUsers(invitees, linkedUsers));
  }, [currentUser, friendships, linkedUsers, list, listInvites, userListId]);

  return (
    <>
      <View style={styles.container}>
        {list && currentUser && (
          <ListOwnerView
            owner={
              isMyList
                ? currentUser
                : friendIdsToUsers([list.owner], linkedUsers)[0]
            }
          />
        )}
        <FriendsListView
          title={'List Members'}
          emptyText={"You don't have collaborators on this list"}
          usersByViewMode={[
            {
              mode: FriendViewMode.InvitedFriend,
              users: invitedCollaborators,
            },
            {
              mode: isMyList
                ? FriendViewMode.RemoveFriend
                : FriendViewMode.Friend,
              users: collaborators,
            },
          ]}
          onActionTriggered={onFriendActionTriggered}
        />
        {isMyList && (
          <Button
            style={styles.inviteCollaboratorsButton}
            icon={'account-group'}
            mode="contained"
            onPress={onInviteCollaborators}>
            Invite friends
          </Button>
        )}
        {!isMyList && (
          <Button
            style={styles.leaveButton}
            buttonColor={theme.colors.error}
            mode="contained"
            onPress={onLeaveList}>
            Leave list
          </Button>
        )}
      </View>
      {showInviteCollaborators && (
        <InviteCollaboratorsView
          friends={friends}
          onFriendActionTriggered={onFriendActionTriggered}
          onShowFriendsScreen={() => navigation.navigate(SCREENS.Friends)}
          onDismissed={() => setShowInviteCollaborators(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
  },
  inviteCollaboratorsButton: {
    alignSelf: 'center',
    marginTop: 20,
  },
  leaveButton: {
    width: 160,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 50,
  },
});

export default ListSettingsScreen;
