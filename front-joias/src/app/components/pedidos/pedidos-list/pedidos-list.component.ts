import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Pedido } from '../../../models/pedido';
import { PedidoService } from '../../../services/pedido.service';
import { PedidosFormComponent } from '../pedidos-form/pedidos-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [FormsModule, MdbModalModule, PedidosFormComponent, CommonModule],
  templateUrl: './pedidos-list.component.html',
  styleUrls: ['./pedidos-list.component.scss']
})
export class PedidosListComponent implements OnInit {
  lista: Pedido[] = [];
  pedidoEdit: Pedido = new Pedido(); 

  filtroClienteNome: string = "";
  filtroDataInicio: string = ""; 
  filtroDataFim: string = "";  

  // --- Para Modo Modal ---
  @Input() modoModal: boolean = false;
  @Output() meuEvento = new EventEmitter<Pedido>();

  // Injeção de serviços
  pedidoService = inject(PedidoService);
  modalService = inject(MdbModalService);

  // Referência ao template do modal do formulário
  @ViewChild("modalPedidoForm") modalPedidoForm!: TemplateRef<any>;
  modalRef!: MdbModalRef<any>;

  constructor() { }

  ngOnInit(): void {
      this.findAll(); // Busca todos os pedidos ao inicializar
  }

  findAll(showConfirmation: boolean = false) { 
    this.pedidoService.findAll().subscribe({
      next: (listaRetornada) => {
        this.lista = listaRetornada;
         if (showConfirmation) {
             Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Filtros limpos. Lista completa carregada.', showConfirmButton: false, timer: 2000});
        }
      },
      error: (erro) => {
        Swal.fire({ icon: 'error', title: 'Erro ao buscar pedidos', text: erro.error || 'Erro desconhecido' });
      }
    });
  }

  aplicarFiltros() {
    // Lógica para decidir qual filtro aplicar
    if (this.filtroDataInicio && this.filtroDataFim) {
        // Filtro por intervalo de datas
        this.pedidoService.findByDataPedidoBetween(this.filtroDataInicio, this.filtroDataFim).subscribe({
            next: (listaFiltrada) => { this.lista = listaFiltrada; },
            error: (erro) => { Swal.fire({ icon: 'error', title: 'Erro ao filtrar por data', text: erro.error || 'Erro desconhecido' }); }
        });
    } else if (this.filtroDataInicio) {
        // Filtro por data única (início)
        this.pedidoService.findByDataPedido(this.filtroDataInicio).subscribe({
            next: (listaFiltrada) => { this.lista = listaFiltrada; },
            error: (erro) => { Swal.fire({ icon: 'error', title: 'Erro ao filtrar por data', text: erro.error || 'Erro desconhecido' }); }
        });
    } else if (this.filtroClienteNome.trim()) {
        this.pedidoService.findByClienteNomeContaining(this.filtroClienteNome.trim()).subscribe({
          next: (listaFiltrada) => { this.lista = listaFiltrada; },
          error: (erro) => { Swal.fire({ icon: 'error', title: 'Erro ao filtrar por nome do cliente', text: erro.error || 'Erro desconhecido' }); }
        });

    }
     else {
      this.findAll(); // Se nenhum filtro específico, busca todos
    }
  }

  // Limpa os filtros e busca todos
  limparFiltros() {
    this.filtroClienteNome = "";
    this.filtroDataInicio = "";
    this.filtroDataFim = "";
    this.findAll(true);
  }


  // Abre modal para novo pedido
  new() {
    this.pedidoEdit = new Pedido();
    this.modalRef = this.modalService.open(this.modalPedidoForm, { modalClass: 'modal-xl' });
  }

  // Abre modal para editar pedido
  edit(pedido: Pedido) {
    this.pedidoEdit = JSON.parse(JSON.stringify(pedido));
     // Garante que o array de joias exista mesmo se vier nulo do backend na cópia
     if (!this.pedidoEdit.joias) {
        this.pedidoEdit.joias = [];
     }
    this.modalRef = this.modalService.open(this.modalPedidoForm, { modalClass: 'modal-xl' });
  }

  // Deleta um pedido
  delete(pedido: Pedido) {
    Swal.fire({
      title: `Confirmar exclusão do Pedido #${pedido.id}?`,
      text: `Cliente: ${pedido.cliente?.nome}`, // Mostra informação útil
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6', confirmButtonText: 'Sim, excluir!', cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.delete(pedido.id).subscribe({
          next: (mensagem) => {
            Swal.fire('Excluído!', mensagem, 'success');
            this.findAll(); // Recarrega a lista
          },
          error: (erro) => {
            Swal.fire({ icon: 'error', title: 'Erro ao excluir', text: erro.error || 'Erro desconhecido' });
          }
        });
      }
    });
  }

  // Callback do formulário de pedido
  retornoForm(mensagem: string) {
    Swal.fire({ icon: 'success', title: mensagem, showConfirmButton: false, timer: 1500 });
    this.findAll(); // Recarrega a lista
    this.modalRef.close(); // Fecha o modal
  }

  // --- Método para Modo Modal---
  selecionar(pedido: Pedido) {
    if (this.modoModal) {
      this.meuEvento.emit(pedido);
    }
  }
}