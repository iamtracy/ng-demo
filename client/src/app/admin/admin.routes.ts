import { Routes } from '@angular/router'

import { canActivateAdminRole } from '../auth/guards/admin.guard'

import { AdminComponent } from './admin.component'

export const adminRoutes: Routes = [
    {
        path: '',
        component: AdminComponent,
        canActivate: [canActivateAdminRole]
    }
] 