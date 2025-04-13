import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  API = 'http://localhost:8080/api/categorias';
  http = inject(HttpClient);

  constructor() { }

  // --- CRUD Básico ---
  findAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.API}/findAll`);
  }

  findById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.API}/findById/${id}`);
  }

  save(categoria: Categoria): Observable<string> {
    return this.http.post<string>(`${this.API}/save`, categoria, { responseType: 'text' as 'json' });
  }

  update(categoria: Categoria, id: number): Observable<string> {
    return this.http.put<string>(`${this.API}/update/${id}`, categoria, { responseType: 'text' as 'json' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API}/delete/${id}`, { responseType: 'text' as 'json' });
  }

  findByNomeContaining(nome: string): Observable<Categoria[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Categoria[]>(`${this.API}/findByNomeContaining`, { params });
  }

  findAllByOrderByNomeAsc(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.API}/findAllByOrderByNomeAsc`);
  }
}