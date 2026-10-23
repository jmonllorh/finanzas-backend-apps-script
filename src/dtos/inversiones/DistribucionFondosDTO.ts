class DistribucionFondoDTO {
  categoria!: CategoriaFondo | null;
  nombre!: string | null;
  peso!: ValorWrapperDTO;
  cantidadMensual!: ValorWrapperDTO;
  isin!: string | null;
  nombreTecnico!: string | null;
  comision!: ValorWrapperDTO;
}

enum CategoriaFondo {
  FONDOS_INDEXADOS = "Fondos indexados",
  FONDOS_VALUE = "Fondos value",
  RENTA_FIJA = "Renta fija",
  FONDO_MONETARIO = "Fondo monetario",
  NO_USADOS = "No usados"
}
