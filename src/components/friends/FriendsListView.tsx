import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MD3Theme, useTheme } from 'react-native-paper';
import FriendView, { FriendViewAction, FriendViewMode } from './FriendView';
import { User } from '../../services/dataTypes';
import EmptyListText from '../userLists/EmptyListText';
import ListTitleText from '../userLists/ListTitleText';

export type UsersByViewMode = {
  mode: FriendViewMode;
  users: User[];
};

type FriendsListViewProps = {
  title: string;
  usersByViewMode: UsersByViewMode[];
  emptyText: string;
  onActionTriggered: (action: FriendViewAction, user: User) => void;
};

const FriendsListView = ({
  title,
  usersByViewMode,
  emptyText,
  onActionTriggered,
}: FriendsListViewProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const renderItem = ({ item }: { item: User }) => {
    const viewMode = usersByViewMode.filter(
      uByVM => uByVM.users.filter(u => u.uid === item.uid).length > 0,
    )[0];

    return (
      <View>
        <FriendView
          user={item}
          mode={viewMode.mode}
          onActionTriggered={onActionTriggered}
        />
      </View>
    );
  };

  const mergedUsers = useMemo(
    () =>
      usersByViewMode.reduce((mergedArray, currentObject) => {
        return [...mergedArray, ...currentObject.users];
      }, [] as User[]),
    [usersByViewMode],
  );

  return (
    <View style={styles.invitedFriendsContainer}>
      <ListTitleText title={title} />
      <FlatList
        data={mergedUsers}
        renderItem={renderItem}
        keyExtractor={item => item.uid}
      />
      {mergedUsers.length === 0 && <EmptyListText text={emptyText} />}
    </View>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    invitedFriendsContainer: {
      paddingTop: 20,
    },
    hiddenContainer: {
      flex: 1,
      flexDirection: 'row',
      alignSelf: 'flex-end',
      justifyContent: 'center',
      alignItems: 'center',
    },
    hiddenDeleteButtonContainer: {
      height: '100%',
      justifyContent: 'center',
      backgroundColor: theme.colors.error,
    },
    hiddenApproveButtonContainer: {
      height: '100%',
      justifyContent: 'center',
      backgroundColor: 'green',
    },
  });

export default FriendsListView;
