// route.ts

import { profile } from "console";

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
    home: "/home",
    dashboard: "/dashboard",
    campus: "/campus",
    user: "/user/management",
  },
  STUDENT: {
    home: "/home",
    document: "/document",
    track_status: "/track-status",
    honor_roll: "/honor-roll",
//    announcement: "/announcement",
  },
  SD_STAFF: {
    home: "/home",
    request_period: "/request-period",
    request: "/request",
    announcement: "/announcement",
    honor_roll: "/honor-roll",
  },
  DEPARTMENT_HEAD: {
    home: "/home",
    request: "/request",
    honor_roll: "/honor-roll",
  },
  VICE_DEAN: {
    home: "/home",
    request: "/request",
    honor_roll: "/honor-roll",
  },
  DEAN: {
    home: "/home",
    request: "/request",
    honor_roll: "/honor-roll",
  },
  COMMITTEE: {
    home: "/request",
    request_period: "/request-period",
    honor_roll: "/honor-roll",
  },
  COMMITTEE_HEAD: {
    home: "/request",
    request_period: "/request-period",
    honor_roll: "/honor-roll",
  },
  PRESIDENT: {
    home: "/request",
    request_period: "/request-period",
    honor_roll: "/honor-roll",
  }
};

export const DEFAULT_ROUTES = {
  ADMIN: "/dashboard",
  STUDENT: "/document",
  SD_STAFF: "/request-period",
  DEPARTMENT_HEAD: "/request",
  VICE_DEAN: "/request",
  DEAN: "/request",
  COMMITTEE: "/request",
  COMMITTEE_HEAD: "/request",
  PRESIDENT: "/request",
};

export const getName = (key: string) => {
    const names: Record<string, string> = {
      home: "หน้าแรก",
      document: "เอกสาร",
      request_period: "จัดการช่วงเวลารับสมัคร",
      request: "รายการใบสมัคร",
      announcement: "ประกาศ",
      dashboard: "Dashboard",
      profile: "Profile",
      user: "User Management",
      campus: "จัดการวิทยาเขต",
      track_status: "ติดตามสถานะ",
      honor_roll: "ทำเนียบนิสิตดีเด่น",
    };
    return names[key] || key;
  };  