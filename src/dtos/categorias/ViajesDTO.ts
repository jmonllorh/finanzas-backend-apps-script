class ViajesDTO {
  año!: number;
  viajes!: ViajeDTO[];
  total!: number | null;
  notaTotal?: string;
}

class ViajeDTO {
  nombre!: string;
  gastos!: GastoViajeDTO[];
  total!: number | null;
  notaTotal?: string;
}

class GastoViajeDTO {
  importe!: number | null;
  notaImporte?: string;
  comentario!: string | null;
}
