import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Joia } from '../models/joia';

@Injectable({
  providedIn: 'root'
})
export class JoiaService {

  API = 'http://localhost:8080/api/joias';
  http = inject(HttpClient);

  constructor() { }

  findAll(): Observable<Joia[]> {
    return this.http.get<Joia[]>(`${this.API}/findAll`);
  }

  findById(id: number): Observable<Joia> {
    return this.http.get<Joia>(`${this.API}/findById/${id}`);
  }

  save(joia: Joia): Observable<string> {
    return this.http.post<string>(`${this.API}/save`, joia, { responseType: 'text' as 'json' });
  }

  update(joia: Joia, id: number): Observable<string> {
    return this.http.put<string>(`${this.API}/update/${id}`, joia, { responseType: 'text' as 'json' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API}/delete/${id}`, { responseType: 'text' as 'json' });
  }

  findAllByOrderByNomeAsc(): Observable<Joia[]> {
    return this.http.get<Joia[]>(`${this.API}/findAllByOrderByNomeAsc`);
  }

  filtrar(filtros: any): Observable<Joia[]> {
    let params = new HttpParams();

    // Adiciona parâmetros apenas se eles tiverem um valor válido
    if (filtros.nome) {
      params = params.set('nome', filtros.nome);
    }
    if (filtros.categoriaId) {
      params = params.set('categoriaId', filtros.categoriaId.toString());
    }
    if (filtros.fornecedorId) {
      params = params.set('fornecedorId', filtros.fornecedorId.toString());
    }
    // Verifica se precoMin não é nulo nem undefined antes de adicionar
    if (filtros.precoMin !== null && filtros.precoMin !== undefined) {
      params = params.set('precoMin', filtros.precoMin.toString());
    }
    // Chama o endpoint /filtrar
    return this.http.get<Joia[]>(`${this.API}/filtrar`, { params });
  }
}