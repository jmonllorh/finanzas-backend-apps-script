class AguaDTO {
  años!: AguaAnualDTO[];
}

class AguaAnualDTO {
  año!: number;
  meses!: AguaDetalleDTO[];
}

class AguaDetalleDTO {
  mes!: MesDTO;
  importe!: number | null;
  consumo!: number | null;
  precioPorLitro!: number | null;
}
