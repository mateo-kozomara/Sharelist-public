import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ActivityLogView, { ActivityLogViewProps } from './ActivityLogView';

type ActivityLogScrollerProps = {
  data: ActivityLogViewProps[];
};
const ActivityLogScroller = ({ data }: ActivityLogScrollerProps) => {
  const renderItem = ({ item }: { item: ActivityLogViewProps }) => {
    return (
      <View style={styles.itemContainer}>
        <ActivityLogView activityLog={item.activityLog} user={item.user} />
      </View>
    );
  };

  return (
    <View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={[...data].reverse()}
        renderItem={renderItem}
        keyExtractor={item => item.activityLog.uid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 100,
    marginHorizontal: 20,
  },
});

export default ActivityLogScroller;
