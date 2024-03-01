import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type HeaderTextProps = {
  title: string;
};

const HeaderText = ({ title }: HeaderTextProps) => {
  return (
    <Text numberOfLines={1} style={styles.headerTitle} variant="titleMedium">
      {title}
    </Text>
  );
};
const styles = StyleSheet.create({
  headerTitle: {
    color: 'white',
    maxWidth: 130,
  },
});
export default HeaderText;
