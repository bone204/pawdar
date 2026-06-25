// Centralized API endpoint definitions - all server routes in one place.
// Keep in sync with server route definitions.

export const API_ENDPOINTS = {
  auth: {
    signUp: "/auth/signup",
    verifyEmail: "/auth/verify-email",
    resendEmail: "/auth/resend-email",
    login: "/auth/login",
    refresh: "/auth/refresh",
  },
  breeds: "/breeds",
  pets: "/pets",
  posts: {
    base: "/posts",
    myPosts: "/posts/my-posts",
  },
  upload: {
    image: "/upload/image",
  },
  user: {
    profile: "/user/profile",
    friends: "/user/friends",
  },
  games: {
    sudokuStages: "/games/sudoku/stages",
    sudokuRecords: "/games/sudoku/records",
    sudokuLeaderboard: "/games/sudoku/leaderboard",
  },
} as const;
