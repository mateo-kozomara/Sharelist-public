import React, { memo, useRef, useState } from 'react';
import { Divider, Text } from 'react-native-paper';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityLog, User } from '../../services/dataTypes';
import UserView from '../UserView';
import { getDateTime, getLogActionText } from '../../services/dataUtils';
import ActivityActionText from './ActivityActionText';
import ActivityLogText from './ActivityLogText';
import ActivityLogValueText from './ActivityLogValueText';

export type ActivityLogViewProps = {
  activityLog: ActivityLog;
  user: User;
};

const ActivityLogView = memo(({ activityLog, user }: ActivityLogViewProps) => {
  const logActionText = getLogActionText(activityLog);
  const actionComponentRef = useRef<View>(null);
  const [toggleShowDetails, setToggleShowDetails] = useState<boolean>(false);
  const actionDataValues = activityLog.actionData
    ? JSON.parse(activityLog.actionData)
    : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <UserView user={user} size="small" />
        <Text variant="bodySmall">{getDateTime(activityLog.timestamp)}</Text>
      </View>
      <TouchableOpacity
        style={styles.actionContainer}
        disabled={!actionDataValues}
        onPress={() => setToggleShowDetails(prev => !prev)}>
        <ActivityActionText
          ref={actionComponentRef}
          action={activityLog.action}>
          {logActionText}
        </ActivityActionText>
        <ActivityLogText>{activityLog.subject}</ActivityLogText>
      </TouchableOpacity>
      {toggleShowDetails && (
        <ActivityLogValueText
          data={actionDataValues}
          masterComponent={actionComponentRef?.current as View}
        />
      )}
      <Divider />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
  },
  topContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionContainer: {
    flex: 1,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ActivityLogView;
