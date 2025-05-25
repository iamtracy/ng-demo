import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { canActivateAuthRole } from './core/auth/guards/auth.guard'
import { canActivateAdminRole } from './core/auth/guards/admin.guard'
import { AdminComponent } from './admin/admin.component'

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
    }
]

