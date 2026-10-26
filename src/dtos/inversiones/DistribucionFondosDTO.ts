class DistribucionFondoDTO {
  categoria!: CategoriaFondo | null;
  nombre!: string | null;
  peso!: RegistroWrapperDTO;
  cantidadMensual!: RegistroWrapperDTO;
  isin!: string | null;
  nombreTecnico!: string | null;
  comision!: RegistroWrapperDTO;
}

enum CategoriaFondo {
  FONDOS_INDEXADOS = "Fondos indexados",
  FONDOS_VALUE = "Fondos value",
  RENTA_FIJA = "Renta fija",
  FONDO_MONETARIO = "Fondos monetarios",
  NO_USADOS = "No usados"
}
