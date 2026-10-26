class EvolucionSalarioDTO {
  fecha!: Date | null;
  salarioBrutoAnual!: RegistroWrapperDTO;
  incrementoBrutoAnual!: RegistroWrapperDTO;
  salarioNetoMensual!: RegistroWrapperDTO;
  incrementoNetoMensual!: RegistroWrapperDTO;
  comentarios!: string | null;
}
