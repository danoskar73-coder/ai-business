import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accountType?: "Founder" | "Partner" | "Employee" | "Mentor" | "Investor" | "Admin";
    };
  }

  interface User {
    accountType?: "Founder" | "Partner" | "Employee" | "Mentor" | "Investor" | "Admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountType?: "Founder" | "Partner" | "Employee" | "Mentor" | "Investor" | "Admin";
  }
}
