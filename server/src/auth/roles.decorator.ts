import { SetMetadata } from '@nestjs/common'

export const ROLES_KEY = 'roles'
export const RequiredRoles = (...roles: string[]): MethodDecorator =>
  SetMetadata(ROLES_KEY, roles)
