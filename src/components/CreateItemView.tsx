import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, IconButton, TextInput, useTheme } from 'react-native-paper';
import { moderateScale, scale } from 'react-native-size-matters';
import { ListTask, UserList } from '../services/dataTypes';
import IconPickerView from './IconPickerView';

type CreateItemViewProps = {
  selectedItem: ListTask | UserList | undefined;
  addText: string;
  updateText: string;
  includeIconPicker?: boolean;
  onUpdateItem: (
    item: ListTask | UserList,
    name: string,
    description?: string,
    icon?: string,
  ) => void;
  onAddItem: (name: string, description?: string, icon?: string) => void;
  onDeleteItem?: (item: ListTask | UserList) => void;
  onBottomSheetDismissed: () => void;
};

const CreateItemView = ({
  selectedItem,
  addText,
  updateText,
  includeIconPicker,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onBottomSheetDismissed,
}: CreateItemViewProps) => {
  const theme = useTheme();
  const [itemName, setItemName] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string | undefined>(
    undefined,
  );
  const [itemIcon, setItemIcon] = useState<string | undefined>(undefined);
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ['90%'], []);

  const handleSubmit = (): void => {
    itemName !== '' &&
      (selectedItem
        ? onUpdateItem(selectedItem, itemName, itemDescription, itemIcon)
        : onAddItem(itemName, itemDescription, itemIcon));

    dismiss();
  };
  const handleDelete = (): void => {
    selectedItem && onDeleteItem && onDeleteItem(selectedItem);
    dismiss();
  };

  const dismiss = () => {
    Platform.OS === 'android'
      ? setTimeout(() => bottomSheetModalRef.current?.dismiss(), 150)
      : bottomSheetModalRef.current?.dismiss();
  };
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    setItemName(selectedItem ? selectedItem.name : '');
    setItemDescription(selectedItem ? selectedItem.description : '');
    setItemIcon(selectedItem ? selectedItem.icon : '');
    bottomSheetModalRef.current?.present();
  }, [selectedItem]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleIconSelected = (icon?: string): void => {
    setItemIcon(icon);
  };

  useEffect(() => {
    selectedItem && handlePresentModalPress();
  }, [handlePresentModalPress, selectedItem]);

  const BackdropElement = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        opacity={0.7}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <IconButton
          style={styles.addButton}
          icon={'plus'}
          mode={'contained'}
          onPress={handlePresentModalPress}
        />
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          animateOnMount
          onDismiss={onBottomSheetDismissed}
          backdropComponent={BackdropElement}
          onChange={handleSheetChanges}>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}>
            <View style={styles.contentContainer}>
              <TextInput
                style={styles.input}
                autoFocus={true}
                value={itemName}
                onChangeText={newName => setItemName(newName)}
                onSubmitEditing={handleSubmit}
                label="Name"
              />
              <TextInput
                style={styles.descriptionInput}
                multiline={true}
                defaultValue={itemDescription}
                onChangeText={newDescription =>
                  setItemDescription(newDescription)
                }
                label="Description (optional)"
              />
              {includeIconPicker && (
                <IconPickerView
                  onIconSelected={handleIconSelected}
                  selectedIcon={selectedItem ? selectedItem.icon : undefined}
                />
              )}
              <View style={styles.buttonContainer}>
                <Button
                  disabled={itemName === ''}
                  mode="outlined"
                  onPress={handleSubmit}>
                  {selectedItem ? updateText : addText}
                </Button>
                {onDeleteItem && selectedItem && (
                  <IconButton
                    iconColor={theme.colors.error}
                    mode="outlined"
                    icon={'delete'}
                    onPress={handleDelete}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: scale(10),
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  addButton: {
    width: 65,
    height: 65,
  },
  input: {
    width: moderateScale(320, 0.3),
  },
  descriptionInput: {
    width: moderateScale(320, 0.3),
    height: 100,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scale(20),
    width: moderateScale(320, 0.3),
  },
});

export default CreateItemView;
