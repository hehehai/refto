import { type User as DBUser } from "@prisma/client";
import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

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
