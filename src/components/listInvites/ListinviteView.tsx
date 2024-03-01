import React from 'react';
import { Divider, IconButton, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { User, ListInvite, UserList } from '../../services/dataTypes';
import { COLORS } from '../../services/dataUtils';
import UserView from '../UserView';

export type ListInviteViewData = {
  user: User;
  invites: { invite: ListInvite; list: UserList }[];
};

type ListInviteViewProps = {
  data: ListInviteViewData;
  onAccept: (invite: ListInvite, list: UserList) => void;
  onDecline: (invite: ListInvite, list: UserList) => void;
};

const ListInviteView = ({ data, onAccept, onDecline }: ListInviteViewProps) => {
  return (
    <View style={styles.container}>
      <UserView user={data.user} />
      {data.invites.map(invite => {
        return (
          <View key={invite.list.uid}>
            <View style={styles.item}>
              {invite.list.icon && (
                <View style={styles.iconContainer}>
                  <IconButton icon={invite.list.icon} mode={'contained'} />
                </View>
              )}
              <View style={styles.textContainer}>
                <Text numberOfLines={2} variant={'titleSmall'}>
                  {invite.list.name}
                </Text>
                {invite.list.description !== '' && (
                  <Text style={styles.description} variant={'titleSmall'}>
                    {invite.list.description}
                  </Text>
                )}
              </View>
              <View style={styles.buttonContainer}>
                <IconButton
                  mode={'contained'}
                  icon={'check-bold'}
                  onPress={() => onAccept(invite.invite, invite.list)}
                />
                <IconButton
                  mode={'contained'}
                  icon={'cancel'}
                  onPress={() => onDecline(invite.invite, invite.list)}
                />
              </View>
            </View>
            <Divider style={styles.divider} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GreyBackground,
  },
  item: {
    minHeight: 60,
    flexDirection: 'row',
    marginLeft: 40,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 5,
  },
  iconContainer: {
    justifyContent: 'center',
  },
  divider: {
    marginLeft: 40,
  },
  description: {
    color: 'grey',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ListInviteView;
