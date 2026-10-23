class ViajesDTO {
  año!: number;
  viajes!: ViajeDTO[];
  total!: ValorConUnidadDTO;
}

class ViajeDTO {
  nombre!: string;
  gastos!: GastoViajeDTO[];
  total!: ValorConUnidadDTO;
}

class GastoViajeDTO {
  importe!: ValorConUnidadDTO;
  comentario!: string | null;
}
