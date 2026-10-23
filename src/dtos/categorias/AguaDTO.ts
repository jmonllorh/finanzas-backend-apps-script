class AguaDTO {
  año!: number;
  meses!: AguaDetalleDTO[];
}

class AguaDetalleDTO {
  mes!: MesValue;
  importe!: ValorConUnidadDTO;
  consumo!: ValorConUnidadDTO;
  precioPorLitro!: ValorConUnidadDTO;
}
