class AguaDTO {
  años!: AguaAnualDTO[];
}

class AguaAnualDTO {
  año!: number;
  meses!: AguaDetalleDTO[];
}

class AguaDetalleDTO {
  mes!: MesDTO;
  importe!: ValorConUnidadDTO;
  consumo!: ValorConUnidadDTO;
  precioPorLitro!: ValorConUnidadDTO;
}
