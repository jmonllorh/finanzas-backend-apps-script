class DesgloseTotalDTO {
  años!: DesgloseFinancieroDTO[];
  total!: DesgloseFinancieroDTO;
  mediaMensual!: ResumenCamposFinancierosDTO;
  activos!: ActivosDesglosadosDTO;
}

class DesgloseFinancieroDTO extends ResumenCamposFinancierosDTO {
  año!: number | null;
  viajes!: ValorWrapperDTO;
  bonosAyudasRenta!: ValorWrapperDTO;
  ingresosTotales!: ValorWrapperDTO;
}

class ActivosDesglosadosDTO {
  // Aquí se añadirá el agregado con los totales de los activos desglosados
  activos!: ActivoDesglosadoDTO[];
}

class ActivoDesglosadoDTO {
  tipo!: TipoActivoValue;
  valor!: ValorWrapperDTO;
}
