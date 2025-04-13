import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Fornecedor } from '../../../models/fornecedor';
import { FornecedorService } from '../../../services/fornecedor.service';
import { FornecedoresFormComponent } from '../fornecedores-form/fornecedores-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fornecedores-list',
  standalone: true,
  imports: [FormsModule, MdbModalModule, CommonModule, FornecedoresFormComponent],
  templateUrl: './fornecedores-list.component.html',
  styleUrls: ['./fornecedores-list.component.scss']
})
export class FornecedoresListComponent {
  lista: Fornecedor[] = [];
  fornecedorEdit: Fornecedor = new Fornecedor();
  termoPesquisa: string = "";


  @Input() modoModal: boolean = false; // Recebe true se o componente for usado dentro de um modal
  @Output() meuEvento = new EventEmitter<Fornecedor>(); // Emite o Fornecedor selecionado

  // Injeção de serviços
  fornecedorService = inject(FornecedorService);
  modalService = inject(MdbModalService);

  // Referência ao template do modal que contém o formulário
  @ViewChild("modalFornecedorForm") modalFornecedorForm!: TemplateRef<any>;
  modalRef!: MdbModalRef<any>; // Referência ao modal aberto

  constructor() {
    this.findAll(); // Busca todos os fornecedores ao inicializar
  }

  // Busca todos os fornecedores
  findAll(showConfirmation: boolean = false) {
    this.fornecedorService.findAll().subscribe({
      next: (listaRetornada) => {
        this.lista = listaRetornada;
         if (showConfirmation) {
             Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Filtros limpos. Lista completa carregada.', showConfirmButton: false, timer: 2000});
         }
      },
      error: (erro) => {
        this.handleApiError(erro, 'buscar todos os fornecedores');
        // Swal.fire({ icon: 'error', title: 'Erro ao buscar fornecedores', text: erro.error?.message || erro.error || 'Erro desconhecido' });
      }
    });
  }

  pesquisar() {
     if (this.termoPesquisa.trim().length > 0) {
         // Usa o método findByNomeContaining do service
         this.fornecedorService.findByNomeContaining(this.termoPesquisa.trim()).subscribe({
              next: (listaFiltrada) => {
                 this.lista = listaFiltrada;
              },
              error: (erro) => {
                  this.handleApiError(erro, `pesquisar por nome "${this.termoPesquisa}"`);
                  // Swal.fire({ icon: 'error', title: 'Erro na pesquisa', text: erro.error?.message || erro.error || 'Erro desconhecido' });
              }
         });
     } else {
         this.findAll(); // Se a pesquisa estiver vazia, busca todos
     }
   }

  limparPesquisaEFiltros() {
    this.termoPesquisa = "";
    this.findAll(true);
  }

  ordenarAZ() {
    this.fornecedorService.findAllByOrderByNomeAsc().subscribe({
      next: (listaOrdenada) => {
        this.lista = listaOrdenada;
      },
      error: (erro) => {
        this.handleApiError(erro, 'ordenar fornecedores A-Z');
      }
    });
  }

  filtrarComJoias() {
    this.fornecedorService.findByJoiasIsNotEmpty().subscribe({
      next: (listaFiltrada) => {
        this.lista = listaFiltrada;
      },
      error: (erro) => {
        this.handleApiError(erro, 'filtrar fornecedores com joias');
      }
    });
  }

  filtrarSemJoias() {
    this.fornecedorService.findByJoiasIsEmpty().subscribe({
      next: (listaFiltrada) => {
        this.lista = listaFiltrada;
      },
      error: (erro) => {
         this.handleApiError(erro, 'filtrar fornecedores sem joias');
      }
    });
  }

  new() {
    this.fornecedorEdit = new Fornecedor();
    // Abre o modal usando a referência do template e o MdbModalService
    this.modalRef = this.modalService.open(this.modalFornecedorForm, { modalClass: 'modal-md' });
  }

  // Abre o modal para editar um fornecedor existente
  edit(fornecedor: Fornecedor) {
    this.fornecedorEdit = { ...fornecedor };
    this.modalRef = this.modalService.open(this.modalFornecedorForm, { modalClass: 'modal-md' });
  }

  delete(fornecedor: Fornecedor) {
    Swal.fire({
      title: `Confirmar exclusão de "${fornecedor.nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fornecedorService.delete(fornecedor.id).subscribe({
          next: (mensagem) => {
            Swal.fire('Excluído!', mensagem, 'success');
            this.findAll(); // Recarrega a lista após excluir
          },
          error: (erro) => {
             // Exibe o erro vindo do backend!
             this.handleApiError(erro, `excluir fornecedor "${fornecedor.nome}"`);
            // Swal.fire({ icon: 'error', title: 'Erro ao excluir', text: erro.error?.message || erro.error || 'Erro desconhecido' });
          }
        });
      }
    });
  }

  // Método chamado pelo @Output 'retorno' do FornecedoresFormComponent quando salva/atualiza
  retornoForm(mensagem: string) {
    Swal.fire({ icon: 'success', title: mensagem, showConfirmButton: false, timer: 1500 });
    this.findAll();
    if(this.modalRef) {
      this.modalRef.close();
    }
  }

  // --- Método para Modo Modal ---
  // Chamado quando o botão 'Selecionar' é clicado (visível apenas se modoModal for true)
  selecionar(fornecedor: Fornecedor) {
    if (this.modoModal) {
      this.meuEvento.emit(fornecedor);
    }
  }

  handleApiError(erro: any, acao: string) {
      console.error(`Erro ao ${acao}:`, erro);
      let msg = `Ocorreu um erro ao ${acao}.`;
      // Tenta extrair a mensagem específica do backend
      if (erro.error) {
          if (typeof erro.error === 'string') {
              msg = erro.error; 
          } else if (typeof erro.error === 'object' && erro.error.message) {
              msg = erro.error.message;
          } else if(typeof erro.error === 'object') {
                // Se for um mapa de erros de validação (ex: vindo do GlobalExceptionHandler)
                const messages = Object.values(erro.error);
                if(messages.length > 0) {
                    msg = messages.join('; ');
                }
          }
      } else if (erro.message) {
            msg = erro.message; // Mensagem de erro genérica do Angular/Http
      }
      Swal.fire({ icon: 'error', title: 'Erro', text: msg });
  }

}