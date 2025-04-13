import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../menu/menu.component'; // Importe o MenuComponent

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [RouterOutlet, MenuComponent], // Adicione MenuComponent aos imports
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent { }