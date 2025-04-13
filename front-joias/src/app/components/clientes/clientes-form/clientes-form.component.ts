import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import Swal from 'sweetalert2';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes-form',
  standalone: true,
  imports: [FormsModule, MdbFormsModule, CommonModule],
  templateUrl: './clientes-form.component.html',
  styleUrls: ['./clientes-form.component.scss']
})
export class ClientesFormComponent {

  // @Input() recebe o objeto 'cliente' para edição vindo do componente pai (a lista)
  // Inicializa com um novo Cliente se nada for passado (caso de 'novo' cliente)
  @Input() clienteEdit: Cliente = new Cliente();

  // @Output() emite um evento (uma string de mensagem, neste caso) para o componente pai
  // quando a operação de salvar/atualizar é bem-sucedida.
  @Output() retorno = new EventEmitter<string>();

  clienteService = inject(ClienteService);

  // Método chamado quando o formulário é enviado
  save() {
    if (this.clienteEdit.id > 0) {

      const clienteParaAtualizar = {
        id: this.clienteEdit.id,
        nome: this.clienteEdit.nome,
        email: this.clienteEdit.email
      }
      // Chama o método update do serviço
      this.clienteService.update(clienteParaAtualizar as Cliente, clienteParaAtualizar.id).subscribe({
        next: (mensagem) => {
          Swal.fire({ icon: 'success', title: 'Sucesso', text: mensagem, timer: 1500, showConfirmButton: false });
          this.retorno.emit(mensagem);
        },
        error: (erro) => {
          this.handleError(erro, 'atualizar');
        }
      });
    } else {
      // Chama o método save do serviço
      this.clienteService.save(this.clienteEdit).subscribe({
        next: (mensagem) => {
          // Em caso de sucesso, exibe um toast e emite o evento 'retorno' com a mensagem
          Swal.fire({ icon: 'success', title: 'Sucesso', text: mensagem, timer: 1500, showConfirmButton: false });
          this.retorno.emit(mensagem); // Notifica o componente pai
        },
        error: (erro) => {
          this.handleError(erro, 'salvar');
        }
      });
    }
  }

  // Função auxiliar para exibir erros padronizados
  handleError(erro: any, acao: string) {
    let errorMessage = `Erro ao ${acao} cliente.`;
    
    if (erro.error) {
      if (typeof erro.error === 'object' && erro.error !== null) {
        // Se for um mapa de erros (validação), junta as mensagens
        errorMessage += ` Detalhes: ${Object.entries(erro.error).map(([key, value]) => `${key}: ${value}`).join('; ')}`;
      } else if (typeof erro.error === 'string') {
        // Se for uma string (erro de regra de negócio), usa a mensagem direta
        errorMessage = erro.error;
      }
    } else if (erro.message) {
        // Caso genérico
        errorMessage += ` ${erro.message}`;
    }
    Swal.fire({ icon: 'error', title: `Erro ao ${acao}`, text: errorMessage });
  }

}