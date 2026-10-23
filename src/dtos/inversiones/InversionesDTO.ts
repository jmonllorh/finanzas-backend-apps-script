class InversionesDTO {
  fondos!: RegistroFondoDTO;
  depositos!: RegistroDepositoDTO;
}

class RegistroFondoDTO {
  fondos!: RegistroMensualFondoDTO[];
  totales!: TotalesRegistroFondoDTO[];
  colchonSeguridadVivienda!: ValorWrapperDTO;
}

class TotalesRegistroFondoDTO {
  tipo!: TipoActivoValue;
  valor!: ValorWrapperDTO;
  beneficio!: ValorWrapperDTO;
  ganancia!: ValorWrapperDTO;
}

class RegistroMensualFondoDTO {
  fecha!: Date;
  // Aquí se añadirá el agregado con los totales de la tabla
  activos!: ActivoFondoDTO[];
  valorMaximoVivienda!: ValorWrapperDTO;
}

class ActivoFondoDTO {
  tipo!: TipoActivoValue;
  valor!: ValorWrapperDTO;
  aportado!: ValorWrapperDTO;
  beneficio!: ValorWrapperDTO;
  ganancia!: ValorWrapperDTO;
}

class RegistroDepositoDTO {
  depositos!: DepositoDTO[];
  interesesTotales!: ValorWrapperDTO;
  importeTotalActivos!: ValorWrapperDTO;
}

class DepositoDTO {
  entidad!: string;
  importe!: ValorWrapperDTO;
  fechaInicio!: Date;
  fechaVencimiento!: Date;
  tin!: ValorWrapperDTO;
  interesesBrutos!: ValorWrapperDTO;
  interesesNetos!: ValorWrapperDTO;
  activo!: boolean;
}
