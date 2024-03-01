import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthContext } from '../services/authentication/AuthContext';
import { ListTask, UserList } from '../services/dataTypes';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, SCREENS } from '../AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CreateItemView from '../components/CreateItemView';
import HeaderText from '../components/HeaderText';
import { showConfirmDialog } from '../utils/utils';
import FriendsButton from '../components/friends/FriendsButton';
import { useDataService } from '../services/data/useDataService';
import { useDataContext } from '../services/data/DataContext';
import UserListsView from '../components/userLists/UserListsView';
import { usePushNotificationToken } from '../services/notifications/usePushNotificationToken';
import UserAvatarButton from '../components/UserAvatarButton';

type HomeScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  SCREENS.MyLists
>;

const MyLists = () => {
  usePushNotificationToken();
  const navigation = useNavigation<HomeScreenProp>();
  const { currentUser } = useAuthContext();
  const { addUserList, updateUserList, deleteUserList } = useDataService();
  const { userLists, friendships, listInvites } = useDataContext();
  const [selectedList, setSelectedList] = useState<UserList | undefined>();
  const [pendingNotifications, setPendingNotifications] = useState<number>(0);
  const [listsPendingView, setListsPendingView] = useState<string[]>([]);
  const [sharedLists, setSharedLists] = useState<UserList[]>([]);
  const [myLists, setMyLists] = useState<UserList[]>([]);

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerTitle: () => <HeaderText title={'My Sharelists'} />,
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => (
        <FriendsButton
          notificationsCount={pendingNotifications}
          onPress={() => navigation.navigate(SCREENS.Friends)}
        />
      ),
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <UserAvatarButton
          user={currentUser}
          onPress={() =>
            navigation.navigate(SCREENS.Profile, { user: currentUser! })
          }
        />
      ),
    });
  }, [currentUser, navigation, pendingNotifications]);

  useEffect(() => {
    let invitesCount = 0;
    const pendingViewLists: string[] = [];
    listInvites.map(invite => {
      !!invite.inviter && invite.inviter !== currentUser?.uid && invitesCount++;
      !invite.inviter &&
        invite.pendingViewAccepted === currentUser?.uid &&
        pendingViewLists.push(invite.listId);
    });
    friendships.map(friendship => {
      !friendship.areFriends &&
        !!friendship.inviter &&
        friendship.inviter !== currentUser?.uid &&
        invitesCount++;

      friendship.areFriends &&
        friendship.pendingViewAccepted === currentUser?.uid &&
        invitesCount++;
    });

    const friendLists = userLists.filter(
      list => list.owner !== currentUser?.uid,
    );
    const ownedLists = userLists.filter(
      list => list.owner === currentUser?.uid,
    );
    setListsPendingView(pendingViewLists);
    setPendingNotifications(invitesCount);
    setSharedLists(friendLists);
    setMyLists(ownedLists);
  }, [currentUser?.uid, friendships, listInvites, userLists]);

  const handleAddItem = (name: string, description?: string, icon?: string) => {
    addUserList(name, description, icon);
  };
  const handleUpdateItem = (
    item: UserList | ListTask,
    name: string,
    description?: string,
    icon?: string,
  ) => {
    updateUserList(item as UserList, name, description, icon);
  };

  const handleDeleteList = (item: UserList) => {
    showConfirmDialog(
      `Are you sure you want to delete ${item.name}`,
      'Cancel',
      'Delete',
    )
      .then(() => deleteUserList(item))
      .catch(() => console.log('Canceled'));
  };

  return (
    <View style={styles.screen}>
      <UserListsView
        userLists={myLists}
        sharedLists={sharedLists}
        listsPendingView={listsPendingView}
        onListSelected={list =>
          navigation.navigate(SCREENS.ListDetails, { userListId: list.uid })
        }
        onEditListSelected={list => setSelectedList(list)}
        onDeleteListSelected={handleDeleteList}
      />
      <CreateItemView
        includeIconPicker
        addText="Add List"
        updateText="Update List"
        selectedItem={selectedList}
        onBottomSheetDismissed={() => setSelectedList(undefined)}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  sharedListsContainer: {
    marginTop: 60,
  },
});

export default MyLists;
