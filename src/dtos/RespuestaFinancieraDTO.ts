class RespuestaFinancieraDTO {
  status!: "success" | "error";
  message?: string;
  resumenesAnuales!: ResumenAnualDTO[] | null;
  comidaLimpieza!: CategoriaGastosDTO[] | null;
  ocio!: CategoriaGastosDTO[] | null;
  deporte!: CategoriaGastosDTO[] | null;
  transporte!: CategoriaGastosDTO[] | null;
  otros!: CategoriaGastosDTO[] | null;
  electricidad!: ElectricidadDTO[] | null;
  agua!: AguaDTO[] | null;
  viajes!: ViajesDTO[] | null;
  inversiones!: InversionesDTO | null;
  distribucionFondos!: DistribucionFondoDTO[] | null;
  desgloseTotal!: DesgloseTotalDTO | null;
  evolucionSalarial!: EvolucionSalarioDTO[] | null;
}
