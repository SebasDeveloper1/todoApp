// Importaciones necesarias para el funcionamiento del componente
import { CommonModule } from '@angular/common'; // Módulo común de Angular
import {
  Component, // Decorador para definir un componente
  computed, // Crea estados derivados reactivos
  effect, // Define efectos reactivos
  inject, // Inyecta dependencias
  Injector, // Clase para manejar inyecciones de dependencias
  OnDestroy, // Interfaz del ciclo de vida que permite limpiar recursos al destruir el componente
  signal, // Define un estado reactivo
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'; // Herramientas para formularios reactivos
import { TaskInterface } from './../models/tasks.model'; // Interfaz para representar una tarea
import { Subscription } from 'rxjs'; // Clase de RxJS para manejar suscripciones

// Decorador que define el componente Angular
@Component({
  selector: 'app-home', // Selector que identifica el componente en la plantilla HTML
  imports: [CommonModule, ReactiveFormsModule], // Módulos que este componente utiliza
  templateUrl: './home.component.html', // Ruta al archivo HTML de la plantilla del componente
  styleUrl: './home.component.css', // Ruta al archivo de estilos CSS del componente
})
export class HomeComponent implements OnDestroy {
  // Propiedad reactiva que almacena la lista de tareas
  tasks = signal<TaskInterface[]>([]);

  // Propiedad reactiva que controla el filtro actual (todas, pendientes o completadas)
  filter = signal<'all' | 'pending' | 'completed'>('all');

  // Estado derivado que aplica el filtro a la lista de tareas
  tasksByFilter = computed(() => {
    const filter = this.filter(); // Obtiene el valor actual del filtro
    const tasks = this.tasks(); // Obtiene el valor actual de las tareas
    if (filter === 'pending') {
      // Filtra solo las tareas pendientes
      return tasks.filter((task) => !task.completed);
    }
    if (filter === 'completed') {
      // Filtra solo las tareas completadas
      return tasks.filter((task) => task.completed);
    }
    // Devuelve todas las tareas si el filtro es 'all'
    return tasks;
  });

  // Control del formulario para añadir nuevas tareas
  newTaskCrtl = new FormControl('', {
    nonNullable: true, // El valor nunca será nulo
    validators: [Validators.required], // El campo es obligatorio
  });

  // Variable para manejar suscripciones reactivas
  sub: Subscription | null = null;

  // Limpia recursos (suscripciones) cuando el componente se destruye
  ngOnDestroy(): void {
    if (this.sub !== null) {
      this.sub.unsubscribe(); // Cancela la suscripción activa
    }
  }

  // Inyecta el manejador de dependencias para usarlo en efectos
  injector = inject(Injector);

  // Constructor del componente, donde se inicializan procesos
  constructor() {
    this.handleFormSubscription(); // Configura la suscripción al formulario
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    const storage = localStorage.getItem('tasks'); // Recupera las tareas desde localStorage
    if (storage) {
      this.tasks.set(JSON.parse(storage)); // Establece las tareas si existen en almacenamiento local
    }
    this.trackTasks(); // Configura el efecto para sincronizar las tareas con localStorage
  }

  // Configura un efecto que actualiza el almacenamiento local cuando cambian las tareas
  trackTasks() {
    effect(
      () => {
        const tasks = this.tasks(); // Obtiene las tareas actuales
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Guarda las tareas en localStorage
      },
      { injector: this.injector } // Usa el injector configurado
    );
  }

  // Configura una suscripción al valor del formulario
  handleFormSubscription() {
    this.sub = this.newTaskCrtl.valueChanges.subscribe((x) => console.log(x)); // Escucha cambios y los imprime en consola
  }

  // Maneja el envío del formulario para agregar una nueva tarea
  changeHandler() {
    if (this.newTaskCrtl.valid && this.newTaskCrtl.value.trim().length >= 1) {
      // Valida que el formulario sea válido y no esté vacío
      const title = this.newTaskCrtl.value; // Obtiene el título de la tarea
      this.addTask(title); // Agrega la nueva tarea
      this.newTaskCrtl.reset(); // Resetea el formulario
    }
  }

  // Agrega una nueva tarea a la lista
  addTask(title: string) {
    const newTask: TaskInterface = {
      id: Date.now(), // Asigna un ID único basado en la marca de tiempo actual
      title, // Título de la tarea
      completed: false, // La tarea inicia como no completada
    };
    this.tasks.update((current) => [...current, newTask]); // Actualiza el estado de tareas
  }

  // Elimina una tarea por índice
  deleteTask(index: number) {
    this.tasks.update((current) => current.filter((_, i) => i !== index)); // Filtra las tareas para excluir la seleccionada
  }

  // Cambia el estado de completado de una tarea
  updateTask(index: number) {
    this.tasks.update((current) => {
      return current.map((task, i) => {
        if (i === index) {
          // Alterna el estado de completado
          return {
            ...task,
            completed: !task.completed,
          };
        }
        return task; // Mantiene las demás tareas sin cambios
      });
    });
  }

  // Activa el modo de edición para una tarea específica
  updateEditing(index: number) {
    this.tasks.update((current) => {
      return current.map((task, i) => {
        if (i === index && !task.completed) {
          // Solo permite editar tareas no completadas
          return {
            ...task,
            editing: true,
          };
        }
        return {
          ...task,
          editing: false, // Desactiva la edición en las demás tareas
        };
      });
    });
  }

  // Actualiza el texto de una tarea tras la edición
  updateText(index: number, event: Event) {
    const target = event.target as HTMLInputElement; // Obtiene el valor del campo de entrada
    const value = target.value;
    this.tasks.update((current) => {
      return current.map((task, i) => {
        if (i === index) {
          // Actualiza el título y desactiva el modo de edición
          return {
            ...task,
            title: value,
            editing: false,
          };
        }
        return task; // Deja las demás tareas intactas
      });
    });
  }

  // Cambia el filtro de visualización de tareas
  changeFilter(filter: 'all' | 'pending' | 'completed') {
    this.filter.set(filter); // Establece el filtro seleccionado
  }
}
