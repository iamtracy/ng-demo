import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { User as KeycloakUser } from '@types'
import { UserService } from './user.service'

@Injectable()
export class UserSyncInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserSyncInterceptor.name)

  constructor(private readonly userService: UserService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const user: KeycloakUser = request.user

    if (user?.sub) {
      this.syncUserAsync(user)
    }

    return next.handle()
  }

  private async syncUserAsync(keycloakUser: KeycloakUser): Promise<void> {
    try {
      await this.userService.syncUserFromKeycloak(keycloakUser)
    } catch (error) {
      this.logger.error(`Failed to sync user ${keycloakUser.preferred_username}:`, error)
    }
  }
} 