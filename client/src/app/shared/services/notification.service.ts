import { Injectable, inject } from '@angular/core'
import { NzNotificationService } from 'ng-zorro-antd/notification'

export interface NotificationOptions {
  title?: string
  duration?: number
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
}

const DEFAULT_DURATION = 4000
const DEFAULT_PLACEMENT = 'bottomLeft'

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly nzNotification = inject(NzNotificationService)

  success(message: string, options?: NotificationOptions): void {
    this.nzNotification.success(
      options?.title ?? 'Success',
      message,
      {
        nzDuration: options?.duration ?? DEFAULT_DURATION,
        nzPlacement: options?.placement ?? DEFAULT_PLACEMENT
      }
    )
  }

  error(message: string, options?: NotificationOptions): void {
    this.nzNotification.error(
      options?.title ?? 'Error',
      message,
      {
        nzDuration: options?.duration ?? DEFAULT_DURATION,
        nzPlacement: options?.placement ?? DEFAULT_PLACEMENT
      }
    )
  }

  warning(message: string, options?: NotificationOptions): void {
    this.nzNotification.warning(
      options?.title ?? 'Warning',
      message,
      {
        nzDuration: options?.duration ?? DEFAULT_DURATION,
        nzPlacement: options?.placement ?? DEFAULT_PLACEMENT
      }
    )
  }

  info(message: string, options?: NotificationOptions): void {
    this.nzNotification.info(
      options?.title ?? 'Info',
      message,
      {
        nzDuration: options?.duration ?? DEFAULT_DURATION,
        nzPlacement: options?.placement ?? DEFAULT_PLACEMENT
      }
    )
  }

  saveSuccess(entityName = 'Item'): void {
    this.success(`${entityName} saved successfully`)
  }

  deleteSuccess(entityName = 'Item'): void {
    this.success(`${entityName} deleted successfully`)
  }

  updateSuccess(entityName = 'Item'): void {
    this.success(`${entityName} updated successfully`)
  }

  saveError(entityName = 'Item'): void {
    this.error(`Failed to save ${entityName.toLowerCase()}`)
  }

  deleteError(entityName = 'Item'): void {
    this.error(`Failed to delete ${entityName.toLowerCase()}`)
  }

  updateError(entityName = 'Item'): void {
    this.error(`Failed to update ${entityName.toLowerCase()}`)
  }

  loadError(entityName = 'data'): void {
    this.error(`Failed to load ${entityName.toLowerCase()}`)
  }

  networkError(): void {
    this.error('Network error occurred. Please check your connection and try again.')
  }

  unauthorized(): void {
    this.error('You are not authorized to perform this action.')
  }

  validation(message: string): void {
    this.warning(message, { title: 'Validation Error' })
  }
} 