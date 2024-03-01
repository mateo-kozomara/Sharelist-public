import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import UserAvatar from '../UserAvatar';
import { ActivityLog, User } from '../../services/dataTypes';
import { getLogActionText } from '../../services/dataUtils';
import { useDataContext } from '../../services/data/DataContext';
import { useDataService } from '../../services/data/useDataService';
import { useAuthContext } from '../../services/authentication/AuthContext';

const ActivityLogBanner = () => {
  const { listActivityLog } = useDataContext();
  const { currentUser } = useAuthContext();
  const { getUsersData } = useDataService();
  const [viewTimestamp] = useState<number>(Date.now);
  const [data, setData] = useState<{ log: ActivityLog; user: User }>();

  const styles = useStyles();

  const yOffsetAnimation = useRef<Animated.Value>(
    new Animated.Value(0),
  ).current;

  const animateShow = useCallback(() => {
    Animated.timing(yOffsetAnimation, {
      toValue: 80,
      duration: 500,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  }, [yOffsetAnimation]);

  const animateHide = useCallback(() => {
    Animated.timing(yOffsetAnimation, {
      toValue: 0,
      duration: 500,
      easing: Easing.in(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  }, [yOffsetAnimation]);

  useEffect(() => {
    if (data) {
      animateShow();
      setTimeout(() => {
        animateHide();
      }, 2000);
    }
  }, [animateHide, animateShow, data]);

  useEffect(() => {
    const lastLog =
      listActivityLog.length > 0
        ? listActivityLog[listActivityLog.length - 1]
        : undefined;
    if (
      lastLog &&
      lastLog.timestamp > viewTimestamp &&
      lastLog.user !== currentUser?.uid
    ) {
      getUsersData([lastLog.user]).then(users => {
        if (users.length > 0) {
          setData({ log: lastLog, user: users[0] });
        }
      });
    }
  }, [currentUser?.uid, getUsersData, listActivityLog, viewTimestamp]);

  return data ? (
    <Animated.View
      style={{
        ...styles.container,
        transform: [{ translateY: yOffsetAnimation }],
      }}>
      <TouchableOpacity
        style={styles.touchContainer}
        onPress={() => animateHide()}>
        <View style={styles.avatarContainer}>
          <UserAvatar user={data.user} size={'regular'} />
        </View>
        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            style={styles.actionText}
            variant="bodyMedium">
            {getLogActionText(data.log)}
          </Text>
          <Text numberOfLines={1} style={styles.text} variant="bodyMedium">
            {data.log.subject}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  ) : null;
};

const useStyles = () =>
  StyleSheet.create({
    container: {
      flexShrink: 1,
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      position: 'absolute',
      borderRadius: 25,
      alignItems: 'center',
      alignSelf: 'center',
      top: -70,
      padding: 10,
      marginHorizontal: 20,
    },
    touchContainer: {
      flexDirection: 'row',
    },
    avatarContainer: {
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    actionText: {
      fontWeight: 'bold',
      color: 'white',
    },
    text: {
      flexShrink: 1,
      flexWrap: 'wrap',
      color: 'white',
    },
  });
export default ActivityLogBanner;
