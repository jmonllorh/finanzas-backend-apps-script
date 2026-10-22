class EvolucionSalarioDTO {
  fecha!: Date | null;
  salarioBrutoAnual!: ValorConUnidadDTO;
  incrementoBrutoAnual!: ValorConUnidadDTO;
  salarioNetoMensual!: ValorConUnidadDTO;
  incrementoNetoMensual!: ValorConUnidadDTO;
  comentarios!: string | null;
}
