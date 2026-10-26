class CategoriaGastosDTO {
  año!: number;
  meses!: GastosCategoriaMensualDTO[];
}

class GastosCategoriaMensualDTO {
  mes!: MesValue;
  importes!: RegistroWrapperDTO[];
  total!: RegistroWrapperDTO;
}
