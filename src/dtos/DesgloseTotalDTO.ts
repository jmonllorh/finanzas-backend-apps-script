class DesgloseTotalDTO {
  años!: DesgloseFinancieroDTO[];
  total!: DesgloseFinancieroDTO;
  mediaMensual!: ResumenCamposFinancierosDTO;
  activos!: ActivosDesglosadosDTO;
}

class DesgloseFinancieroDTO extends ResumenCamposFinancierosDTO {
  año!: number | null;
  viajes!: number | null;
  bonosAyudasRenta!: number | null;
  ingresosTotales!: number | null;
}

class ActivosDesglosadosDTO {
  // Aquí se añadirá el agregado con los totales de los activos desglosados
  activos!: ActivoDesglosadoDTO[];
}

class ActivoDesglosadoDTO {
  tipo!: TipoActivoDTO;
  valor!: number | null;
}
