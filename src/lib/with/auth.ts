"use server";

import { getSession, type Session } from "@/lib/session";
import { getSearchParams } from "@/lib/utils";
import type { Role } from "@/types/rpc";

export async function isAdmin() {
  const session = await getSession();
  if (!session?.user) return false;
  if (session.user.role !== "ADMIN") return false;

  return true;
}

type WithWrapperHandler = ({
  req,
  params,
  searchParams,
  session,
}: {
  req: Request;
  params: Record<string, string>;
  searchParams: Record<string, string>;
  session: Session | null;
}) => Promise<Response>;

export const withAuthWrapper =
  async (
    handler: WithWrapperHandler,
    {
      requiredRole = ["USER", "ADMIN"],
      allowAnonymous, // special case for /api/links (POST /api/links) – allow no session
    }: {
      requiredRole?: Role[];
      allowAnonymous?: boolean;
    } = {}
  ) =>
  async (
    req: Request,
    { params }: { params: Record<string, string> | undefined }
  ) => {
    const searchParams = getSearchParams(req.url);

    const session = await getSession();

    if (!allowAnonymous) {
      if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
      }

      if (requiredRole?.length) {
        // 角色验证
        const userRole = (session.user.role as Role) || "USER";
        if (!requiredRole.includes(userRole)) {
          return new Response("Unauthorized", { status: 401 });
        }
      }

      if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    return handler({
      req,
      params: params ?? {},
      searchParams,
      session,
    });
  };

export const withSessionWrapper =
  async (handler: WithWrapperHandler) =>
  async (
    req: Request,
    { params }: { params: Record<string, string> | undefined }
  ) => {
    const searchParams = getSearchParams(req.url);

    const session = await getSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    return handler({
      req,
      params: params ?? {},
      searchParams,
      session,
    });
  };
