import { Routes } from '@angular/router';
import { LoginComponent } from './components/layout/login/login.component';
import { PrincipalComponent } from './components/layout/principal/principal.component';
import { CategoriasListComponent } from './components/categorias/categorias-list/categorias-list.component';
import { ClientesListComponent } from './components/clientes/clientes-list/clientes-list.component';
import { FornecedoresListComponent } from './components/fornecedores/fornecedores-list/fornecedores-list.component';
import { JoiasListComponent } from './components/joias/joias-list/joias-list.component';
import { PedidosListComponent } from './components/pedidos/pedidos-list/pedidos-list.component';

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: 'full' },
  { path: "login", component: LoginComponent },
  {
    path: "admin", component: PrincipalComponent, children: [ 
      { path: "", redirectTo: "clientes", pathMatch: 'full' }, 

      { path: "categorias", component: CategoriasListComponent },

      { path: "clientes", component: ClientesListComponent },

      { path: "fornecedores", component: FornecedoresListComponent },

      { path: "joias", component: JoiasListComponent },

      { path: "pedidos", component: PedidosListComponent },
    ]
  },
   // Rota curinga para redirecionar para o login caso a rota não exista
   { path: '**', redirectTo: 'login' }
];