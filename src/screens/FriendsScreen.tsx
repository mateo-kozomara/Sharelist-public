import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useAuthContext } from '../services/authentication/AuthContext';
import { ListInvite, User, UserList } from '../services/dataTypes';
import { useNavigation } from '@react-navigation/native';
import HeaderText from '../components/HeaderText';
import EmptyListText from '../components/userLists/EmptyListText';
import { showConfirmDialog } from '../utils/utils';
import ListInvitesScroller from '../components/listInvites/ListInvitesScroller';
import { useDataContext } from '../services/data/DataContext';
import {
  friendIdsToUsers,
  getFriendshipId,
  listIdsToLists,
} from '../services/dataUtils';
import { useDataService } from '../services/data/useDataService';
import { ListInviteViewData } from '../components/listInvites/ListinviteView';
import FriendView, {
  FriendViewAction,
  FriendViewMode,
} from '../components/friends/FriendView';
import FriendsListView from '../components/friends/FriendsListView';

const FriendsScreen = () => {
  const { currentUser } = useAuthContext();
  const { userLists, friendships, linkedUsers, listInvites, linkedLists } =
    useDataContext();
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResult, setSearchResult] = useState<User | string | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<User[]>([]);
  const [friendInvites, setFriendInvites] = useState<User[]>([]);
  const [inviteViewData, setInviteViewData] = useState<ListInviteViewData[]>(
    [],
  );
  const navigation = useNavigation();

  const {
    searchForUserByEmail,
    sendFriendRequest,
    deleteFriendRequest,
    acceptFriendRequest,
    removeFriend,
    acceptListInvite,
    declineListInvite,
    deleteFriendshipPendingViews,
  } = useDataService();

  useEffect(() => {
    deleteFriendshipPendingViews(friendships);
  }, [deleteFriendshipPendingViews, friendships]);

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerTitle: () => <HeaderText title={'Friends'} />,
    });
  }, [navigation]);

  useEffect(() => {
    const friendIds = friendships
      .filter(friendship => friendship.areFriends)
      .map(friendship => friendship.friendId);

    const invitedFriendIds = friendships
      .filter(
        friendship =>
          !friendship.areFriends &&
          !!friendship.inviter &&
          friendship.inviter === currentUser?.uid,
      )
      .map(friendship => friendship.friendId);

    const invitesFriendIds = friendships
      .filter(
        friendship =>
          !friendship.areFriends &&
          !!friendship.inviter &&
          friendship.inviter !== currentUser?.uid,
      )
      .map(friendship => friendship.friendId);

    const myInvites: ListInviteViewData[] = [];
    const filteredInvites: ListInvite[] = listInvites.filter(
      invite => !!invite.inviter && invite.inviter !== currentUser?.uid,
    );
    const listInvitesByUser: { [userId: string]: ListInvite[] } = {};
    filteredInvites.map(invite => {
      if (!listInvitesByUser[invite.inviter!]) {
        listInvitesByUser[invite.inviter!] = [];
      }
      listInvitesByUser[invite.inviter!].push(invite);
    });

    Object.keys(listInvitesByUser).map(userId => {
      const viewData: ListInviteViewData = {
        user: friendIdsToUsers([userId], linkedUsers)[0],
        invites: [],
      };
      const invites = listInvitesByUser[userId];
      invites.map(invite => {
        const lists = listIdsToLists(
          [invite.listId],
          [...userLists, ...linkedLists],
        );
        lists.length > 0 &&
          viewData.invites.push({
            invite: invite,
            list: lists[0],
          });
      });
      viewData.invites.length > 0 && myInvites.push(viewData);
    });

    setInviteViewData(myInvites);
    setFriends(friendIdsToUsers(friendIds, linkedUsers));
    setInvitedFriends(friendIdsToUsers(invitedFriendIds, linkedUsers));
    setFriendInvites(friendIdsToUsers(invitesFriendIds, linkedUsers));
  }, [
    currentUser?.uid,
    friendships,
    linkedLists,
    linkedUsers,
    listInvites,
    userLists,
  ]);

  const onSearch = () => {
    searchForUserByEmail(searchInput).then(user => {
      const existingFriend = friendships.filter(
        friendship => user?.uid === friendship.friendId,
      );
      !existingFriend.length && user
        ? setSearchResult(user)
        : setSearchResult('No users found');
    });
  };

  const handleAddFriendAction = (user: User) => {
    sendFriendRequest(user.uid).then(() => {
      setSearchResult(null);
      setSearchInput('');
    });
  };

  const handleCancelInviteAction = (user: User) => {
    showConfirmDialog('Are you sure you want to delete this friend request?')
      .then(() => {
        const friendshipId = getFriendshipId(user.uid, friendships);
        friendshipId && deleteFriendRequest(friendshipId);
      })
      .catch(() => console.log('cancel'));
  };

  const handleAcceptFriendRequestAction = (user: User) => {
    const friendshipId = getFriendshipId(user.uid, friendships);
    friendshipId && acceptFriendRequest(friendshipId, user.uid);
  };

  const handleDeclineFriendRequestAction = (user: User) => {
    showConfirmDialog(
      'Are you sure you want to decline this friend request?',
      'Cancel',
      'Decline',
    )
      .then(() => {
        const friendshipId = getFriendshipId(user.uid, friendships);
        friendshipId && deleteFriendRequest(friendshipId);
      })
      .catch(() => console.log('cancel'));
  };

  const handleRemoveFriendAction = (user: User) => {
    showConfirmDialog(
      'Are you sure you want to remove this friend?',
      'Cancel',
      'Remove',
    )
      .then(() => {
        const friendshipId = getFriendshipId(user.uid, friendships);
        friendshipId &&
          removeFriend(friendshipId, userLists, friendships, listInvites);
      })
      .catch(() => console.log('cancel'));
  };

  const handleAcceptInvite = (invite: ListInvite, list: UserList) => {
    acceptListInvite(invite, list);
  };
  const handleDeclineInvite = (invite: ListInvite, list: UserList) => {
    declineListInvite(invite, list);
  };

  const onFriendActionTriggered = (action: FriendViewAction, user: User) => {
    switch (action) {
      case FriendViewAction.AddFriend:
        handleAddFriendAction(user);
        break;
      case FriendViewAction.RemoveFriend:
        handleRemoveFriendAction(user);
        break;
      case FriendViewAction.CancelInvite:
        handleCancelInviteAction(user);
        break;
      case FriendViewAction.AcceptFriendRequest:
        handleAcceptFriendRequestAction(user);
        break;
      case FriendViewAction.DeclineFriendRequest:
        handleDeclineFriendRequestAction(user);
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Searchbar
          style={styles.searchBar}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Find friends by email"
          onChangeText={setSearchInput}
          onSubmitEditing={onSearch}
          onClearIconPress={() => setSearchResult(null)}
          value={searchInput}
        />
      </View>
      {searchResult &&
        (typeof searchResult === 'string' ? (
          <EmptyListText text={searchResult} />
        ) : (
          <FriendView
            mode={FriendViewMode.AddFriend}
            user={searchResult as User}
            onActionTriggered={onFriendActionTriggered}
          />
        ))}
      {inviteViewData.length > 0 && (
        <ListInvitesScroller
          title={'List Invites'}
          listData={inviteViewData}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
        />
      )}
      {friendInvites.length > 0 && (
        <FriendsListView
          title={'Friend Requests'}
          emptyText={"You don't have any friend requests"}
          usersByViewMode={[
            { mode: FriendViewMode.FriendRequest, users: friendInvites },
          ]}
          onActionTriggered={onFriendActionTriggered}
        />
      )}
      <FriendsListView
        title={'Friends'}
        emptyText={'Your friends will appear here'}
        usersByViewMode={[
          { mode: FriendViewMode.InvitedFriend, users: invitedFriends },
          { mode: FriendViewMode.RemoveFriend, users: friends },
        ]}
        onActionTriggered={onFriendActionTriggered}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  searchBar: {
    flex: 1,
  },
});

export default FriendsScreen;
