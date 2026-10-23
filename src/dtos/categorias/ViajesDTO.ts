class ViajesDTO {
  año!: number;
  viajes!: ViajeDTO[];
  total!: ValorWrapperDTO;
}

class ViajeDTO {
  nombre!: string;
  gastos!: GastoViajeDTO[];
  total!: ValorWrapperDTO;
}

class GastoViajeDTO {
  importe!: ValorWrapperDTO;
  comentario!: string | null;
}
