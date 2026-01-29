// route.ts

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  DOCUMENT: '/document',
};

export const ROUTES_BY_ROLE = {
  ADMIN: { dashboard: '/dashboard', profile: '/profile', document: '/document' },
  STUDENT: { profile: '/profile', document: '/document', track_status: '/document/track-status' },
  TEACHER: { dashboard: '/dashboard', profile: '/profile', document: '/document', grade_submissions: '/grade-submissions' },

}