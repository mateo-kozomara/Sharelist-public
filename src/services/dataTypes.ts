export type UserList = {
  uid: string;
  name: string;
  createdAt: number;
  owner: string;
  users: string[];
  tasks: ListTask[];
  description?: string;
  icon?: string;
};

export type ListTask = {
  uid: string;
  name: string;
  createdAt: number;
  completed: boolean;
  owner: string;
  description?: string;
  icon?: string;
};

export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  pushToken?: string;
};

export type Friendship = {
  uid: string;
  areFriends: boolean;
  users: string[];
  friendId: string;
  inviter?: string;
  pendingViewAccepted?: string;
};

export type ListInvite = {
  uid: string;
  listId: string;
  users: string[];
  inviter?: string;
  pendingViewAccepted?: string;
};

export type ActivityLog = {
  uid: string;
  listId: string;
  action: ActivityLogAction;
  subject: string;
  actionData: string;
  user: string;
  timestamp: number;
};

export enum ActivityLogAction {
  CreatedList = 'createdList',
  UpdatedList = 'updatedList',
  AddedTask = 'addedTask',
  UpdatedTask = 'updatedTask',
  CompletedTask = 'completedTask',
  UncompletedTask = 'uncompletedTask',
  RemovedTask = 'removedTask',
  InvitedCollaborator = 'invitedCollaborator',
  CollaboratorLeft = 'collaboratorLeft',
  RemovedCollaborator = 'removedCollaborator',
  CancelCollaboratorInvite = 'cancelCollaboratorInvite',
  CollaboratorDeclined = 'collaboratorDeclined',
  CollaboratorAccepted = 'collaboratorAccepted',
}

export const REMOVED_VALUE: string = '(removed)';
