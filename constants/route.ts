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
    home: "/home",
    dashboard: "/dashboard",
    campus: "/campus",
    user: "/user/management",
  },
  STUDENT: {
    home: "/home",
    document: "/document",
    request: "/request",
    announcement: "/announcement",
  },
  SD_STAFF: {
    home: "/home",
    request_period: "/request-period",
    request: "/request",
    announcement: "/announcement",
  },
  DEPARTMENT_HEAD: {
    home: "/home",
    request: "/request",
  }
};

export const getName = (key: string) => {
    const names: Record<string, string> = {
      home: "หน้าแรก",
      request_period: "จัดการช่วงเวลารับสมัคร",
      request: "รายการคำร้อง",
      announcement: "ประกาศ",
      dashboard: "Dashboard",
      profile: "Profile",
      user: "User Management",
      campus: "จัดการวิทยาเขต",
    };
    return names[key] || key;
  };  