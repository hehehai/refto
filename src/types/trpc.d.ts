import type { Role } from '@prisma/client'

export interface TrpcMeta {
  requiredRoles?: Role[]
}
