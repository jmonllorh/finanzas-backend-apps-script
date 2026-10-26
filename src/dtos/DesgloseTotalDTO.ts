class DesgloseTotalDTO {
  años!: DesgloseFinancieroDTO[];
  total!: DesgloseFinancieroDTO;
  mediaMensual!: ResumenCamposFinancierosDTO;
  activos!: ActivoDesglosadoDTO[];
}

class DesgloseFinancieroDTO extends ResumenCamposFinancierosDTO {
  año!: number | null;
  viajes!: number | null;
  notaViajes?: string;
  bonosAyudasRenta!: number | null;
  notaBonosAyudasRenta?: string;
  ingresosTotales!: number | null;
  notaIngresosTotales?: string;
}

class ActivoDesglosadoDTO {
  tipo!: TipoActivoValue;
  valor!: number | null;
  notaValor?: string;
}
