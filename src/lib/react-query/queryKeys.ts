export enum QUERY_KEYS {
  CREATE_USER_ACCOUNT = "createUserAccount",

  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",
  GET_USERS_BY_ROLE = "getUsersByRole",
  CHECK_IF_USER_IS_ADMIN = "checkIfUserIsAdmin",

  GET_POSTS = "getPosts",
  GET_INFINITE_POSTS = "getInfinitePosts",
  GET_RECENT_POSTS = "getRecentPosts",
  GET_POST_BY_ID = "getPostById",
  GET_USER_POSTS = "getUserPosts",
  GET_FILE_PREVIEW = "getFilePreview",
  GET_POSTS_BY_TAG = "getPostsByTag",
  GET_POSTS_BY_ADVENTURES = "getPostsByAdventures",
  GET_FILTERED_POSTS_FOR_USER = "getFilteredPostsForUser",
  GET_POSTS_BY_TAG_FOR_USER = "getPostsByTagForUser",
  
  GET_PUBLIC_POSTS = "getPublicPosts",

  GET_ADVENTURES = "getAdventures",
  GET_ACTIVE_ADVENTURES = "getActiveAdventures",
  GET_ADVENTURE_BY_ID = "getAdventureById",
  GET_ADVENTURES_FOR_USER = "getAdventuresForUser",
  CREATE_ADVENTURE = "createAdventure",
  UPDATE_ADVENTURE = "updateAdventure",
  DELETE_ADVENTURE = "deleteAdventure",
  
  GET_PUBLIC_ADVENTURES = "getPublicAdventures",

  GET_ADVENTURE_PARTICIPANTS = "getAdventureParticipants",
  GET_USER_ADVENTURES = "getUserAdventures",
  IS_USER_PARTICIPANT = "isUserParticipant",
  ADD_PARTICIPANT = "addParticipant",
  REMOVE_PARTICIPANT = "removeParticipant",
  ADD_MULTIPLE_PARTICIPANTS = "addMultipleParticipants",

  GET_COMMENTS_BY_POST = "getCommentsByPost",
  GET_COMMENT_BY_ID = "getCommentById",
  GET_COMMENTS_COUNT = "getCommentsCount",

  SEARCH_POSTS = "getSearchPosts",

  GET_USERS_WITH_LAST_SEEN = "getUsersWithLastSeen",
  UPDATE_USER_LAST_SEEN = "updateUserLastSeen",
}

export const queryKeys = {
  posts: {
    all: [QUERY_KEYS.GET_POSTS] as const,
    recent: [QUERY_KEYS.GET_RECENT_POSTS] as const,
    public: [QUERY_KEYS.GET_PUBLIC_POSTS] as const,
    byId: (id: string) => [QUERY_KEYS.GET_POST_BY_ID, id] as const,
    byTag: (tag: string) => [QUERY_KEYS.GET_POSTS_BY_TAG, tag] as const,
    byAdventures: (adventureIds: string[]) => [QUERY_KEYS.GET_POSTS_BY_ADVENTURES, adventureIds] as const,
    filteredForUser: (userAdventureIds: string[], publicAdventureIds: string[], isAdmin: boolean) => 
      [QUERY_KEYS.GET_FILTERED_POSTS_FOR_USER, userAdventureIds, publicAdventureIds, isAdmin] as const,
    byTagForUser: (tag: string, userAdventureIds: string[], isAdmin: boolean) => 
      [QUERY_KEYS.GET_POSTS_BY_TAG_FOR_USER, tag, userAdventureIds, isAdmin] as const,
  },
  
  adventures: {
    all: [QUERY_KEYS.GET_ADVENTURES] as const,
    active: [QUERY_KEYS.GET_ACTIVE_ADVENTURES] as const,
    public: [QUERY_KEYS.GET_PUBLIC_ADVENTURES] as const,
    byId: (id: string) => [QUERY_KEYS.GET_ADVENTURE_BY_ID, id] as const,
    forUser: (userId: string, userRole: string) => [QUERY_KEYS.GET_ADVENTURES_FOR_USER, userId, userRole] as const,
    participants: (adventureId: string) => [QUERY_KEYS.GET_ADVENTURE_PARTICIPANTS, adventureId] as const,
  },
  
  users: {
    all: [QUERY_KEYS.GET_USERS] as const,
    current: [QUERY_KEYS.GET_CURRENT_USER] as const,
    byId: (id: string) => [QUERY_KEYS.GET_USER_BY_ID, id] as const,
    byRole: (role: string) => [QUERY_KEYS.GET_USERS_BY_ROLE, role] as const,
    adventures: (userId: string) => [QUERY_KEYS.GET_USER_ADVENTURES, userId] as const,
    isParticipant: (userId: string, adventureId: string) => 
      [QUERY_KEYS.IS_USER_PARTICIPANT, userId, adventureId] as const,
  },

  comments: {
    byPost: (postId: string) => [QUERY_KEYS.GET_COMMENTS_BY_POST, postId] as const,
    byId: (id: string) => [QUERY_KEYS.GET_COMMENT_BY_ID, id] as const,
    count: (postId: string) => [QUERY_KEYS.GET_COMMENTS_COUNT, postId] as const,
  }
} as const;

export type PostQueryKeys = typeof queryKeys.posts;
export type AdventureQueryKeys = typeof queryKeys.adventures;
export type UserQueryKeys = typeof queryKeys.users;
export type CommentQueryKeys = typeof queryKeys.comments;