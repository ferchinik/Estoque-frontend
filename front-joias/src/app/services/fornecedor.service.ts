import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fornecedor } from '../models/fornecedor';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {

  API = 'http://localhost:8080/api/fornecedores';
  http = inject(HttpClient);

  constructor() { }

  // --- CRUD Básico ---
  findAll(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(`${this.API}/findAll`);
  }

  findById(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.API}/findById/${id}`);
  }

  save(fornecedor: Fornecedor): Observable<string> {
    return this.http.post<string>(`${this.API}/save`, fornecedor, { responseType: 'text' as 'json' });
  }

  update(fornecedor: Fornecedor, id: number): Observable<string> {
    return this.http.put<string>(`${this.API}/update/${id}`, fornecedor, { responseType: 'text' as 'json' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API}/delete/${id}`, { responseType: 'text' as 'json' });
  }

  findByNomeContaining(nome: string): Observable<Fornecedor[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Fornecedor[]>(`${this.API}/findByNomeContaining`, { params });
  }

  findByJoiasIsNotEmpty(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(`${this.API}/findByJoiasIsNotEmpty`);
  }

  findAllByOrderByNomeAsc(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(`${this.API}/findAllByOrderByNomeAsc`);
  }

  findByJoiasIsEmpty(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(`${this.API}/findByJoiasIsEmpty`);
  }
}