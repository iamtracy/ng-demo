import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
 { component: HomeComponent, path: '', canActivate: [AuthGuard] },
 { component: AboutComponent, path: 'about', canActivate: [AuthGuard] },
];
