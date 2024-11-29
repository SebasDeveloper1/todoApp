import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './labs.component.html',
  styleUrls: ['./labs.component.css'],
})
export class LabsComponent implements OnDestroy {
  welcome = 'Bienvenido a mi primera aplicación con Angular';
  tasks = signal([
    'Instalar Angular CLI',
    'Crear proyecto',
    'Crear componente',
    'Crear  servicio',
  ]);
  name = signal('Nicolas');
  age = 18;
  disabled = true;
  img = 'https://w3schools.com/howto/img_avatar.png';

  person = {
    name: 'Nicolas',
    age: 18,
    avatar: 'https://w3schools.com/howto/img_avatar.png',
  };

  form = new FormControl();

  sub: Subscription | null = null;

  ngOnDestroy(): void {
    if (this.sub !== null) {
      this.sub.unsubscribe();
    }
  }

  constructor() {
    this.handleFormSubscription();
  }

  handleFormSubscription() {
    this.sub = this.form.valueChanges.subscribe((x) => console.log(x));
  }

  clickHandler() {
    alert('Hola');
  }

  changeHandler(event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    this.name.set(newValue);
  }

  keydownHandler(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    console.log(input.value);
  }
}
