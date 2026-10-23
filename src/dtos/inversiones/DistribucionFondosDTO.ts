class DistribucionFondoDTO {
  categoria!: CategoriaFondo | null;
  nombre!: string | null;
  peso!: ValorConUnidadDTO;
  cantidadMensual!: ValorConUnidadDTO;
  isin!: string | null;
  nombreTecnico!: string | null;
  comision!: ValorConUnidadDTO;
}

enum CategoriaFondo {
  FONDOS_INDEXADOS = "Fondos indexados",
  FONDOS_VALUE = "Fondos value",
  RENTA_FIJA = "Renta fija",
  FONDO_MONETARIO = "Fondo monetario",
  NO_USADOS = "No usados"
}
