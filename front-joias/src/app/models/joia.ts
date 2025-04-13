import { Categoria } from "./categoria";
import { Fornecedor } from "./fornecedor";
import { Pedido } from "./pedido";

export class Joia {
  id!: number;
  nome!: string;
  preco!: number;
  categoria!: Categoria;
  fornecedor!: Fornecedor;
  pedidos?: Pedido[];
}