class DesgloseTotalDTO {
  años!: DesgloseFinancieroDTO[];
  total!: DesgloseFinancieroDTO;
  mediaMensual!: ResumenCamposFinancierosDTO;
  activos!: ActivosDesglosadosDTO;
}

class DesgloseFinancieroDTO extends ResumenCamposFinancierosDTO {
  año!: number | null;
  viajes!: RegistroWrapperDTO;
  bonosAyudasRenta!: RegistroWrapperDTO;
  ingresosTotales!: RegistroWrapperDTO;
}

class ActivosDesglosadosDTO {
  items!: ActivoDesglosadoDTO[];
}

class ActivoDesglosadoDTO {
  tipo!: TipoActivoValue;
  valor!: RegistroWrapperDTO;
}
