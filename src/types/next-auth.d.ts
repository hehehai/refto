import { type User as DBUser } from "@prisma/client";

type UserId = DBUser["id"];

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    role: DBUser["role"];
  }
}

declare module "next-auth" {
  interface User extends DefaultUser {
    id: UserId;
    role: DBUser["role"];
  }

  interface Session {
    user: User;
  }
}
