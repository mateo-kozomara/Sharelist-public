import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, IconButton, Text } from 'react-native-paper';
import { ListTask } from '../../services/dataTypes';

type ListTasksViewProps = {
  listTasks: ListTask[];
  onTaskSelected: (task: ListTask) => void;
  onCompleteToggle: (task: ListTask) => void;
};

const ListTasksView = ({
  listTasks,
  onTaskSelected,
  onCompleteToggle,
}: ListTasksViewProps) => {
  const renderItem = ({ item }: { item: ListTask }) => {
    return (
      <>
        <View style={styles.item}>
          <IconButton
            icon={item.completed ? 'radiobox-marked' : 'radiobox-blank'}
            mode={'contained'}
            onPress={() => onCompleteToggle(item)}
          />
          <TouchableOpacity
            style={styles.touchContainer}
            onPress={() => onTaskSelected(item)}>
            <Text
              style={item.completed && styles.textComplete}
              variant={'titleSmall'}>
              {item.name}
            </Text>
            {item.description !== '' && (
              <Text
                style={{
                  ...styles.description,
                  ...(item.completed && styles.textComplete),
                }}
                variant={'titleSmall'}>
                {item.description}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <Divider style={styles.divider} />
      </>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={listTasks}
        renderItem={renderItem}
        keyExtractor={item => item.uid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchContainer: {
    flex: 1,
    minHeight: 50,
    marginVertical: 5,
    justifyContent: 'center',
  },
  contentContainer: {
    marginTop: 10,
    paddingBottom: 120,
  },
  item: {
    minHeight: 60,
    flexDirection: 'row',
    marginHorizontal: 16,
    alignItems: 'center',
  },
  divider: {
    marginHorizontal: 16,
  },
  textComplete: {
    textDecorationLine: 'line-through',
  },
  description: {
    color: 'grey',
  },
});

export default ListTasksView;
