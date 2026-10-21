class DesgloseTotalDTO {
  años!: DesgloseFinancieroDTO[];
  total!: DesgloseFinancieroDTO;
  mediaMensual!: ResumenCamposFinancierosDTO;
  activos!: ActivosDesglosadosDTO;
}

class DesgloseFinancieroDTO extends ResumenCamposFinancierosDTO {
  año!: number | null;
  viajes!: ValorConUnidadDTO;
  bonosAyudasRenta!: ValorConUnidadDTO;
  ingresosTotales!: ValorConUnidadDTO;
}

class ActivosDesglosadosDTO {
  // Aquí se añadirá el agregado con los totales de los activos desglosados
  activos!: ActivoDesglosadoDTO[];
}

class ActivoDesglosadoDTO {
  tipo!: TipoActivoDTO;
  valor!: ValorConUnidadDTO;
}
