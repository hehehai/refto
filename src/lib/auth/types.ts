import type { auth } from "./config";

export type Session = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.Session.user & {
    role?: string;
  };
};

export type User = Session["user"];
