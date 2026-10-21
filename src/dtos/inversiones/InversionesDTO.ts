class InversionesDTO {
  fondos!: RegistroFondoDTO;
  depositos!: RegistroDepositoDTO;
}

class RegistroFondoDTO {
  fondos!: RegistroMensualFondoDTO[];
  totales!: TotalesRegistroFondoDTO[];
  colchonSeguridadVivienda!: number | null;
}

class TotalesRegistroFondoDTO {
  tipo!: TipoActivoDTO;
  valor!: number | null;
  beneficio!: number | null;
  ganancia!: number | null;
}

class RegistroMensualFondoDTO {
  fecha!: Date;
  // Aquí se añadirá el agregado con los totales de la tabla
  activos!: ActivoFondoDTO[];
  valorMaximoVivienda!: number | null;
}

class ActivoFondoDTO {
  tipo!: TipoActivoDTO;
  valor!: number | null;
  aportado!: number | null;
  beneficio!: number | null;
  ganancia!: number | null;
}

class RegistroDepositoDTO {
  depositos!: DepositoDTO[];
  interesesTotales!: number | null;
  importeTotalActivos!: number | null;
}

class DepositoDTO {
  entidad!: string;
  importe!: number;
  fechaInicio!: Date;
  fechaVencimiento!: Date;
  tin!: number;
  interesesBrutos!: number;
  interesesNetos!: number;
  activo!: boolean;
}
