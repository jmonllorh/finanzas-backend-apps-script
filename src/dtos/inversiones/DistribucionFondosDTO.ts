class DistribucionFondoDTO {
  categoria!: CategoriaFondo | null;
  nombre!: string | null;
  peso!: number | null;
  notaPeso?: string;
  cantidadMensual!: number | null;
  notaCantidadMensual?: string;
  isin!: string | null;
  nombreTecnico!: string | null;
  comision!: number | null;
  notaComision?: string;
}

enum CategoriaFondo {
  FONDOS_INDEXADOS = "Fondos indexados",
  FONDOS_VALUE = "Fondos value",
  RENTA_FIJA = "Renta fija",
  FONDO_MONETARIO = "Fondos monetarios",
  NO_USADOS = "No usados"
}
