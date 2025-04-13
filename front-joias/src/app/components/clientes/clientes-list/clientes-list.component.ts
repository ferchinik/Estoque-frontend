import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import Swal from 'sweetalert2';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { ClientesFormComponent } from '../clientes-form/clientes-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [FormsModule, MdbModalModule, CommonModule, ClientesFormComponent],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent {
  lista: Cliente[] = [];
  clienteEdit: Cliente = new Cliente();
  termoPesquisaNome: string = "";
  termoPesquisaEmail: string = "";

  @ViewChild('filtroEmailInput') filtroEmailInputRef?: NgModel;

  @Input() modoModal: boolean = false;
  @Output() meuEvento = new EventEmitter<Cliente>();

  clienteService = inject(ClienteService);
  modalService = inject(MdbModalService);

  @ViewChild("modalClienteForm") modalClienteForm!: TemplateRef<any>;
  modalRef!: MdbModalRef<any>;

  constructor() { this.findAll(); }

  // --- Métodos de Busca/Filtro ---

  findAll(showConfirmation: boolean = false) {
    this.clienteService.findAll().subscribe({
      next: (lista) => {
        this.lista = lista;
        if (showConfirmation) {
             Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Filtros limpos. Lista completa carregada.', showConfirmButton: false, timer: 2000});
        }
       },
      error: (erro) => { this.handleApiError(erro, 'buscar todos os clientes'); }
    });
  }

  // Método genérico para aplicar a pesquisa atual (nome ou email)
  aplicarPesquisa() {
     if (this.termoPesquisaNome.trim()) {
       this.pesquisarPorNome();
     } else if (this.termoPesquisaEmail.trim()) {
        this.pesquisarPorEmail();
     } else {
       this.findAll(); // Se ambos vazios, busca todos
     }
  }

  pesquisarPorNome() {
    this.termoPesquisaEmail = ''; // Limpa o outro campo para evitar confusão
    if (this.termoPesquisaNome.trim()) {
      this.clienteService.findByNomeContaining(this.termoPesquisaNome).subscribe({
        next: (lista) => { this.lista = lista; },
        error: (erro) => { this.handleApiError(erro, `pesquisar por nome "${this.termoPesquisaNome}"`); }
      });
    } else {
      this.findAll();
    }
  }

  pesquisarPorEmail() {
     this.termoPesquisaNome = ''; // Limpa o outro campo
     if (this.termoPesquisaEmail.trim()) {
        if (this.filtroEmailInputRef?.invalid) {
          Swal.fire('Atenção', 'Formato de email inválido.', 'warning');
          return;
        }
        this.clienteService.findByEmail(this.termoPesquisaEmail).subscribe({
          next: (cliente) => { this.lista = cliente ? [cliente] : []; },
          error: (erro) => {
            if (erro.status === 400 || erro.status === 404 || erro.message.includes('não encontrado')) { // Melhorar verificação de erro "não encontrado"
              this.lista = [];
              Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Cliente não encontrado.', showConfirmButton: false, timer: 2000});
            } else {
               this.handleApiError(erro, `pesquisar por email "${this.termoPesquisaEmail}"`);
            }
          }
        });
     } else {
       this.findAll();
     }
  }

  filtrarComPedidos() {
      this.clienteService.findByPedidosIsNotEmpty().subscribe({
        next: (lista) => { this.lista = lista; },
        error: (erro) => { this.handleApiError(erro, 'filtrar clientes com pedidos'); }
      });
  }

  filtrarSemPedidos() {
       this.clienteService.findClientesSemPedidos().subscribe({
        next: (lista) => { this.lista = lista; },
        error: (erro) => { this.handleApiError(erro, 'filtrar clientes sem pedidos'); }
      });
  }

   ordenarPorNomeDesc() {
       this.clienteService.findAllByOrderByNomeDesc().subscribe({
        next: (lista) => { this.lista = lista; },
        error: (erro) => { this.handleApiError(erro, 'ordenar clientes por nome Z-A'); }
      });
  }


  limparPesquisa() {
      this.termoPesquisaNome = "";
      this.termoPesquisaEmail = "";
      this.findAll(true); // Mostra confirmação
  }

   // --- Métodos CRUD (Modal) ---
  new() {
    this.clienteEdit = new Cliente();
    this.modalRef = this.modalService.open(this.modalClienteForm, { modalClass: 'modal-lg' });
  }

  edit(cliente: Cliente) {
    this.clienteEdit = JSON.parse(JSON.stringify(cliente));
    this.modalRef = this.modalService.open(this.modalClienteForm, { modalClass: 'modal-lg' });
  }

  delete(cliente: Cliente) {
    Swal.fire({ title: `Excluir ${cliente.nome}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não', confirmButtonColor: '#d33' })
      .then((result) => {
        if (result.isConfirmed) {
          this.clienteService.delete(cliente.id).subscribe({
            next: (msg) => { Swal.fire('Sucesso', msg, 'success'); this.findAll(); },
            error: (erro) => { this.handleApiError(erro, `excluir cliente "${cliente.nome}"`); }
          });
        }
      });
  }

  retornoForm(mensagem: string) {
    Swal.fire({ icon: 'success', title: mensagem, showConfirmButton: false, timer: 1500 });
    this.findAll();
     if(this.modalRef) { this.modalRef.close(); }
  }

  // --- Método para Modo Modal ---
  selecionar(cliente: Cliente) {
    if (this.modoModal) {
      this.meuEvento.emit(cliente);
    }
  }

   // --- Função Auxiliar para Erros ---
     handleApiError(erro: any, acao: string) {
         console.error(`Erro ao ${acao}:`, erro); // Loga o erro completo no console
         let msg = `Ocorreu um erro ao ${acao}.`;
         // Tenta extrair a mensagem específica do backend
         if (erro.error) {
             if (typeof erro.error === 'string') {
                 msg = erro.error; // Mensagem direta do backend (Ex: "Não é possível excluir...")
             } else if (typeof erro.error === 'object' && erro.error.message) {
                 msg = erro.error.message; // Se o erro for um objeto com uma propriedade message
             } else if(typeof erro.error === 'object') {
                  // Se for um mapa de erros de validação
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