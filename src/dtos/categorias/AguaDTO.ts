class AguaDTO {
  año!: number;
  meses!: AguaDetalleDTO[];
}

class AguaDetalleDTO {
  mes!: MesValue;
  importe!: number | null;
  notaImporte?: string;
  consumo!: number | null;
  notaConsumo?: string;
  precioPorLitro!: number | null;
  notaPrecioPorLitro?: string;
}
