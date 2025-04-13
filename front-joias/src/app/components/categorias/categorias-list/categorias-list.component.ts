import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Categoria } from '../../../models/categoria';
import { CategoriaService } from '../../../services/categoria.service';
import { CategoriasFormComponent } from '../categorias-form/categorias-form.component';

@Component({
    selector: 'app-categorias-list',
    standalone: true,
    imports: [FormsModule, MdbModalModule, CategoriasFormComponent],
    templateUrl: './categorias-list.component.html',
    styleUrls: ['./categorias-list.component.scss']
})
export class CategoriasListComponent implements OnInit {
    lista: Categoria[] = [];
    categoriaEdit: Categoria = new Categoria();
    termoPesquisa: string = "";

    @Input() modoModal: boolean = false;
    @Output() meuEvento = new EventEmitter<Categoria>();

    categoriaService = inject(CategoriaService);
    modalService = inject(MdbModalService);

    @ViewChild("modalCategoriaForm") modalCategoriaForm!: TemplateRef<any>;
    modalRef!: MdbModalRef<any>;

    constructor() {

        this.findAll();
    }

    ngOnInit(): void {
        this.findAll();
      }

      findAll(showConfirmation: boolean = false) { // Adiciona parâmetro
        this.categoriaService.findAll().subscribe({
            next: (listaRetornada) => {
                this.lista = listaRetornada;
                if (showConfirmation) { // Adiciona verificação e toast
                     Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Filtros limpos. Lista completa carregada.', showConfirmButton: false, timer: 2000});
                }
            },
            error: (erro) => {
                console.error(erro);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao buscar categorias',
                    text: erro.error?.message || erro.error || 'Ocorreu um erro inesperado.'
                });
            }
        });
      }

    pesquisar() {
        if (this.termoPesquisa && this.termoPesquisa.trim().length > 0) {
            this.categoriaService.findByNomeContaining(this.termoPesquisa.trim()).subscribe({
                next: (listaFiltrada) => {
                    this.lista = listaFiltrada;
                },
                error: (erro) => {
                    console.error(erro);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao pesquisar categorias',
                        text: erro.error?.message || erro.error || 'Ocorreu um erro inesperado.'
                    });
                }
            });
        } else {
            this.findAll(); // Se a pesquisa estiver vazia, busca todos
        }
    }

    limparPesquisa() {
        this.termoPesquisa = "";
        this.findAll(true);
    }

    ordenarAZ() {
        this.categoriaService.findAllByOrderByNomeAsc().subscribe({
          next: (listaOrdenada) => {
            this.lista = listaOrdenada; // Atualiza a lista com os dados ordenados
          },
          error: (erro) => {
            console.error(erro);
            Swal.fire({
              icon: 'error',
              title: 'Erro ao ordenar categorias',
              text: erro.error?.message || erro.error || 'Ocorreu um erro inesperado.'
            });
          }
        });
      }

    new() {
        this.categoriaEdit = new Categoria();
        this.modalRef = this.modalService.open(this.modalCategoriaForm, {
            modalClass: 'modal-md'
        });
    }

    edit(categoria: Categoria) {
        this.categoriaEdit = { ...categoria };
        this.modalRef = this.modalService.open(this.modalCategoriaForm, {
            modalClass: 'modal-md'
        });
    }
    delete(categoria: Categoria) {
        Swal.fire({
            title: `Confirmar exclusão de "${categoria.nome}"?`,
            text: "Esta ação não pode ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.categoriaService.delete(categoria.id).subscribe({
                    next: (mensagem) => {
                        Swal.fire('Excluído!', mensagem, 'success');
                        this.findAll(); 
                    },
                    error: (erro) => {
                        console.error(erro);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro ao excluir categoria',
                            text: erro.error?.message || erro.error || 'Ocorreu um erro inesperado.'
                        });
                    }
                });
            }
        });
    }

    retornoForm(mensagem: string) {
        Swal.fire({
            icon: 'success',
            title: mensagem,
            showConfirmButton: false,
            timer: 1500 
        });
        this.findAll(); 
        this.modalRef.close(); 
    }

    selecionar(categoria: Categoria) {
        if (this.modoModal) {
            this.meuEvento.emit(categoria); 
        }
    }
}