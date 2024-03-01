import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { User } from '../../services/dataTypes';
import { COLORS } from '../../services/dataUtils';
import { FriendViewAction, FriendViewMode } from '../friends/FriendView';
import FriendsListView from '../friends/FriendsListView';

type InviteCollaboratorsViewProps = {
  friends: User[];
  onFriendActionTriggered: (action: FriendViewAction, user: User) => void;
  onShowFriendsScreen: () => void;
  onDismissed: () => void;
};

const InviteCollaboratorsView = ({
  friends,
  onFriendActionTriggered,
  onShowFriendsScreen,
  onDismissed,
}: InviteCollaboratorsViewProps) => {
  const snapPoints = useMemo(() => ['60%'], []);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
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

  const onActionTriggered = (action: FriendViewAction, user: User) => {
    switch (action) {
      case FriendViewAction.AddFriend:
        onFriendActionTriggered(FriendViewAction.AddFriend, user);
        bottomSheetModalRef.current?.dismiss();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <BottomSheetModalProvider>
      <>
        <BottomSheetModal
          index={0}
          backgroundStyle={styles.bottomSheetBackground}
          snapPoints={snapPoints}
          onDismiss={onDismissed}
          backdropComponent={BackdropElement}
          ref={bottomSheetModalRef}>
          <View style={styles.contentContainer}>
            <FriendsListView
              title={'Friends'}
              emptyText={'Your friends will appear here'}
              usersByViewMode={[
                { mode: FriendViewMode.AddFriend, users: friends },
              ]}
              onActionTriggered={onActionTriggered}
            />
            <Button
              style={styles.addFriendsButton}
              icon={'account-group'}
              mode="contained"
              onPress={onShowFriendsScreen}>
              Find Friends
            </Button>
          </View>
        </BottomSheetModal>
      </>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    justifyContent: 'space-between',
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.GreyBackground,
  },
  item: {
    maxWidth: '100%',
  },
  addFriendsButton: {
    alignSelf: 'center',
    marginTop: 20,
  },
  signOutButton: {
    color: 'white',
    width: 150,
    alignSelf: 'center',
    bottom: 0,
  },
});

export default InviteCollaboratorsView;
