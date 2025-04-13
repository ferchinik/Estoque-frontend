import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import Swal from 'sweetalert2';
import { Fornecedor } from '../../../models/fornecedor';
import { FornecedorService } from '../../../services/fornecedor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fornecedores-form',
  standalone: true,
  imports: [FormsModule, MdbFormsModule, CommonModule],
  templateUrl: './fornecedores-form.component.html',
  styleUrls: ['./fornecedores-form.component.scss']
})
export class FornecedoresFormComponent {

  // @Input() recebe o objeto 'fornecedor' para edição vindo do componente pai (a lista)
  @Input() fornecedorEdit: Fornecedor = new Fornecedor();

  // @Output() emite um evento (uma string de mensagem) para o componente pai
  @Output() retorno = new EventEmitter<string>();

  // Injeta o FornecedorService
  fornecedorService = inject(FornecedorService); 
  
  save() {
    if (this.fornecedorEdit.id > 0) {

      const fornecedorParaAtualizar = {
        id: this.fornecedorEdit.id,
        nome: this.fornecedorEdit.nome
      }

      // Chama o método update do serviço
      this.fornecedorService.update(fornecedorParaAtualizar as Fornecedor, fornecedorParaAtualizar.id).subscribe({ // Usa o fornecedorService
            next: (mensagem) => {
              Swal.fire({ icon: 'success', title: 'Sucesso', text: mensagem, timer: 1500, showConfirmButton: false });
              this.retorno.emit(mensagem);
            },
            error: (erro) => {
              this.handleError(erro, 'atualizar');
            }
      });
    } else {
      this.fornecedorService.save(this.fornecedorEdit).subscribe({ 
        next: (mensagem) => {
          Swal.fire({ icon: 'success', title: 'Sucesso', text: mensagem, timer: 1500, showConfirmButton: false });
          this.retorno.emit(mensagem);
        },
        error: (erro) => {
           this.handleError(erro, 'salvar');
        }
      });
    }
  }

  // Função auxiliar para exibir erros padronizados
  handleError(erro: any, acao: string) {
    let errorMessage = `Erro ao ${acao} fornecedor.`;
    if (erro.error) {
      if (typeof erro.error === 'object' && erro.error !== null) {
        errorMessage += ` Detalhes: ${Object.entries(erro.error).map(([key, value]) => `${key}: ${value}`).join('; ')}`;
      } else if (typeof erro.error === 'string') {
        errorMessage = erro.error;
      }
    } else if (erro.message) {
        errorMessage += ` ${erro.message}`;
    }
    Swal.fire({ icon: 'error', title: `Erro ao ${acao}`, text: errorMessage });
  }

}