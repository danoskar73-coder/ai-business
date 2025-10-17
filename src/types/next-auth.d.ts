import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      accountType?: "Founder" | "Partner" | "Employee" | "Mentor" | "Investor" | "Admin";
    };
  }
  interface User extends DefaultUser {
    accountType?: "Founder" | "Partner" | "Employee" | "Mentor" | "Investor" | "Admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountType?: "Founder" | "Partner" | "Employee" | "Mentor" | "Investor" | "Admin";
  }
}
