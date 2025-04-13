import { Pedido } from "./pedido";

export class Cliente {
  id!: number;
  nome!: string;
  email!: string;
  pedidos?: Pedido[];
}