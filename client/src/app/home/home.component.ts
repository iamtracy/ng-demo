import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HomeService } from './home.service'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
   hello home
  `,
})
export class HomeComponent implements OnInit {

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    console.log('ngOnInit')
    this.homeService.getGreetings().subscribe()
  }
}
