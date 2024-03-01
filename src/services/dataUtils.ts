import {
  ActivityLog,
  ActivityLogAction,
  Friendship,
  ListTask,
  User,
  UserList,
} from './dataTypes';

export const sortTasks = (tasks: ListTask[]): ListTask[] => {
  return [...tasks].sort((a, b) => a.createdAt - b.createdAt);
};

export const sortLists = (lists: UserList[]): UserList[] => {
  lists.map(list => {
    list.tasks = sortTasks(list.tasks);
  });
  return [...lists].sort((a, b) => a.createdAt - b.createdAt);
};

export const sortActivityLogs = (
  activityLogs: ActivityLog[],
): ActivityLog[] => {
  return [...activityLogs].sort((a, b) => a.timestamp - b.timestamp);
};

export const getLogActionText = (log: ActivityLog): string => {
  switch (log.action) {
    case ActivityLogAction.CreatedList:
      return 'Created list';
    case ActivityLogAction.UpdatedList:
      return 'Updated list';
    case ActivityLogAction.AddedTask:
      return 'Added Task';
    case ActivityLogAction.UpdatedTask:
      return 'Updated Task';
    case ActivityLogAction.CompletedTask:
      return 'Completed Task';
    case ActivityLogAction.UncompletedTask:
      return 'Uncompleted Task';
    case ActivityLogAction.RemovedTask:
      return 'Deleted Task';
    case ActivityLogAction.InvitedCollaborator:
      return 'Invited collaborator';
    case ActivityLogAction.CollaboratorLeft:
      return 'Collaborator left';
    case ActivityLogAction.RemovedCollaborator:
      return 'Removed collaborator';
    case ActivityLogAction.CancelCollaboratorInvite:
      return 'Cancel invite';
    case ActivityLogAction.CollaboratorDeclined:
      return 'Invite declined';
    case ActivityLogAction.CollaboratorAccepted:
      return 'Collaborator joined';
    default:
      return 'Unknown log';
  }
};

export const getDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
};

export const enum COLORS {
  Green = '#1abc9c',
  DarkGreen = '#16a085',
  Orange = '#f39c12',
  Yellow = '#f1c40f',
  Red = '#e74c3c',
  DarkRed = '#c0392b',
  Blue = '#3498db',
  Black = '#000',
  GreyBackground = '#f1f2f2',
}

export const getActivityActionColor = (action: ActivityLogAction): string => {
  switch (action) {
    case ActivityLogAction.CreatedList:
      return COLORS.DarkGreen;
    case ActivityLogAction.UpdatedList:
      return COLORS.Orange;
    case ActivityLogAction.AddedTask:
      return COLORS.Green;
    case ActivityLogAction.UpdatedTask:
      return COLORS.Yellow;
    case ActivityLogAction.CompletedTask:
      return COLORS.Green;
    case ActivityLogAction.UncompletedTask:
      return COLORS.Red;
    case ActivityLogAction.RemovedTask:
      return COLORS.Red;
    case ActivityLogAction.InvitedCollaborator:
      return COLORS.Blue;
    case ActivityLogAction.CollaboratorLeft:
      return COLORS.Blue;
    case ActivityLogAction.RemovedCollaborator:
      return COLORS.DarkRed;
    case ActivityLogAction.CancelCollaboratorInvite:
      return COLORS.DarkRed;
    case ActivityLogAction.CollaboratorDeclined:
      return COLORS.DarkRed;
    case ActivityLogAction.CollaboratorAccepted:
      return COLORS.Blue;
    default:
      return COLORS.Black;
  }
};

export const getFriendshipId = (
  userId: string,
  friendships: Friendship[],
): string | null => {
  const filteredFrendships = friendships.filter(
    friendship => friendship.friendId === userId,
  );
  return !!filteredFrendships && filteredFrendships.length > 0
    ? filteredFrendships[0].uid
    : null;
};

export const friendIdsToUsers = (
  userIds: string[],
  linkedUsers: User[],
): User[] => {
  const result: User[] = [];
  userIds.map(userId => {
    const filteredUsers = linkedUsers.filter(user => user.uid === userId);
    filteredUsers.length > 0 && result.push(filteredUsers[0]);
  });
  return result;
};

export const listIdsToLists = (
  listIds: string[],
  lists: UserList[],
): UserList[] => {
  const result: UserList[] = [];
  listIds.map(listId => {
    const filteredList = lists.filter(list => list.uid === listId);
    filteredList.length > 0 && result.push(filteredList[0]);
  });
  return result;
};

export const validateEmail = (email?: string): boolean => {
  if (!email) {
    return false;
  }
  const reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w\w+)+$/;
  return reg.test(email);
};

export const sanitizeFirebaseError = (error: string): string => {
  return error.replace(/\[([^\]]+)\]/, '');
};
