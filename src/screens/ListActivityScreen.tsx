import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { RootStackParamList, SCREENS } from '../AppNavigator';
import HeaderText from '../components/HeaderText';
import ActivityLogScroller from '../components/activityLog/ActivityLogScroller';
import { ActivityLogViewProps } from '../components/activityLog/ActivityLogView';
import { useDataContext } from '../services/data/DataContext';
import { useDataService } from '../services/data/useDataService';

type ListActivityScreenProps = NativeStackNavigationProp<
  RootStackParamList,
  SCREENS.ListActivity
>;

const ListActivityScreen = () => {
  const navigation = useNavigation<ListActivityScreenProps>();
  const [listData, setListData] = useState<ActivityLogViewProps[]>([]);
  const { listActivityLog, userLists, linkedLists } = useDataContext();
  const { getUsersData } = useDataService();

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerTitle: () => <HeaderText title={'List Activity'} />,
    });
  }, [navigation]);

  useEffect(() => {
    const result: ActivityLogViewProps[] = [];
    const userIds = listActivityLog.map(log => log.user);
    const uniqueUserIds = Array.from(new Set(userIds));
    getUsersData(uniqueUserIds, true).then(users => {
      listActivityLog.map(log => {
        const filteredUsers = users.filter(user => user.uid === log.user);
        filteredUsers.length > 0 &&
          result.push({
            activityLog: log,
            user: filteredUsers[0],
          });
      });
      setListData(result);
    });
  }, [getUsersData, linkedLists, listActivityLog, userLists]);

  return (
    <View>
      <ActivityLogScroller data={listData} />
    </View>
  );
};

export default ListActivityScreen;
