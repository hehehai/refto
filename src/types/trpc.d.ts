export type Role = "USER" | "ADMIN";

export interface TrpcMeta {
  requiredRoles?: Role[];
}
