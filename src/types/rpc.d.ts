export type Role = "USER" | "ADMIN";

export interface RpcMeta {
  requiredRoles?: Role[];
}
