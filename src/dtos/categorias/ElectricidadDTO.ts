class ElectricidadDTO {
  año!: number;
  meses!: ElectricidadDetalleDTO[];
}

class ElectricidadDetalleDTO {
  mes!: MesValue;
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
