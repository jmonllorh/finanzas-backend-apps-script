class CategoriaGastosDTO {
  año!: number;
  meses!: GastosCategoriaMensualDTO[];
}

class GastosCategoriaMensualDTO {
  mes!: MesValue;
  importes!: ValorConUnidadDTO[];
  total!: ValorConUnidadDTO;
}
