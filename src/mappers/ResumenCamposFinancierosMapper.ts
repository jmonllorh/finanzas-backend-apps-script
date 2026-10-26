/**
 * Localiza cada campo financiero por el encabezado de la hoja y devuelve sus valores y notas.
 * Internet puede faltar en hojas antiguas; «Total gastos» se acepta como alias del encabezado común.
 */
function crearResumenCamposFinancierosDTO(
  headers: unknown[],
  row: unknown[],
  notes: string[]
): ResumenCamposFinancierosDTO {
  const headerTexts = headers.map((header) => Utils.readText(header) ?? "");
  /**
   * Busca un encabezado o sus alternativas y lee el valor de esa columna.
   * Si es opcional y no existe, devuelve cero sin nota; en otro caso lanza error.
   */
  const readField = (
    header: string,
    optional = false,
    alternatives: string[] = []
  ): [number | null, string | undefined] => {
    const columnIndex = [header, ...alternatives]
      .map((candidate) => headerTexts.indexOf(candidate))
      .find((index) => index !== -1) ?? -1;
    if (columnIndex === -1) {
      if (optional) {
        return Utils.readValueAndNote(0, null);
      }
      throw new Error(`No se encontró la columna "${header}" en la hoja.`);
    }
    return Utils.readValueAndNote(
      row[columnIndex],
      notes[columnIndex]
    );
  };

  const dto = new ResumenCamposFinancierosDTO();
  [dto.alquiler, dto.notaAlquiler] = readField("Alquiler");
  [dto.electricidad, dto.notaElectricidad] = readField("Electricidad");
  [dto.agua, dto.notaAgua] = readField("Agua");
  [dto.internet, dto.notaInternet] = readField("Internet", true);
  [dto.inversiones, dto.notaInversiones] = readField("Inversiones");
  [dto.suscripciones, dto.notaSuscripciones] = readField("Suscripciones");
  [dto.medicos, dto.notaMedicos] = readField("Médicos");
  [dto.comidaLimpieza, dto.notaComidaLimpieza] = readField("Comida/Limpieza");
  [dto.ocio, dto.notaOcio] = readField("Ocio");
  [dto.deporte, dto.notaDeporte] = readField("Deporte");
  [dto.transporte, dto.notaTransporte] = readField("Transporte");
  [dto.otros, dto.notaOtros] = readField("Otros");
  [dto.ahorroNeto, dto.notaAhorroNeto] = readField("Ahorro neto");
  [dto.ahorroBruto, dto.notaAhorroBruto] = readField("Ahorro bruto");
  [dto.totalGastos, dto.notaTotalGastos] = readField(
    "Total gastos comunes",
    false,
    ["Total gastos"]
  );
  [dto.ingresosFijos, dto.notaIngresosFijos] = readField("Ingresos fijos");
  return dto;
}
