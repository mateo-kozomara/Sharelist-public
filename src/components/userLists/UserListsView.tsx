import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Divider,
  IconButton,
  MD3Theme,
  Text,
  useTheme,
} from 'react-native-paper';
import { SwipeListView } from 'react-native-swipe-list-view';
import { UserList } from '../../services/dataTypes';
import { COLORS } from '../../services/dataUtils';
import EmptyListText from './EmptyListText';
import ListTitleText from './ListTitleText';

type UserListsViewProps = {
  userLists: UserList[];
  sharedLists: UserList[];
  onListSelected: (list: UserList) => void;
  onEditListSelected: (list: UserList) => void;
  onDeleteListSelected: (list: UserList) => void;
  listsPendingView?: string[];
};

const UserListsView = ({
  userLists,
  sharedLists,
  onListSelected,
  onEditListSelected,
  onDeleteListSelected,
  listsPendingView,
}: UserListsViewProps) => {
  const theme: MD3Theme = useTheme();
  const styles = useStyles(theme);
  const listRef = useRef<SwipeListView<UserList | string>>(null);
  const emptyTexts = [
    "You don't have any owned lists",
    "You don't have any lists shared to you by other users",
  ];

  const data = [
    'My Lists',
    ...(userLists.length > 0 ? userLists : [emptyTexts[0]]),
    'Shared Lists',
    ...(sharedLists.length > 0 ? sharedLists : [emptyTexts[1]]),
  ];
  const stickyHeaders = data
    .filter(obj => typeof obj === 'string' && emptyTexts.indexOf(obj) < 0)
    .map(obj => data.indexOf(obj));

  const onDeleteItem = (item: UserList) => {
    listRef.current?.closeAllOpenRows();
    onDeleteListSelected(item);
  };
  const onEditItem = (item: UserList) => {
    listRef.current?.closeAllOpenRows();
    onEditListSelected(item);
  };

  const renderItem = ({ item }: { item: UserList | string }) => {
    return typeof item === 'string' ? (
      emptyTexts.indexOf(item) < 0 ? (
        <ListTitleText title={item as string} />
      ) : (
        <EmptyListText text={item} />
      )
    ) : (
      <>
        <Pressable onPress={() => onListSelected(item)} style={styles.item}>
          {item.icon && (
            <View style={styles.iconContainer}>
              <IconButton icon={item.icon} mode={'contained'} />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text variant={'titleSmall'}>{item.name}</Text>
            {item.description && item.description !== '' && (
              <Text style={styles.description} variant={'titleSmall'}>
                {item.description}
              </Text>
            )}
          </View>
          <View style={styles.numTasksContainer}>
            {listsPendingView && listsPendingView.indexOf(item.uid) >= 0 ? (
              <Text style={styles.newUsersJoinedText} variant={'titleSmall'}>
                New users!
              </Text>
            ) : (
              <Text style={styles.numTasksText} variant={'titleSmall'}>
                {item.tasks.length === 0
                  ? 'No tasks'
                  : `${item.tasks.filter(task => task.completed).length}/${
                      item.tasks.length
                    }`}
              </Text>
            )}
          </View>
        </Pressable>
        <Divider />
      </>
    );
  };

  const renderHiddenItem = ({ item }: { item: UserList | string }) => {
    return typeof item !== 'string' && userLists.indexOf(item) >= 0 ? (
      <View style={styles.hiddenContainer}>
        <View style={styles.hiddenDeleteButtonContainer}>
          <IconButton
            icon={'delete'}
            iconColor={'white'}
            onPress={() => onDeleteItem(item)}
          />
        </View>
        <View style={styles.hiddenEditButtonContainer}>
          <IconButton
            icon={'pencil'}
            iconColor={'white'}
            onPress={() => onEditItem(item)}
          />
        </View>
      </View>
    ) : null;
  };
  return (
    <SwipeListView
      ref={listRef}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={stickyHeaders}
      disableRightSwipe
      recalculateHiddenLayout
      data={data}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      keyExtractor={item => (typeof item === 'string' ? item : item.uid)}
      rightOpenValue={-100}
    />
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    contentContainer: {
      paddingBottom: 120,
      marginHorizontal: 16,
    },
    item: {
      minHeight: 60,
      flexDirection: 'row',
      backgroundColor: COLORS.GreyBackground,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
      margin: 5,
    },
    iconContainer: {
      justifyContent: 'center',
    },
    numTasksContainer: {
      width: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numTasksText: {
      textAlign: 'center',
      color: theme.colors.primary,
    },
    newUsersJoinedText: {
      textAlign: 'center',
      color: theme.colors.error,
    },
    description: {
      color: 'grey',
    },
    hiddenContainer: {
      flex: 1,
      flexDirection: 'row',
      width: '90%',
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: theme.colors.error,
    },
    hiddenDeleteButtonContainer: {
      height: '100%',
      justifyContent: 'center',
      width: 50,
      backgroundColor: theme.colors.error,
    },
    hiddenEditButtonContainer: {
      height: '100%',
      justifyContent: 'center',
      width: 50,
      backgroundColor: theme.colors.outlineVariant,
    },
  });

export default UserListsView;
