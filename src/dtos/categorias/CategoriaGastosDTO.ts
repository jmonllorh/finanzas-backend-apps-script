class CategoriaGastosDTO {
  años!: GastosCategoriaAnualDTO[];
}

class GastosCategoriaAnualDTO {
  año!: number;
  meses!: GastosCategoriaMensualDTO[];
}

class GastosCategoriaMensualDTO {
  mes!: MesDTO;
  importes!: ValorConUnidadDTO[];
  total!: ValorConUnidadDTO;
}
