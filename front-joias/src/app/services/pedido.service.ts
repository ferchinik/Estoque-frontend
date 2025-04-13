import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../models/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  API = 'http://localhost:8080/api/pedidos';
  http = inject(HttpClient);

  constructor() { }

  // --- CRUD Básico ---
  findAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.API}/findAll`);
  }

  findById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.API}/findById/${id}`);
  }

  save(pedido: Pedido): Observable<string> {
    return this.http.post<string>(`${this.API}/save`, pedido, { responseType: 'text' as 'json' });
  }

  update(pedido: Pedido, id: number): Observable<string> {
    return this.http.put<string>(`${this.API}/update/${id}`, pedido, { responseType: 'text' as 'json' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API}/delete/${id}`, { responseType: 'text' as 'json' });
  }

  // --- Filtros (Baseado no PedidoRepository) ---
  findByClienteNomeContaining(nomeCliente: string): Observable<Pedido[]> {
    const params = new HttpParams().set('nomeCliente', nomeCliente);
    return this.http.get<Pedido[]>(`${this.API}/findByClienteNomeContaining`, { params });
  }

  findByDataPedido(data: Date | string): Observable<Pedido[]> {
    const dataStr = data instanceof Date ? data.toISOString().split('T')[0] : data;
    const params = new HttpParams().set('dataPedido', dataStr);
    return this.http.get<Pedido[]>(`${this.API}/findByDataPedido`, { params });
  }

  findByDataPedidoBetween(startDate: Date | string, endDate: Date | string): Observable<Pedido[]> {
    const startStr = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const endStr = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
    const params = new HttpParams()
      .set('startDate', startStr)
      .set('endDate', endStr);
    return this.http.get<Pedido[]>(`${this.API}/findByDataPedidoBetween`, { params });
  }
}