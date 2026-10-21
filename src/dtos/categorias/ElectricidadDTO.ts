class ElectricidadDTO {
  años!: ElectricidadAnualDTO[];
}

class ElectricidadAnualDTO {
  año!: number;
  meses!: ElectricidadDetalleDTO[];
}

class ElectricidadDetalleDTO {
  mes!: MesDTO;
  importe!: ValorConUnidadDTO;
  consumo!: ValorConUnidadDTO;
  precio!: ElectricidadPrecioDTO;
}

class ElectricidadPrecioDTO {
  precioEnergia!: ValorConUnidadDTO;
  precioPotenciaPunta!: ValorConUnidadDTO;
  precioPotenciaValle!: ValorConUnidadDTO;
  precioPotenciaTotal!: ValorConUnidadDTO;
}
