import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  API = 'http://localhost:8080/api/clientes';
  http = inject(HttpClient);

  constructor() { }

  // --- CRUD Básico ---
  findAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.API}/findAll`);
  }

  findById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.API}/findById/${id}`);
  }

  save(cliente: Cliente): Observable<string> {
    return this.http.post<string>(`${this.API}/save`, cliente, { responseType: 'text' as 'json' });
  }

  update(cliente: Cliente, id: number): Observable<string> {
    return this.http.put<string>(`${this.API}/update/${id}`, cliente, { responseType: 'text' as 'json' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API}/delete/${id}`, { responseType: 'text' as 'json' });
  }

  // --- Filtros Personalizados ---
  findByEmail(email: string): Observable<Cliente> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Cliente>(`${this.API}/findByEmail`, { params });
  }

  findByNomeContaining(nome: string): Observable<Cliente[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Cliente[]>(`${this.API}/findByNomeContaining`, { params });
  }

   findByPedidosIsNotEmpty(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.API}/findByPedidosIsNotEmpty`);
  }

  findAllByOrderByNomeDesc(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.API}/findAllByOrderByNomeDesc`);
  }

  findClientesSemPedidos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.API}/findClientesSemPedidos`);
  }
}