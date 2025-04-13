import { Cliente } from "./cliente";
import { Joia } from "./joia";

export class Pedido {
  id!: number;
  dataPedido!: Date | string;
  cliente!: Cliente;
  joias!: Joia[];
}