class ElectricidadDTO {
  año!: number;
  meses!: ElectricidadDetalleDTO[];
}

class ElectricidadDetalleDTO {
  mes!: MesValue;
  importe!: ValorWrapperDTO;
  consumo!: ValorWrapperDTO;
  precio!: ElectricidadPrecioDTO;
}

class ElectricidadPrecioDTO {
  precioEnergia!: ValorWrapperDTO;
  precioPotenciaPunta!: ValorWrapperDTO;
  precioPotenciaValle!: ValorWrapperDTO;
  precioPotenciaTotal!: ValorWrapperDTO;
}
