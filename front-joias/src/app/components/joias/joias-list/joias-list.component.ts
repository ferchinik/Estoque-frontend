import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Joia } from '../../../models/joia';
import { JoiaService } from '../../../services/joia.service';
import { JoiasFormComponent } from '../joias-form/joias-form.component';
import { CommonModule } from '@angular/common';

import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { Categoria } from '../../../models/categoria';
import { Fornecedor } from '../../../models/fornecedor';
import { CategoriasListComponent } from '../../categorias/categorias-list/categorias-list.component';
import { FornecedoresListComponent } from '../../fornecedores/fornecedores-list/fornecedores-list.component';

@Component({
  selector: 'app-joias-list',
  standalone: true,
  imports: [FormsModule, MdbModalModule, JoiasFormComponent, CommonModule, CategoriasListComponent, FornecedoresListComponent],
  templateUrl: './joias-list.component.html',
  styleUrls: ['./joias-list.component.scss']
})
export class JoiasListComponent implements OnInit, OnDestroy {
  lista: Joia[] = [];
  joiaEdit: Joia = new Joia();

  // --- Propriedades dos Filtros ---
  termoPesquisaNome: string = "";
  filtroCategoria: Categoria | null = null;
  filtroFornecedor: Fornecedor | null = null;
  filtroPrecoMin: number | null = null;

  // --- Para Debounce ---
  private nomePesquisaSubject = new Subject<string>();
  private precoPesquisaSubject = new Subject<number | null>();
  private pesquisaSubscription: Subscription | null = null;
  readonly debounceTimeMs = 400;

  // --- Para Modo Modal ---
  @Input() modoModal: boolean = false;
  @Output() meuEvento = new EventEmitter<Joia>();
  @Input() joiasJaSelecionadas: Joia[] = [];

  // --- Injeção e Referências ---
  joiaService = inject(JoiaService);
  modalService = inject(MdbModalService);
  @ViewChild("modalJoiaForm") modalJoiaForm!: TemplateRef<any>;
  modalRef!: MdbModalRef<any>;
  @ViewChild("modalCategoriasListFiltro") modalCategoriasListFiltro!: TemplateRef<any>;
  modalCategoriaRef!: MdbModalRef<any>;
  @ViewChild("modalFornecedoresListFiltro") modalFornecedoresListFiltro!: TemplateRef<any>;
  modalFornecedorRef!: MdbModalRef<any>;

  constructor() { }

  ngOnInit(): void {
    this.findAll(); // Busca inicial
    this.setupPesquisaDebounce(); // Configura os debounces
  }

  ngOnDestroy(): void {
    this.pesquisaSubscription?.unsubscribe();
  }

  private setupPesquisaDebounce(): void {
    // Combina os subjects de nome e preço para acionar o filtro
    this.pesquisaSubscription = new Subscription();

    this.pesquisaSubscription.add(
      this.nomePesquisaSubject.pipe(
        debounceTime(this.debounceTimeMs),
        distinctUntilChanged()
      ).subscribe(() => this.aplicarFiltros()) // Chama o filtro combinado
    );

    this.pesquisaSubscription.add(
      this.precoPesquisaSubject.pipe(
        debounceTime(this.debounceTimeMs),
        distinctUntilChanged()
      ).subscribe(() => this.aplicarFiltros())
    );
  }

  // Chamado pelo (input) do campo nome
  onNomePesquisaInput(): void {
    this.nomePesquisaSubject.next(this.termoPesquisaNome);
  }

  // Chamado pelo (input) ou (change) do campo preço
  onPrecoPesquisaInput(): void {
    const precoInput = this.filtroPrecoMin;

    let valorParaSubject: number | null = null;

    // Converte para string APENAS para checar se não é vazio.
    const precoAsString = String(precoInput ?? '');

    if (precoAsString !== '') {
      const num = Number(precoInput);
      // Verifica se a conversão foi bem-sucedida (não é NaN)
      if (!isNaN(num)) {
        valorParaSubject = num;
      }
    }
    // Se a string era vazia (input vazio, null ou undefined), valorParaSubject continua null
    this.precoPesquisaSubject.next(valorParaSubject);
  }

  isJoiaSelecionada(joia: Joia): boolean {
    if (!this.joiasJaSelecionadas) return false;
    return this.joiasJaSelecionadas.some(j => j.id === joia.id);
  }

  findAll(showConfirmation: boolean = false) {
    this.joiaService.findAll().subscribe({
      next: (listaRetornada) => {
          this.lista = listaRetornada;
           if (showConfirmation) {
               Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Filtros limpos. Lista completa carregada.', showConfirmButton: false, timer: 2000});
          }
      },
      error: (erro) => { this.handleApiError(erro, 'buscar todas as joias'); }
    });
  }

  aplicarFiltros() {
      const filtros: any = {};

      // Coleta os valores dos filtros
      if (this.termoPesquisaNome && this.termoPesquisaNome.trim() !== '') {
        filtros.nome = this.termoPesquisaNome.trim();
      }
      if (this.filtroCategoria && this.filtroCategoria.id > 0) {
        filtros.categoriaId = this.filtroCategoria.id;
      }
      if (this.filtroFornecedor && this.filtroFornecedor.id > 0) {
        filtros.fornecedorId = this.filtroFornecedor.id;
      }
      // Verifica se precoMin é um número válido e não negativo
      const precoNum = Number(this.filtroPrecoMin);
      if (!isNaN(precoNum) && precoNum >= 0) {
         filtros.precoMin = precoNum;
      } else if (this.filtroPrecoMin === null || this.filtroPrecoMin === undefined) {
          // Não faz nada se for null/undefined
      } else {
         console.warn("Preço mínimo inválido, ignorando filtro de preço.");
      }

      // Verifica se algum filtro foi realmente aplicado
      if (Object.keys(filtros).length === 0) {
        // Se nenhum filtro está ativo, busca todos
        this.findAll();
      } else {
        // Se há filtros, chama o novo método 'filtrar' do serviço
        this.joiaService.filtrar(filtros).subscribe({
          next: (listaFiltrada) => {
            this.lista = listaFiltrada;
          },
          error: (erro) => {
            this.handleApiError(erro, 'filtrar joias');
          }
        });
      }
  }

   ordenarPorNomeAsc() {
        this.joiaService.findAllByOrderByNomeAsc().subscribe({
             next: (listaOrdenada) => { this.lista = listaOrdenada; },
             error: (erro) => { this.handleApiError(erro, 'ordenar joias por nome'); }
        });
    }

  limparFiltros() {
    this.termoPesquisaNome = "";
    this.filtroCategoria = null;
    this.filtroFornecedor = null;
    this.filtroPrecoMin = null;
    this.nomePesquisaSubject.next('');
    this.precoPesquisaSubject.next(null);
    this.findAll(true);
  }

  abrirModalCategoriaFiltro() {
    this.modalCategoriaRef = this.modalService.open(this.modalCategoriasListFiltro, { modalClass: 'modal-lg' });
  }

  abrirModalFornecedorFiltro() {
     this.modalFornecedorRef = this.modalService.open(this.modalFornecedoresListFiltro, { modalClass: 'modal-lg' });
  }

  onCategoriaSelecionadaFiltro(categoria: Categoria) {
      this.filtroCategoria = categoria;
      if(this.modalCategoriaRef) this.modalCategoriaRef.close();
      this.aplicarFiltros(); // Aplica filtros combinados
  }

   onFornecedorSelecionadoFiltro(fornecedor: Fornecedor) {
      this.filtroFornecedor = fornecedor;
      if(this.modalFornecedorRef) this.modalFornecedorRef.close();
      this.aplicarFiltros(); // Aplica filtros combinados
  }

  // --- Métodos CRUD (Modal) ---
  new() {
    this.joiaEdit = new Joia();
    // Importante: inicializar objetos aninhados para evitar erros no template do form
    this.joiaEdit.categoria = new Categoria();
    this.joiaEdit.fornecedor = new Fornecedor();
    this.modalRef = this.modalService.open(this.modalJoiaForm, { modalClass: 'modal-xl' });
  }

  edit(joia: Joia) {
    this.joiaEdit = JSON.parse(JSON.stringify(joia));
    // Garantir que objetos aninhados existam após a clonagem
     if (!this.joiaEdit.categoria) this.joiaEdit.categoria = new Categoria();
     if (!this.joiaEdit.fornecedor) this.joiaEdit.fornecedor = new Fornecedor();
    this.modalRef = this.modalService.open(this.modalJoiaForm, { modalClass: 'modal-xl' });
  }

  delete(joia: Joia) {
    Swal.fire({ title: `Excluir "${joia.nome}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não', confirmButtonColor: '#d33' })
      .then((result) => {
        if (result.isConfirmed) {
          this.joiaService.delete(joia.id).subscribe({
            next: (mensagem) => { Swal.fire('Excluído!', mensagem, 'success'); this.findAll(); },
            error: (erro) => { this.handleApiError(erro, `excluir joia "${joia.nome}"`); }
          });
        }
      });
  }

  retornoForm(mensagem: string) {
    Swal.fire({ icon: 'success', title: mensagem, showConfirmButton: false, timer: 1500 });
    this.findAll();
     if(this.modalRef) { this.modalRef.close(); }
  }

  // --- Método para Modo Modal (Seleção de Joia) ---
  selecionar(joia: Joia) {
    if (this.modoModal) {
      this.meuEvento.emit(joia);
    }
  }

   // --- Função Auxiliar para Erros---
   handleApiError(erro: any, acao: string) {
         console.error(`Erro ao ${acao}:`, erro);
         let msg = `Ocorreu um erro ao ${acao}.`;
         if (erro.error) {
             if (typeof erro.error === 'string') { msg = erro.error; }
              else if (typeof erro.error === 'object' && erro.error.message) { msg = erro.error.message; }
               else if(typeof erro.error === 'object') {
                  const messages = Object.values(erro.error);
                  if(messages.length > 0) { msg = messages.join('; '); }
             }
         } else if (erro.message) { msg = erro.message; }
         Swal.fire({ icon: 'error', title: 'Erro', text: msg });
     }
}