class ViajesDTO {
  año!: number;
  viajes!: ViajeDTO[];
  total!: RegistroWrapperDTO;
}

class ViajeDTO {
  nombre!: string;
  gastos!: GastoViajeDTO[];
  total!: RegistroWrapperDTO;
}

class GastoViajeDTO {
  importe!: RegistroWrapperDTO;
  comentario!: string | null;
}
