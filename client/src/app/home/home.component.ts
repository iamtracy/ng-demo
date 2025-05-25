import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HomeService } from './home.service'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { Observable, of, tap } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  displayedColumns: string[] = ['id', 'message', 'createdAt', 'updatedAt']
  dataSource = new MatTableDataSource<any>([])
  greetings$: Observable<any[]> = of([])

  form = new FormGroup({
    message: new FormControl('')
  })

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.homeService.getGreetings().subscribe()
    this.greetings$ = this.homeService.greetings$.pipe(
      tap((greetings) => this.dataSource.data = greetings)
    )
  }

  onSubmit() {
    this.homeService.createGreeting(this.form.value.message as string).subscribe()
  }
}
