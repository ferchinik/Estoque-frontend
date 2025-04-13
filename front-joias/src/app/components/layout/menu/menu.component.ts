import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Import RouterLink e RouterLinkActive
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse'; // Para o menu responsivo do MDB

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MdbCollapseModule, RouterLink, RouterLinkActive], // Adicione RouterLink e RouterLinkActive
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent { }