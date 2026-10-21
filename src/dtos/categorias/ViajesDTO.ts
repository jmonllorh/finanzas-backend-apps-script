class ViajesDTO {
  años!: ViajesAnualesDTO[];
}

class ViajesAnualesDTO {
  año!: number;
  viajes!: ViajeDTO[];
  total!: number | null;
}

class ViajeDTO {
  nombre!: string;
  gastos!: GastoViajeDTO[];
  total!: number | null;
}

class GastoViajeDTO {
  importe!: number | null;
  comentario!: string | null;
}
