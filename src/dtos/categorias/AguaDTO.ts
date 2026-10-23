class AguaDTO {
  año!: number;
  meses!: AguaDetalleDTO[];
}

class AguaDetalleDTO {
  mes!: MesValue;
  importe!: ValorWrapperDTO;
  consumo!: ValorWrapperDTO;
  precioPorLitro!: ValorWrapperDTO;
}
