class CategoriaGastosDTO {
  años!: GastosCategoriaAnualDTO[];
}

class GastosCategoriaAnualDTO {
  año!: number;
  meses!: GastosCategoriaMensualDTO[];
}

class GastosCategoriaMensualDTO {
  mes!: MesDTO;
  importes!: number[];
  total!: number | null;
}
