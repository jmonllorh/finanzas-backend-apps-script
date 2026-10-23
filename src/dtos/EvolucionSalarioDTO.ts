class EvolucionSalarioDTO {
  fecha!: Date | null;
  salarioBrutoAnual!: ValorWrapperDTO;
  incrementoBrutoAnual!: ValorWrapperDTO;
  salarioNetoMensual!: ValorWrapperDTO;
  incrementoNetoMensual!: ValorWrapperDTO;
  comentarios!: string | null;
}
