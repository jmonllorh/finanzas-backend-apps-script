class AguaDTO {
  año!: number;
  meses!: AguaDetalleDTO[];
}

class AguaDetalleDTO {
  mes!: MesValue;
  importe!: RegistroWrapperDTO;
  consumo!: RegistroWrapperDTO;
  precioPorLitro!: RegistroWrapperDTO;
}
