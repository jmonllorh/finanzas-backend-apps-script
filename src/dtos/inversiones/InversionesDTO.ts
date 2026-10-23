class InversionesDTO {
  fondos!: RegistroFondoDTO;
  depositos!: RegistroDepositoDTO;
}

class RegistroFondoDTO {
  fondos!: RegistroMensualFondoDTO[];
  totales!: TotalesRegistroFondoDTO[];
  colchonSeguridadVivienda!: ValorConUnidadDTO;
}

class TotalesRegistroFondoDTO {
  tipo!: TipoActivoValue;
  valor!: ValorConUnidadDTO;
  beneficio!: ValorConUnidadDTO;
  ganancia!: ValorConUnidadDTO;
}

class RegistroMensualFondoDTO {
  fecha!: Date;
  // Aquí se añadirá el agregado con los totales de la tabla
  activos!: ActivoFondoDTO[];
  valorMaximoVivienda!: ValorConUnidadDTO;
}

class ActivoFondoDTO {
  tipo!: TipoActivoValue;
  valor!: ValorConUnidadDTO;
  aportado!: ValorConUnidadDTO;
  beneficio!: ValorConUnidadDTO;
  ganancia!: ValorConUnidadDTO;
}

class RegistroDepositoDTO {
  depositos!: DepositoDTO[];
  interesesTotales!: ValorConUnidadDTO;
  importeTotalActivos!: ValorConUnidadDTO;
}

class DepositoDTO {
  entidad!: string;
  importe!: ValorConUnidadDTO;
  fechaInicio!: Date;
  fechaVencimiento!: Date;
  tin!: ValorConUnidadDTO;
  interesesBrutos!: ValorConUnidadDTO;
  interesesNetos!: ValorConUnidadDTO;
  activo!: boolean;
}
