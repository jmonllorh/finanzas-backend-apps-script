class ElectricidadDTO {
  año!: number;
  meses!: ElectricidadDetalleDTO[];
}

class ElectricidadDetalleDTO {
  mes!: MesValue;
  importe!: RegistroWrapperDTO;
  consumo!: RegistroWrapperDTO;
  precio!: ElectricidadPrecioDTO;
}

class ElectricidadPrecioDTO {
  precioEnergia!: RegistroWrapperDTO;
  precioPotenciaPunta!: RegistroWrapperDTO;
  precioPotenciaValle!: RegistroWrapperDTO;
  precioPotenciaTotal!: RegistroWrapperDTO;
}
