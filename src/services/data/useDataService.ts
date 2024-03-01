import {
  ActivityLogAction,
  Friendship,
  ListInvite,
  ListTask,
  REMOVED_VALUE,
  User,
  UserList,
} from '../dataTypes';
import database from '@react-native-firebase/database';
import { sortLists } from '../dataUtils';
import { useAuthContext } from '../authentication/AuthContext';
import { useCallback } from 'react';
import { sendPushNotification } from '../notifications/notificationUtils';
import storage from '@react-native-firebase/storage';

export const useDataService = () => {
  const { currentUser } = useAuthContext();

  const logActivity = useCallback(
    (
      listId: string,
      action: ActivityLogAction,
      subject: string,
      actionData?: string,
    ): Promise<void> => {
      const ref = database().ref('/listActivityLog').push();
      return ref.set({
        listId: listId,
        action: action,
        subject: subject,
        user: currentUser?.uid,
        timestamp: Date.now(),
        actionData: actionData,
      });
    },
    [currentUser?.uid],
  );

  const getListsData = useCallback((listIds: string[]): Promise<UserList[]> => {
    return new Promise((resolve, reject) => {
      const result: UserList[] = [];
      const allRequests = listIds.map(listId => {
        return database()
          .ref(`/userLists/${listId}`)
          .once('value', listSnapshot => {
            const listData = listSnapshot.val();
            if (listData) {
              result.push({
                uid: listId,
                name: listData.name,
                owner: listData.owner,
                description: listData.description,
                createdAt: listData.createdAt,
                icon: listData.icon,
                users: Object.keys(listData.users),
                tasks: listData.tasks
                  ? Object.keys(listData.tasks).map(taskKey => {
                      return {
                        name: listData.tasks[taskKey].name,
                        description: listData.tasks[taskKey].description,
                        createdAt: listData.tasks[taskKey].createdAt,
                        uid: taskKey,
                        completed: listData.tasks[taskKey].completed,
                        icon: listData.tasks[taskKey].icon,
                        owner: listData.tasks[taskKey].owner,
                      };
                    })
                  : [],
              });
            }
          })
          .catch(reject);
      });
      Promise.all(allRequests)
        .then(() => {
          resolve(sortLists(result));
        })
        .catch(reject);
    });
  }, []);

  const getUsersData = useCallback(
    (users: string[], includeCurrentUser: boolean = false): Promise<User[]> => {
      return new Promise((resolve, reject) => {
        const result: User[] = [];
        const userIds = includeCurrentUser
          ? users
          : users.filter(listUserId => listUserId !== currentUser?.uid);
        const allRequests = userIds.map(userId => {
          return database()
            .ref(`/users/${userId}`)
            .once('value', userSnapshot => {
              const userData = userSnapshot.val();
              userData &&
                result.push({
                  uid: userId,
                  email: userData.email,
                  displayName: userData.displayName,
                  photoUrl: userData.photoUrl,
                  pushToken: userData.pushToken,
                });
            });
        });
        allRequests &&
          Promise.all(allRequests)
            .then(() => {
              resolve(result);
            })
            .catch(reject);
      });
    },
    [currentUser?.uid],
  );

  const changeDisplayName = useCallback(
    (displayName: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        database()
          .ref('/users')
          .orderByChild('displayName')
          .equalTo(displayName)
          .once('value', snapshot => {
            const userData = snapshot.val();
            if (!userData || Object.keys(userData)[0] === currentUser?.uid) {
              // continue changing displayName
              database()
                .ref(`/users/${currentUser?.uid}/displayName`)
                .set(displayName)
                .then(resolve)
                .catch(reject);
            } else {
              reject(Error('Username is already taken'));
            }
          });
      });
    },
    [currentUser?.uid],
  );

  const setUserPicture = useCallback(
    (filePath: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const reference = storage().ref(
          `userPictures/${currentUser?.uid}/profilePicture.png`,
        );
        reference
          .putFile(filePath, { cacheControl: 'public, max-age=31536000' })
          .then(() => {
            return reference.getDownloadURL();
          })
          .then(url => {
            return database()
              .ref(`/users/${currentUser?.uid}/photoUrl`)
              .set(url);
          })
          .then(() => resolve())
          .catch(reject);
      });
    },
    [currentUser?.uid],
  );

  const updateUserPushNotificationToken = useCallback(
    (token?: string): Promise<void> => {
      return token
        ? database().ref(`/users/${currentUser?.uid}/pushToken`).set(token)
        : database().ref(`/users/${currentUser?.uid}/pushToken`).remove();
    },
    [currentUser?.uid],
  );

  const notifyUsers = useCallback(
    (userIds: string[], title: string, body: string): void => {
      getUsersData(userIds).then(users => {
        users.map(user => {
          user.pushToken && sendPushNotification(user.pushToken, title, body);
        });
      });
    },
    [getUsersData],
  );

  const addUserList = useCallback(
    (name: string, description?: string, icon?: string): Promise<void> => {
      const logActionData: any = {
        name: name,
      };
      if (description) {
        logActionData.description = description;
      }
      if (icon) {
        logActionData.icon = icon;
      }
      const ref = database().ref('/userLists').push();
      return ref
        .set({
          name: name,
          description: description,
          createdAt: Date.now(),
          owner: currentUser?.uid as string,
          icon: icon,
          users: { [currentUser?.uid as string]: true },
        })
        .then(() =>
          logActivity(
            ref.key as string,
            ActivityLogAction.CreatedList,
            name,
            JSON.stringify(logActionData),
          ),
        );
    },
    [currentUser?.uid, logActivity],
  );

  const updateUserList = useCallback(
    (
      list: UserList,
      name: string,
      description?: string,
      icon?: string,
    ): Promise<void> => {
      const changedData: any = {};
      if (list.name !== name) {
        changedData.name = name;
      }
      if (list.description !== description) {
        changedData.description = description ? description : REMOVED_VALUE;
      }
      if (list.icon !== icon) {
        changedData.icon = icon ? icon : REMOVED_VALUE;
      }
      return database()
        .ref(`/userLists/${list.uid}`)
        .update({
          name: name,
          description: description ? description : null,
          icon: icon ? icon : null,
        })
        .then(() => {
          if (Object.keys(changedData).length > 0) {
            logActivity(
              list.uid,
              ActivityLogAction.UpdatedList,
              list.name,
              JSON.stringify(changedData),
            );
            notifyUsers(
              list.users.filter(uid => uid !== currentUser?.uid),
              'List updated',
              `${currentUser?.email} updated the '${list.name}' list'`,
            );
          }
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const deleteUserList = useCallback(
    (list: UserList): Promise<void> => {
      return database()
        .ref(`/userLists/${list.uid}`)
        .remove()
        .then(() => {
          return database()
            .ref('/listActivityLog/')
            .orderByChild('listId')
            .equalTo(list.uid)
            .once('value');
        })
        .then(activityLogSnapshot => {
          return activityLogSnapshot && activityLogSnapshot.ref
            ? activityLogSnapshot.ref.remove()
            : Promise.resolve();
        })
        .then(() => {
          notifyUsers(
            list.users.filter(uid => uid !== currentUser?.uid),
            'List deleted',
            `${currentUser?.email} deleted the '${list.name}' list'`,
          );
        });
    },
    [currentUser?.email, currentUser?.uid, notifyUsers],
  );

  const addTaskToList = useCallback(
    (list: UserList, name: string, description?: string): Promise<void> => {
      const logActionData: any = {
        name: name,
      };
      if (description) {
        logActionData.description = description;
      }
      const ref = database().ref(`/userLists/${list.uid}/tasks`).push();
      return ref
        .set({
          name: name,
          description: description,
          owner: currentUser?.uid,
          createdAt: Date.now(),
          completed: false,
        })
        .then(() => {
          logActivity(
            list.uid,
            ActivityLogAction.AddedTask,
            name,
            JSON.stringify(logActionData),
          );
          notifyUsers(
            list.users.filter(uid => uid !== currentUser?.uid),
            'New task added',
            `${currentUser?.email} added '${name}' task to list '${list.name}'`,
          );
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const updateTask = useCallback(
    (
      list: UserList,
      task: ListTask,
      name: string,
      description?: string,
    ): Promise<void> => {
      const changedData: any = {};
      if (task.name !== name) {
        changedData.name = name;
      }
      if (task.description !== description) {
        changedData.description = description ? description : REMOVED_VALUE;
      }
      return database()
        .ref(`/userLists/${list.uid}/tasks/${task.uid}`)
        .update({
          name: name,
          description: description ? description : null,
        })
        .then(() => {
          if (Object.keys(changedData).length > 0) {
            logActivity(
              list.uid,
              ActivityLogAction.UpdatedTask,
              task.name,
              JSON.stringify(changedData),
            );
            notifyUsers(
              list.users.filter(uid => uid !== currentUser?.uid),
              'Task updated',
              `${currentUser?.email} updated the task '${task.name}'`,
            );
          }
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const setTaskComplete = useCallback(
    (list: UserList, task: ListTask, isComplete: boolean): Promise<void> => {
      return database()
        .ref(`/userLists/${list.uid}/tasks/${task.uid}`)
        .update({
          completed: isComplete,
        })
        .then(() => {
          logActivity(
            list.uid,
            isComplete
              ? ActivityLogAction.CompletedTask
              : ActivityLogAction.UncompletedTask,
            task.name,
          );
          notifyUsers(
            list.users.filter(uid => uid !== currentUser?.uid),
            isComplete ? 'Task done!' : 'Task undone',
            `${currentUser?.email} updated the task '${task.name}'`,
          );
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const deleteTaskFromList = useCallback(
    (list: UserList, task: ListTask): Promise<void> => {
      return database()
        .ref(`/userLists/${list.uid}/tasks/${task.uid}`)
        .remove()
        .then(() => {
          logActivity(
            list.uid,
            ActivityLogAction.RemovedTask,
            task.name,
            JSON.stringify({ task: task.name }),
          );
          notifyUsers(
            list.users.filter(uid => uid !== currentUser?.uid),
            'Task deleted',
            `${currentUser?.email} deleted the task '${task.name}'`,
          );
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const sendFriendRequest = useCallback(
    (userId: string): Promise<void> => {
      const ref = database().ref('/friendships').push();
      return ref
        .set({
          users: { [currentUser?.uid as string]: true, [userId]: true },
          inviter: currentUser?.uid,
          areFriends: false,
        })
        .then(() => {
          notifyUsers(
            [userId],
            'New friend request!',
            `${currentUser?.email} sent you a friend request!`,
          );
        });
    },
    [currentUser, notifyUsers],
  );

  const acceptFriendRequest = useCallback(
    (friendshipId: string, userId: string): Promise<void> => {
      return database()
        .ref(`/friendships/${friendshipId}`)
        .update({
          areFriends: true,
          pendingViewAccepted: userId,
          inviter: null,
        })
        .then(() => {
          notifyUsers(
            [userId],
            'Accepted your friend request!',
            `${currentUser?.email} accepted friend request!`,
          );
        });
    },
    [currentUser, notifyUsers],
  );

  const deleteFriendRequest = useCallback(
    (friendshipId: string): Promise<void> => {
      return database().ref(`/friendships/${friendshipId}`).remove();
    },
    [],
  );

  const inviteCollaboratorToList = useCallback(
    (user: User, list: UserList): Promise<void> => {
      const ref = database().ref('/listInvites').push();
      return ref
        .set({
          users: { [currentUser?.uid as string]: true, [user.uid]: true },
          inviter: currentUser?.uid,
          listId: list.uid,
        })
        .then(() => {
          logActivity(
            list.uid,
            ActivityLogAction.InvitedCollaborator,
            user.email,
          );
          notifyUsers(
            [user.uid],
            'You have been invited!',
            `${currentUser?.email} is inviting you to joing the '${list.name}' list`,
          );
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const removeCollaboratorFromList = useCallback(
    (user: User, list: UserList): Promise<void> => {
      const isCurrentUser = user.uid === currentUser?.uid;
      return database()
        .ref(`/userLists/${list.uid}/users/${user.uid}`)
        .remove()
        .then(() => {
          logActivity(
            list.uid,
            isCurrentUser
              ? ActivityLogAction.CollaboratorLeft
              : ActivityLogAction.RemovedCollaborator,
            user.email,
          );
          notifyUsers(
            [user.uid],
            'Removed from list',
            `${currentUser?.email} removed you from the '${list.name}' list`,
          );
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const acceptListInvite = useCallback(
    (invite: ListInvite, list: UserList): Promise<void> => {
      return database()
        .ref(`/userLists/${invite.listId}/users/${currentUser?.uid}`)
        .set(true)
        .then(() => {
          return database().ref(`/listInvites/${invite.uid}`).update({
            inviter: null,
            pendingViewAccepted: list.owner,
          });
        })
        .then(() => {
          logActivity(
            invite.listId,
            ActivityLogAction.CollaboratorAccepted,
            currentUser?.email as string,
          );
          notifyUsers(
            [list.owner],
            'New list member!',
            `${currentUser?.email} accepted your invite to join the '${list.name}' list`,
          );
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const declineListInvite = useCallback(
    (invite: ListInvite, list: UserList): Promise<void> => {
      return database()
        .ref(`/listInvites/${invite.uid}`)
        .remove()
        .then(() => {
          logActivity(
            invite.listId,
            ActivityLogAction.CollaboratorDeclined,
            currentUser?.email as string,
          );
          notifyUsers(
            [list.owner],
            'List invite declined',
            `${currentUser?.email} declined your invite to join the '${list.name}' list`,
          );
        });
    },
    [currentUser, logActivity, notifyUsers],
  );

  const cancelListInvite = useCallback(
    (invite: ListInvite, invitedUser: User): Promise<void> => {
      return database()
        .ref(`/listInvites/${invite.uid}`)
        .remove()
        .then(() =>
          logActivity(
            invite.listId,
            ActivityLogAction.CancelCollaboratorInvite,
            invitedUser.email,
          ),
        );
    },
    [logActivity],
  );

  const searchForUserByEmail = useCallback(
    (email: string): Promise<User | null> => {
      return new Promise((resolve, reject) => {
        database()
          .ref('/users')
          .orderByChild('email')
          .equalTo(email.toLowerCase())
          .once('value', snapshot => {
            const userData = snapshot.val();
            userData
              ? Object.keys(userData).map(uid => {
                  resolve(
                    userData[uid].email !== currentUser?.email
                      ? {
                          uid: uid,
                          email: userData[uid].email,
                          displayName: userData[uid].displayName,
                          photoUrl: userData[uid].photoUrl,
                          pushToken: userData[uid].pushToken,
                        }
                      : null,
                  );
                })
              : resolve(null);
          })
          .catch(reject);
      });
    },
    [currentUser?.email],
  );

  const deleteFriendshipPendingViews = useCallback(
    (friendships: Friendship[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        const pendingViews = friendships.filter(
          friendship =>
            friendship.areFriends &&
            friendship.pendingViewAccepted === currentUser?.uid,
        );
        const promises = pendingViews.map(friendship => {
          return database()
            .ref(`/friendships/${friendship.uid}/pendingViewAccepted`)
            .remove();
        });

        Promise.all(promises)
          .then(() => resolve())
          .catch(reject);
      });
    },
    [currentUser?.uid],
  );

  const removeFriend = useCallback(
    (
      friendshipId: string,
      userLists: UserList[],
      friendships: Friendship[],
      listInvites: ListInvite[],
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const friendId = friendships.filter(f => f.uid === friendshipId)[0]
          .friendId;
        const invites = listInvites.filter(
          li => li.users.indexOf(friendId) >= 0,
        );
        const sharedLists = userLists.filter(l => l.owner === friendId);
        database()
          .ref(`/friendships/${friendshipId}`)
          .remove()
          .then(() => {
            // delete list invites where users contain friendId
            const promises = invites.map(invite => {
              return database().ref(`/listInvites/${invite.uid}`).remove();
            });

            return Promise.all(promises);
          })
          .then(() => {
            // delete user from shared lists
            const promises = sharedLists.map(list => {
              return database()
                .ref(`/userLists/${list.uid}/users/${currentUser?.uid}`)
                .remove();
            });

            return Promise.all(promises);
          })
          .then(() => resolve())
          .catch(reject);
      });
    },
    [currentUser?.uid],
  );

  const deleteListInvitePendingViews = useCallback(
    (listId: string, listInvites: ListInvite[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        const pendingInvites = listInvites.filter(
          invite =>
            invite.listId === listId &&
            invite.pendingViewAccepted === currentUser?.uid,
        );
        const promises = pendingInvites.map(invite => {
          return database().ref(`/listInvites/${invite.uid}`).remove();
        });

        Promise.all(promises)
          .then(() => resolve())
          .catch(reject);
      });
    },
    [currentUser?.uid],
  );

  return {
    getListsData,
    getUsersData,
    updateUserPushNotificationToken,
    addUserList,
    updateUserList,
    deleteUserList,
    addTaskToList,
    updateTask,
    setTaskComplete,
    deleteTaskFromList,
    sendFriendRequest,
    acceptFriendRequest,
    deleteFriendRequest,
    inviteCollaboratorToList,
    removeCollaboratorFromList,
    acceptListInvite,
    declineListInvite,
    cancelListInvite,
    searchForUserByEmail,
    deleteFriendshipPendingViews,
    removeFriend,
    deleteListInvitePendingViews,
    changeDisplayName,
    setUserPicture,
  };
};
