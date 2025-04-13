import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

import { Pedido } from '../../../models/pedido';
import { Cliente } from '../../../models/cliente';
import { Joia } from '../../../models/joia';
import { PedidoService } from '../../../services/pedido.service';

import { ClientesListComponent } from '../../clientes/clientes-list/clientes-list.component';
import { JoiasListComponent } from '../../joias/joias-list/joias-list.component';

@Component({
  selector: 'app-pedidos-form',
  standalone: true,
  imports: [FormsModule, MdbFormsModule, MdbModalModule, CommonModule, ClientesListComponent, JoiasListComponent],
  templateUrl: './pedidos-form.component.html',
  styleUrls: ['./pedidos-form.component.scss']
})
export class PedidosFormComponent implements OnInit {

  @Input() pedidoParaEditar: Pedido = new Pedido();
  pedidoEdit: Pedido = new Pedido();

  @Output() retorno = new EventEmitter<string>();

  pedidoService = inject(PedidoService);
  modalService = inject(MdbModalService);

  @ViewChild("modalClientesList") modalClientesList!: TemplateRef<any>;
  modalClienteRef!: MdbModalRef<any>;

  // Referência ao template do modal de Joias
  @ViewChild("modalJoiasList") modalJoiasList!: TemplateRef<any>;
  modalJoiaRef!: MdbModalRef<any>;

  formSubmetido: boolean = false;

  constructor() {}

  ngOnInit(): void {
    // Copia para evitar modificar o objeto original antes de salvar
    this.pedidoEdit = JSON.parse(JSON.stringify(this.pedidoParaEditar));
  
    // Garante que objetos aninhados existam
    if (!this.pedidoEdit.cliente) this.pedidoEdit.cliente = new Cliente();
    if (!this.pedidoEdit.joias) this.pedidoEdit.joias = [];
  
    // Tratamento da dataPedido
    if (this.pedidoEdit.dataPedido) {
      // A data pode vir como string ISO (ex: "2025-04-08T03:00:00.000+00:00") ou só data ("2025-04-08")
      try {
        // Tenta converter para objeto Date e depois formata para yyyy-MM-dd
        const dateObject = new Date(this.pedidoEdit.dataPedido);
        // Verifica se a conversão gerou uma data válida
        if (!isNaN(dateObject.getTime())) {
             // Usa a função formatDate
             this.pedidoEdit.dataPedido = this.formatDate(dateObject);
        } else {
             console.error("Data inválida recebida do backend:", this.pedidoParaEditar.dataPedido);
             this.pedidoEdit.dataPedido = ''; // Ou define um valor padrão, como a data de hoje
        }
      } catch(e) {
         console.error("Erro ao processar data:", e);
         this.pedidoEdit.dataPedido = '';
      }
    } else if (!this.pedidoEdit.id) {
        // Se for um pedido novo sem data, define para hoje
        this.pedidoEdit.dataPedido = this.formatDate(new Date());
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

  save() {
    this.formSubmetido = true;
    if (!this.pedidoEdit.dataPedido) { Swal.fire('Erro', 'Data do Pedido é obrigatória.', 'error'); return; }
    if (!this.pedidoEdit.cliente || !this.pedidoEdit.cliente.id) { Swal.fire('Erro', 'Selecione um Cliente válido.', 'error'); return; }
    if (!this.pedidoEdit.joias || this.pedidoEdit.joias.length === 0) { Swal.fire('Erro', 'Selecione pelo menos uma Joia.', 'error'); return; }

    const pedidoParaSalvar = { ...this.pedidoEdit };

    if (pedidoParaSalvar.id > 0) {
      this.pedidoService.update(pedidoParaSalvar, pedidoParaSalvar.id).subscribe({
        next: (mensagem) => { this.retorno.emit(mensagem); },
        error: (erro) => { this.handleError(erro, 'atualizar'); }
      });
    } else {
      this.pedidoService.save(pedidoParaSalvar).subscribe({
        next: (mensagem) => { this.retorno.emit(mensagem); },
        error: (erro) => { this.handleError(erro, 'salvar'); }
      });
    }
  }

  // --- Lógica para Cliente ---
  buscarCliente() {
    this.modalClienteRef = this.modalService.open(this.modalClientesList, { modalClass: 'modal-lg' });
  }
  onClienteSelecionado(cliente: Cliente) {
    this.pedidoEdit.cliente = cliente;
    this.modalClienteRef.close();
  }

  // --- Lógica para Joias (ManyToMany) ---
  buscarJoia() { // Abre o modal de Joias
    this.modalJoiaRef = this.modalService.open(this.modalJoiasList, { modalClass: 'modal-xl' });
  }

  // Método chamado QUANDO UMA JOIA É SELECIONADA no modal
  onJoiaSelecionada(joia: Joia) {
    // Garante que o array exista
    if (!this.pedidoEdit.joias) {
      this.pedidoEdit.joias = [];
    }
    // Verifica se a joia já está na lista (pelo ID)
    const existe = this.pedidoEdit.joias.find(j => j.id === joia.id);
    if (!existe) {
      this.pedidoEdit.joias.push(joia);
    } else {
      Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Joia já adicionada', showConfirmButton: false, timer: 1500});
    }
    // Não fecha o modal de joias automaticamente
  }

  // Método para REMOVER uma joia da lista
  removerJoia(joiaParaRemover: Joia, indice: number) {
     if (this.pedidoEdit.joias) {
        this.pedidoEdit.joias.splice(indice, 1); // Remove pelo índice
     }
  }
  // --- Fim Lógica Joias ---


  // Helper para tratar erros
  handleError(erro: any, acao: string) {
    this.formSubmetido = false;
    let errorMessage = `Erro ao ${acao} pedido.`;
    if (erro.error) {
      if (typeof erro.error === 'object') {
        errorMessage += ` Detalhes: ${Object.entries(erro.error).map(([key, value]) => `${key}: ${value}`).join('; ')}`;
      } else if (typeof erro.error === 'string') { errorMessage = erro.error; }
    } else if (erro.message) { errorMessage += ` ${erro.message}`; }
    Swal.fire({ icon: 'error', title: `Erro ao ${acao}`, text: errorMessage });
  }
}