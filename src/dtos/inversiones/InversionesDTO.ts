class InversionesDTO {
  fondos!: RegistroFondoDTO;
  depositos!: RegistroDepositoDTO;
}

class RegistroFondoDTO {
  items!: RegistroMensualFondoDTO[];
  totales!: TotalesRegistroFondoDTO[];
  colchonSeguridadVivienda!: number | null;
  notaColchonSeguridadVivienda?: string;
}

class TotalesRegistroFondoDTO {
  tipo!: TipoActivoValue;
  valor!: number | null;
  notaValor?: string;
  beneficio!: number | null;
  notaBeneficio?: string;
  ganancia!: number | null;
  notaGanancia?: string;
}

class RegistroMensualFondoDTO {
  fecha!: Date;
  activos!: ActivoFondoDTO[];
  valorMaximoVivienda!: number | null;
  notaValorMaximoVivienda?: string;
}

class ActivoFondoDTO {
  tipo!: TipoActivoValue;
  valor!: number | null;
  notaValor?: string;
  aportado?: number | null;
  notaAportado?: string;
  beneficio?: number | null;
  notaBeneficio?: string;
  ganancia?: number | null;
  notaGanancia?: string;
}

class RegistroDepositoDTO {
  items!: DepositoDTO[];
  interesesTotales!: number | null;
  notaInteresesTotales?: string;
  importeTotalActivos!: number | null;
  notaImporteTotalActivos?: string;
}

class DepositoDTO {
  entidad!: string;
  importe!: number | null;
  notaImporte?: string;
  fechaInicio!: Date;
  fechaVencimiento!: Date;
  tin!: number | null;
  notaTin?: string;
  interesesBrutos!: number | null;
  notaInteresesBrutos?: string;
  interesesNetos!: number | null;
  notaInteresesNetos?: string;
  activo!: boolean;
}
