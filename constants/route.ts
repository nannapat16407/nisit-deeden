// route.ts

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  DOCUMENT: "/document",
  REWARD: "/reward",
};

export const ROUTES_BY_ROLE = {
  ADMIN: {
    dashboard: "/dashboard",
    campus: "/campus",
    user: "/user/management",
  },
  STUDENT: {
    profile: "/profile",
    document: "/document",
    track_status: "/document/track-status",
  },
  SD_STAFF: {
    request_period: "/request-period",
    request: "/request",
    announcement: "/announcement",
    reward: "/reward",
  },
};
