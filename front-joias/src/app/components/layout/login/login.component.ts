import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Login } from '../../../models/login';
import { FormsModule } from '@angular/forms'; // Necessário para [(ngModel)]
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms'; // Necessário para MDB Forms

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MdbFormsModule], // Importe FormsModule e MdbFormsModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  login: Login = new Login();
  roteador = inject(Router);

  logar() {
    // Simulação simples - substitua por chamada real ao backend se tiver autenticação
    if (this.login.username === 'admin' && this.login.password === 'admin') {
      // Exibe um toast de sucesso
      this.gerarToast().fire({ icon: 'success', title: 'Login bem-sucedido!' });
      this.roteador.navigate(['/admin']); // Ou rota inicial do admin, ex: 'admin/dashboard'
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro no Login',
        text: 'Usuário ou senha inválidos!',
      });
    }
  }

  gerarToast() {
    return Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  }
}