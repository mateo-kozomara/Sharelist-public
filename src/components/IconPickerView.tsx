import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { IconButton, MD3Theme, Text, useTheme } from 'react-native-paper';
import { moderateScale } from 'react-native-size-matters';

const data = [
  'store',
  'check-bold',
  'folder',
  'folder-image',
  'bacteria-outline',
  'doctor',
  'heart',
  'minus-circle',
  'pill',
];

type IconPickerViewProps = {
  onIconSelected: (icon?: string) => void;
  selectedIcon?: string;
};

const IconPickerView = ({
  onIconSelected,
  selectedIcon,
}: IconPickerViewProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    selectedIcon,
  );

  const renderItem = ({ item }: { item: string }) => {
    return (
      <View style={styles.item}>
        <IconButton
          icon={item}
          selected={selectedItem === item}
          mode={'contained'}
          onPress={() => {
            const result = selectedItem === item ? undefined : item;
            setSelectedItem(result);
            onIconSelected(result);
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} variant="titleSmall">
        Icon
      </Text>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item}
      />
    </View>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      width: moderateScale(320, 0.3),
      marginTop: 20,
    },
    contentContainer: {},
    item: {},
    title: {
      color: theme.colors.primary,
    },
  });
export default IconPickerView;
