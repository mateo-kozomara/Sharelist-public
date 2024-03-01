import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ListInviteView, { ListInviteViewData } from './ListinviteView';
import { ListInvite, UserList } from '../../services/dataTypes';
import ListTitleText from '../userLists/ListTitleText';

type ListInvitesScrollerProps = {
  title: string;
  listData: ListInviteViewData[];
  onAccept: (invite: ListInvite, list: UserList) => void;
  onDecline: (invite: ListInvite, list: UserList) => void;
};
const ListInvitesScroller = ({
  title,
  listData,
  onAccept,
  onDecline,
}: ListInvitesScrollerProps) => {
  const renderItem = ({ item }: { item: ListInviteViewData }) => {
    return (
      <View style={styles.itemContainer}>
        <ListInviteView data={item} onAccept={onAccept} onDecline={onDecline} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ListTitleText title={title} />
      <FlatList
        style={styles.list}
        data={listData}
        renderItem={renderItem}
        keyExtractor={item => item.user.uid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  itemContainer: {
    flex: 1,
  },
  list: {
    paddingTop: 10,
  },
});

export default ListInvitesScroller;
