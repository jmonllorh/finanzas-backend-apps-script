class RespuestaFinancieraDTO {
  resumenesAnuales!: ResumenAnualDTO[];
  comidaLimpieza!: CategoriaGastosDTO[];
  ocio!: CategoriaGastosDTO[];
  deporte!: CategoriaGastosDTO[];
  transporte!: CategoriaGastosDTO[];
  otros!: CategoriaGastosDTO[];
  electricidad!: ElectricidadDTO[];
  agua!: AguaDTO[];
  viajes!: ViajesDTO[];
  inversiones!: InversionesDTO;
  distribucionFondos!: DistribucionFondoDTO[];
  desgloseTotal!: DesgloseTotalDTO;
  evolucionSalarial!: EvolucionSalarioDTO[];
}
