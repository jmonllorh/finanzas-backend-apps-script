class EvolucionSalarioDTO {
  fecha!: Date;
  salarioBrutoAnual!: ValorConUnidadDTO;
  incrementoBrutoAnual!: ValorConUnidadDTO;
  salarioNetoMensual!: ValorConUnidadDTO;
  incrementoNetoMensual!: ValorConUnidadDTO;
  comentarios!: string | null;
}
