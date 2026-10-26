class ElectricidadDTO {
  año!: number;
  meses!: ElectricidadDetalleDTO[];
}

class ElectricidadDetalleDTO {
  mes!: MesValue;
  importe!: number | null;
  notaImporte?: string;
  consumo!: number | null;
  notaConsumo?: string;
  precio!: ElectricidadPrecioDTO;
}

class ElectricidadPrecioDTO {
  precioEnergia!: number | null;
  notaPrecioEnergia?: string;
  precioPotenciaPunta!: number | null;
  notaPrecioPotenciaPunta?: string;
  precioPotenciaValle!: number | null;
  notaPrecioPotenciaValle?: string;
  precioPotenciaTotal!: number | null;
  notaPrecioPotenciaTotal?: string;
}
