import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../AppNavigator';
import { ListTask, UserList } from '../services/dataTypes';
import CreateItemView from '../components/CreateItemView';
import { IconButton } from 'react-native-paper';
import HeaderText from '../components/HeaderText';
import { showConfirmDialog } from '../utils/utils';
import { useDataContext } from '../services/data/DataContext';
import { useDataService } from '../services/data/useDataService';
import ListTasksView from '../components/userLists/ListTasksView';
import ActivityLogBanner from '../components/activityLog/ActivityLogBanner';

type ListDetailsScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  SCREENS.ListDetails
>;
const ListDetailsScreen = () => {
  const navigation = useNavigation<ListDetailsScreenProp>();
  const route = useRoute<RouteProp<RootStackParamList, SCREENS.ListDetails>>();
  const [selectedTask, setSelectedTask] = useState<ListTask | undefined>(
    undefined,
  );
  const { userLists, listInvites, setCurrentList } = useDataContext();
  const [list, setList] = useState<UserList | undefined>();
  const userListId: string = route.params.userListId;

  useEffect(() => {
    setCurrentList(list);
    return () => setCurrentList(undefined);
  }, [list, setCurrentList]);

  const {
    setTaskComplete,
    addTaskToList,
    updateTask,
    deleteTaskFromList,
    deleteListInvitePendingViews,
  } = useDataService();

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerTitle: () => <HeaderText title={list ? list.name : ''} />,
      headerTintColor: 'white',
      headerBackTitle: 'My Sharelists',
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <>
          <IconButton
            icon={'sine-wave'}
            iconColor={'white'}
            onPress={() =>
              list &&
              navigation.navigate(SCREENS.ListActivity, {
                userListId: list.uid,
              })
            }
          />
          <IconButton
            icon={'cog'}
            iconColor={'white'}
            onPress={() =>
              list &&
              navigation.navigate(SCREENS.ListSettings, {
                userListId: list.uid,
              })
            }
          />
        </>
      ),
    });
  }, [navigation, list]);

  useEffect(() => {
    deleteListInvitePendingViews(userListId, listInvites);
  }, [deleteListInvitePendingViews, listInvites, userListId]);

  useEffect(() => {
    const lists = userLists.filter(l => l.uid === userListId);
    lists.length > 0 ? setList(lists[0]) : setList(undefined);
  }, [userLists, userListId]);

  const handleAddItem = (name: string, description?: string) => {
    addTaskToList(list!, name, description);
  };
  const handleDeleteItem = (item: UserList | ListTask) => {
    showConfirmDialog(
      'Are you sure you want to delete this task?',
      'Cancel',
      'Delete',
    )
      .then(() => deleteTaskFromList(list!, item as ListTask))
      .catch(() => console.log('Cancel Pressed'));
  };
  const handleUpdateItem = (
    item: UserList | ListTask,
    name: string,
    description?: string,
  ) => {
    updateTask(list!, item as ListTask, name, description);
  };
  const onTaskCompleteToggle = (item: ListTask) => {
    list && setTaskComplete(list, item, !item.completed);
  };

  const onTaskSelected = (item: ListTask) => {
    setSelectedTask(item);
  };
  return (
    <View style={styles.screen}>
      {list && (
        <>
          <ListTasksView
            listTasks={list.tasks}
            onTaskSelected={onTaskSelected}
            onCompleteToggle={onTaskCompleteToggle}
          />
          <CreateItemView
            addText="Add task"
            updateText="Update task"
            selectedItem={selectedTask}
            onBottomSheetDismissed={() => setSelectedTask(undefined)}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        </>
      )}
      <ActivityLogBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});

export default ListDetailsScreen;
