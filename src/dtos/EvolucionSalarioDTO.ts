class EvolucionSalarioDTO {
  fecha!: Date | null;
  salarioBrutoAnual!: number | null;
  notaSalarioBrutoAnual?: string;
  incrementoBrutoAnual!: number | null;
  notaIncrementoBrutoAnual?: string;
  salarioNetoMensual!: number | null;
  notaSalarioNetoMensual?: string;
  incrementoNetoMensual!: number | null;
  notaIncrementoNetoMensual?: string;
  comentarios!: string | null;
}
