export enum QUERY_KEYS {
  // AUTH KEYS
  CREATE_USER_ACCOUNT = "createUserAccount",

  // USER KEYS
  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",
  GET_USERS_BY_ROLE = "getUsersByRole",
  CHECK_IF_USER_IS_ADMIN = "checkIfUserIsAdmin",

  // POST KEYS
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

  // ADVENTURE KEYS
  GET_ADVENTURES = "getAdventures",
  GET_ACTIVE_ADVENTURES = "getActiveAdventures",
  GET_ADVENTURE_BY_ID = "getAdventureById",
  GET_ADVENTURES_FOR_USER = "getAdventuresForUser",
  CREATE_ADVENTURE = "createAdventure",
  UPDATE_ADVENTURE = "updateAdventure",
  DELETE_ADVENTURE = "deleteAdventure",

  // ADVENTURE PARTICIPANT KEYS
  GET_ADVENTURE_PARTICIPANTS = "getAdventureParticipants",
  GET_USER_ADVENTURES = "getUserAdventures",
  IS_USER_PARTICIPANT = "isUserParticipant",
  ADD_PARTICIPANT = "addParticipant",
  REMOVE_PARTICIPANT = "removeParticipant",
  ADD_MULTIPLE_PARTICIPANTS = "addMultipleParticipants",

  //  SEARCH KEYS
  SEARCH_POSTS = "getSearchPosts",
}