import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { AboutComponent } from './about/about.component';
import { canActivateAuthRole } from './core/auth/guards/auth.guard'

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [canActivateAuthRole]
    },
    {
        path: 'about',
        component: AboutComponent,
        canActivate: [canActivateAuthRole]
    }
]
