import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { OIDCTokenPayload } from '@types'
import { Observable } from 'rxjs'

import { UserService } from './user.service'

@Injectable()
export class UserSyncInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserSyncInterceptor.name)

  constructor(private readonly userService: UserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context
      .switchToHttp()
      .getRequest<{ user: OIDCTokenPayload }>()
    const user: OIDCTokenPayload = request.user

    if (user.sub) {
      await this.syncUserAsync(user)
    }

    return next.handle()
  }

  private async syncUserAsync(keycloakUser: OIDCTokenPayload): Promise<void> {
    try {
      await this.userService.syncUserFromKeycloak(keycloakUser)
    } catch (error) {
      this.logger.error(
        `Failed to sync user ${keycloakUser.preferred_username ?? ''}:`,
        error,
      )
    }
  }
}
