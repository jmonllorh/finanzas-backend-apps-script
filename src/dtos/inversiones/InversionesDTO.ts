class InversionesDTO {
  fondos!: RegistroFondoDTO;
  depositos!: RegistroDepositoDTO;
}

class RegistroFondoDTO {
  items!: RegistroMensualFondoDTO[];
  totales!: TotalesRegistroFondoDTO[];
  colchonSeguridadVivienda!: RegistroWrapperDTO;
}

class TotalesRegistroFondoDTO {
  tipo!: TipoActivoValue;
  valor!: RegistroWrapperDTO;
  beneficio!: RegistroWrapperDTO | null;
  ganancia!: RegistroWrapperDTO | null;
}

class RegistroMensualFondoDTO {
  fecha!: Date;
  activos!: ActivoFondoDTO[];
  valorMaximoVivienda!: RegistroWrapperDTO;
}

class ActivoFondoDTO {
  tipo!: TipoActivoValue;
  valor!: RegistroWrapperDTO;
  aportado!: RegistroWrapperDTO | null;
  beneficio!: RegistroWrapperDTO | null;
  ganancia!: RegistroWrapperDTO | null;
}

class RegistroDepositoDTO {
  items!: DepositoDTO[];
  interesesTotales!: RegistroWrapperDTO;
  importeTotalActivos!: RegistroWrapperDTO;
}

class DepositoDTO {
  entidad!: string;
  importe!: RegistroWrapperDTO;
  fechaInicio!: Date;
  fechaVencimiento!: Date;
  tin!: RegistroWrapperDTO;
  interesesBrutos!: RegistroWrapperDTO;
  interesesNetos!: RegistroWrapperDTO;
  activo!: boolean;
}
