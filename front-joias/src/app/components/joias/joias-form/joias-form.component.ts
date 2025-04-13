import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import Swal from 'sweetalert2';

import { Joia } from '../../../models/joia';
import { Categoria } from '../../../models/categoria';
import { Fornecedor } from '../../../models/fornecedor';
import { JoiaService } from '../../../services/joia.service';

import { CategoriasListComponent } from '../../categorias/categorias-list/categorias-list.component';
import { FornecedoresListComponent } from '../../fornecedores/fornecedores-list/fornecedores-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-joias-form',
  standalone: true,
  imports: [FormsModule, MdbFormsModule, MdbModalModule, CategoriasListComponent, FornecedoresListComponent, CommonModule],
  templateUrl: './joias-form.component.html',
  styleUrls: ['./joias-form.component.scss']
})
export class JoiasFormComponent implements OnInit {
  @Input() joiaEdit: Joia = new Joia();
  @Output() retorno = new EventEmitter<string>();

  joiaService = inject(JoiaService);
  modalService = inject(MdbModalService);

  // Referências aos templates dos modais de seleção
  @ViewChild("modalCategoriasList") modalCategoriasList!: TemplateRef<any>;
  modalCategoriaRef!: MdbModalRef<any>;

  @ViewChild("modalFornecedoresList") modalFornecedoresList!: TemplateRef<any>;
  modalFornecedorRef!: MdbModalRef<any>;

   ngOnInit(): void {
     if (!this.joiaEdit.categoria) {
         this.joiaEdit.categoria = new Categoria();
     }
     if (!this.joiaEdit.fornecedor) {
          this.joiaEdit.fornecedor = new Fornecedor();
     }
   }

  save() {
    if (!this.joiaEdit.categoria || !this.joiaEdit.categoria.id) {
       Swal.fire('Erro', 'Selecione uma Categoria válida.', 'error');
       return;
    }
     if (!this.joiaEdit.fornecedor || !this.joiaEdit.fornecedor.id) {
       Swal.fire('Erro', 'Selecione um Fornecedor válido.', 'error');
       return;
    }

    if (this.joiaEdit.id > 0) {
      this.joiaService.update(this.joiaEdit, this.joiaEdit.id).subscribe({
        next: (mensagem) => { this.retorno.emit(mensagem); },
        error: (erro) => { this.handleError(erro, 'atualizar'); }
      });
    } else {
      this.joiaService.save(this.joiaEdit).subscribe({
        next: (mensagem) => { this.retorno.emit(mensagem); },
        error: (erro) => { this.handleError(erro, 'salvar'); }
      });
    }
  }

   // Métodos para abrir os modais
  buscarCategoria() {
    this.modalCategoriaRef = this.modalService.open(this.modalCategoriasList, { modalClass: 'modal-lg' });
  }

  buscarFornecedor() {
    this.modalFornecedorRef = this.modalService.open(this.modalFornecedoresList, { modalClass: 'modal-lg' });
  }

  // Métodos para receber o item selecionado do modal
  onCategoriaSelecionada(categoria: Categoria) {
    this.joiaEdit.categoria = categoria;
    this.modalCategoriaRef.close(); // Fecha o modal
  }

  onFornecedorSelecionado(fornecedor: Fornecedor) {
    this.joiaEdit.fornecedor = fornecedor;
    this.modalFornecedorRef.close(); // Fecha o modal
  }

   // Helper para tratar erros
   handleError(erro: any, acao: string) {
    console.error(`Erro ao ${acao} joia:`, erro);
    let errorMessage = `Erro ao ${acao} joia.`;
    if (erro.error) {
      if (typeof erro.error === 'object' && erro.error !== null) {
         // Se for um mapa de erros (validação), junta as mensagens
        errorMessage += ` Detalhes: ${Object.entries(erro.error).map(([key, value]) => `${key}: ${value}`).join('; ')}`;
      } else if (typeof erro.error === 'string') {
         // Se for uma string (erro de regra de negócio ou exceção genérica), usa a mensagem direta
        errorMessage = erro.error;
      }
    } else if (erro.message) {
       errorMessage += ` ${erro.message}`;
    }
    Swal.fire({ icon: 'error', title: `Erro ao ${acao}`, text: errorMessage });
}

}