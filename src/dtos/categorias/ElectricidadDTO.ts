class ElectricidadDTO {
  años!: ElectricidadAnualDTO[];
}

class ElectricidadAnualDTO {
  año!: number;
  meses!: ElectricidadDetalleDTO[];
}

class ElectricidadDetalleDTO {
  mes!: MesDTO;
  importe!: number | null;
  consumo!: number | null;
  precio!: ElectricidadPrecioDTO;
}

class ElectricidadPrecioDTO {
  precioEnergia!: number | null;
  precioPotenciaPunta!: number | null;
  precioPotenciaValle!: number | null;
  precioPotenciaTotal!: number | null;
}
