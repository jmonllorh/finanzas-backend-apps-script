class CategoriaGastosDTO {
  año!: number;
  meses!: GastosCategoriaMensualDTO[];
}

class GastosCategoriaMensualDTO {
  mes!: MesValue;
  importes!: ImporteCategoriaDTO[];
  total!: number | null;
  notaTotal?: string;
}

class ImporteCategoriaDTO {
  valor!: number;
  nota?: string;
}
