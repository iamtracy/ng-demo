import { Routes } from '@angular/router'

import { canActivateAuthRole } from './auth/guards/auth.guard'
import { HomeComponent } from './home/home.component'

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [canActivateAuthRole]
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
        canActivate: [canActivateAuthRole]
    },
    {
        path: '**',
        redirectTo: ''
    }
]

