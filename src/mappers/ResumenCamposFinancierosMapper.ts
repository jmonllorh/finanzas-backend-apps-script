/**
 * Localiza cada campo financiero por el encabezado de la hoja y devuelve wrappers en euros.
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
   * Si es opcional y no existe, devuelve un wrapper vacío; en otro caso lanza error.
   */
  const readField = (
    header: string,
    optional = false,
    alternatives: string[] = []
  ): RegistroWrapperDTO => {
    const columnIndex = [header, ...alternatives]
      .map((candidate) => headerTexts.indexOf(candidate))
      .find((index) => index !== -1) ?? -1;
    if (columnIndex === -1) {
      if (optional) {
        return Utils.createValueWrapper(null, null, UnidadValue.Euro);
      }
      throw new Error(`No se encontró la columna "${header}" en la hoja.`);
    }
    return Utils.createValueWrapper(
      row[columnIndex],
      notes[columnIndex],
      UnidadValue.Euro
    );
  };

  const dto = new ResumenCamposFinancierosDTO();
  dto.alquiler = readField("Alquiler");
  dto.electricidad = readField("Electricidad");
  dto.agua = readField("Agua");
  dto.internet = readField("Internet", true);
  dto.inversiones = readField("Inversiones");
  dto.suscripciones = readField("Suscripciones");
  dto.medicos = readField("Médicos");
  dto.comidaLimpieza = readField("Comida/Limpieza");
  dto.ocio = readField("Ocio");
  dto.deporte = readField("Deporte");
  dto.transporte = readField("Transporte");
  dto.otros = readField("Otros");
  dto.ahorroNeto = readField("Ahorro neto");
  dto.ahorroBruto = readField("Ahorro bruto");
  dto.totalGastos = readField(
    "Total gastos comunes",
    false,
    ["Total gastos"]
  );
  dto.ingresosFijos = readField("Ingresos fijos");
  return dto;
}
