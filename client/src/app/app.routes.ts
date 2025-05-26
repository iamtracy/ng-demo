import { Routes } from '@angular/router'

import { AdminComponent } from './admin/admin.component'
import { canActivateAdminRole } from './core/auth/guards/admin.guard'
import { canActivateAuthRole } from './core/auth/guards/auth.guard'
import { HomeComponent } from './home/home.component'

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [canActivateAuthRole]
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [canActivateAuthRole, canActivateAdminRole]
    },
    {
        path: '**',
        redirectTo: ''
    }
]

