class DistribucionFondosDTO {
  fondos!: DistribucionFondoDTO[];
}

class DistribucionFondoDTO {
  categoria!: CategoriaFondo | null;
  fondo!: string | null;
  peso!: number | null;
  cantidadMensual!: number | null;
  isin!: string | null;
  nombreTecnico!: string | null;
  comision!: number | null;
}

enum CategoriaFondo {
  FONDOS_INDEXADOS = "Fondos indexados",
  FONDOS_VALUE = "Fondos value",
  RENTA_FIJA = "Renta fija",
  FONDO_MONETARIO = "Fondo monetario",
  NO_USADOS = "No usados"
}
