import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { canActivateAuthRole } from './core/auth/guards/auth.guard'

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [canActivateAuthRole],
        data: {
            roles: ['user']
        }
    }
]
