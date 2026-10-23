class CategoriaGastosDTO {
  año!: number;
  meses!: GastosCategoriaMensualDTO[];
}

class GastosCategoriaMensualDTO {
  mes!: MesValue;
  importes!: ValorWrapperDTO[];
  total!: ValorWrapperDTO;
}
