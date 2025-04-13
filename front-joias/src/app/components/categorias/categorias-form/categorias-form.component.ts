import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import Swal from 'sweetalert2';
import { Categoria } from '../../../models/categoria';
import { CategoriaService } from '../../../services/categoria.service';

@Component({
  selector: 'app-categorias-form',
  standalone: true,
  imports: [FormsModule, MdbFormsModule],
  templateUrl: './categorias-form.component.html',
  styleUrls: ['./categorias-form.component.scss']
})
export class CategoriasFormComponent {
  @Input() categoriaEdit: Categoria = new Categoria();
  @Output() retorno = new EventEmitter<string>();

  categoriaService = inject(CategoriaService);

  save() {
    if (this.categoriaEdit.id > 0) {
      this.categoriaService.update(this.categoriaEdit, this.categoriaEdit.id).subscribe({
        next: (mensagem) => {
          this.retorno.emit(mensagem);
        },
        error: (erro) => {
          Swal.fire({ icon: 'error', title: 'Erro ao atualizar categoria', text: erro.error?.message || erro.error || 'Erro desconhecido' });
        }
      });
    } else {
      this.categoriaService.save(this.categoriaEdit).subscribe({
        next: (mensagem) => {
          this.retorno.emit(mensagem);
        },
        error: (erro) => {
          let errorMessage = 'Erro desconhecido';
          if (typeof erro.error === 'object' && erro.error !== null) {
             errorMessage = Object.values(erro.error).join('; ');
          } else if (typeof erro.error === 'string') {
             errorMessage = erro.error;
          }
          Swal.fire({ icon: 'error', title: 'Erro ao salvar categoria', text: errorMessage });
        }
      });
    }
  }
}