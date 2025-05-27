import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { OIDCTokenPayload } from '@types'

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: OIDCTokenPayload }>()
    return request.user
  },
)
