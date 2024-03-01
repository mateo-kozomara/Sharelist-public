import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityLog,
  Friendship,
  ListInvite,
  User,
  UserList,
} from '../dataTypes';
import { useAuthContext } from '../authentication/AuthContext';
import { sortActivityLogs, sortLists } from '../dataUtils';
import database from '@react-native-firebase/database';
import { useDataService } from './useDataService';

type DataContextProps = {
  userLists: UserList[];
  listInvites: ListInvite[];
  linkedLists: UserList[];
  friendships: Friendship[];
  linkedUsers: User[];
  listActivityLog: ActivityLog[];
  setCurrentList: (list?: UserList) => void;
};

const DataContext = createContext<DataContextProps>({
  userLists: [],
  listInvites: [],
  linkedLists: [],
  friendships: [],
  linkedUsers: [],
  listActivityLog: [],
  setCurrentList: () => {},
});

export const DataServiceProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuthContext();
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [listInvites, setListInvites] = useState<ListInvite[]>([]);
  const [linkedLists, setLinkedLists] = useState<UserList[]>([]); // lists linked through listInvites
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [linkedUsers, setLinkedUsers] = useState<User[]>([]); // users linked through friendships, they might not be friends yet
  const [listActivityLog, setListActivityLog] = useState<ActivityLog[]>([]);
  const [currentList, setCurrentList] = useState<UserList>();
  const { getListsData, getUsersData } = useDataService();

  useEffect(() => {
    if (!currentList) {
      setListActivityLog([]);
      return;
    }
    const onValueChange = database()
      .ref('/listActivityLog')
      .orderByChild('listId')
      .equalTo(currentList.uid)
      .on('value', snapshot => {
        const result: ActivityLog[] = [];
        const values = snapshot.val();
        if (values) {
          Object.keys(values).map(key => {
            result.push({
              uid: key,
              user: values[key].user,
              listId: values[key].listId,
              action: values[key].action,
              subject: values[key].subject,
              timestamp: values[key].timestamp,
              actionData: values[key].actionData,
            });
          });
        }
        setListActivityLog(sortActivityLogs(result));
      });

    // Stop listening for updates when no longer required
    return () => database().ref('/listActivityLog').off('value', onValueChange);
  }, [currentList]);

  useEffect(() => {
    const onValueChange = database()
      .ref('/userLists')
      .orderByChild(`users/${currentUser?.uid}`)
      .equalTo(true)
      .on('value', snapshot => {
        const result: UserList[] = [];
        const values = snapshot.val();
        if (values) {
          Object.keys(values).map(key => {
            result.push({
              uid: key,
              name: values[key].name,
              owner: values[key].owner,
              description: values[key].description,
              createdAt: values[key].createdAt,
              icon: values[key].icon,
              users: Object.keys(values[key].users),
              tasks: values[key].tasks
                ? Object.keys(values[key].tasks).map(taskKey => {
                    return {
                      name: values[key].tasks[taskKey].name,
                      description: values[key].tasks[taskKey].description,
                      createdAt: values[key].tasks[taskKey].createdAt,
                      uid: taskKey,
                      completed: values[key].tasks[taskKey].completed,
                      icon: values[key].tasks[taskKey].icon,
                      owner: values[key].tasks[taskKey].owner,
                    };
                  })
                : [],
            });
          });
        }
        setUserLists(sortLists(result));
      });

    // Stop listening for updates when no longer required
    return () => database().ref('/userLists').off('value', onValueChange);
  }, [currentUser?.uid]);

  useEffect(() => {
    const onValueChange = database()
      .ref('/listInvites')
      .orderByChild(`users/${currentUser?.uid}`)
      .equalTo(true)
      .on('value', snapshot => {
        const result: ListInvite[] = [];
        const values = snapshot.val();
        if (values) {
          Object.keys(values).map(inviteId => {
            const inviteData = values[inviteId];
            result.push({
              uid: inviteId,
              inviter: inviteData.inviter,
              listId: inviteData.listId,
              pendingViewAccepted: inviteData.pendingViewAccepted,
              users: Object.keys(inviteData.users),
            });
          });
          const listIds = result
            .filter(
              invite => !!invite.inviter && invite.inviter !== currentUser?.uid,
            )
            .map(invite => invite.listId);
          getListsData(listIds).then(lists => {
            setLinkedLists(lists);
            setListInvites(result);
          });
        } else {
          setLinkedLists([]);
          setListInvites([]);
        }
      });

    // Stop listening for updates when no longer required
    return () => database().ref('/listInvites').off('value', onValueChange);
  }, [currentUser?.uid, getListsData]);

  useEffect(() => {
    const onValueChange = database()
      .ref('/friendships')
      .orderByChild(`users/${currentUser?.uid}`)
      .equalTo(true)
      .on('value', snapshot => {
        const result: Friendship[] = [];
        const values = snapshot.val();
        if (values) {
          Object.keys(values).map(friendshipId => {
            const friendshipData = values[friendshipId];
            result.push({
              uid: friendshipId,
              areFriends: friendshipData.areFriends,
              inviter: friendshipData.inviter,
              pendingViewAccepted: friendshipData.pendingViewAccepted,
              users: Object.keys(friendshipData.users),
              friendId: Object.keys(friendshipData.users).filter(
                uid => uid !== currentUser?.uid,
              )[0],
            });
          });
          const friendIds = result.map(friendship => friendship.friendId);
          getUsersData(friendIds).then(users => setLinkedUsers(users));
          setFriendships(result);
        } else {
          setFriendships([]);
        }
      });

    // Stop listening for updates when no longer required
    return () => database().ref('/friendships').off('value', onValueChange);
  }, [currentUser?.uid, getUsersData]);

  const value = useMemo(
    () => ({
      userLists,
      listInvites,
      linkedLists,
      friendships,
      linkedUsers,
      listActivityLog,
      setCurrentList,
    }),
    [
      userLists,
      listInvites,
      linkedLists,
      friendships,
      linkedUsers,
      listActivityLog,
      setCurrentList,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
  return useContext(DataContext);
};
