/**
 * Localiza cada campo financiero por el encabezado de la hoja y devuelve sus valores y notas.
 * Gas e Internet ausentes se representan con cero en hojas antiguas.
 * «Total gastos» se acepta como alias del encabezado común.
 * @param headers Encabezados de las columnas financieras.
 * @param row Fila de valores financieros que se va a convertir.
 * @param notes Notas asociadas a las celdas de la fila.
 * @returns DTO con los campos financieros y sus notas disponibles.
 */
function mapFinancialSummaryFields(
  headers: unknown[],
  row: unknown[],
  notes: string[]
): FinancialSummaryFieldsDTO {
  const headerTexts = headers.map((header) => SpreadsheetUtils.readText(header) ?? "");
  /**
   * Busca un encabezado o sus alternativas y lee el valor de esa columna.
   * Si es opcional y no existe, devuelve cero sin nota; en otro caso lanza error.
   * @param header Nombre principal del encabezado que se quiere localizar.
   * @param optional Indica si se permite que el encabezado no exista.
   * @param alternatives Nombres alternativos válidos para el encabezado principal.
   * @returns Tupla con el valor numérico leído y su nota opcional.
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
        return SpreadsheetUtils.readValueAndNote(0, null);
      }
      throw new Error(`Column "${header}" was not found in the sheet.`);
    }
    return SpreadsheetUtils.readValueAndNote(
      row[columnIndex],
      notes[columnIndex]
    );
  };

  const dto = new FinancialSummaryFieldsDTO();
  [dto.rent, dto.rentNote] = readField("Alquiler");
  [dto.electricity, dto.electricityNote] = readField("Electricidad");
  [dto.water, dto.waterNote] = readField("Agua");
  [dto.gas, dto.gasNote] = readField("Gas", true);
  [dto.internet, dto.internetNote] = readField("Internet", true);
  [dto.investments, dto.investmentsNote] = readField("Inversiones");
  [dto.subscriptions, dto.subscriptionsNote] = readField("Suscripciones");
  [dto.medicalExpenses, dto.medicalExpensesNote] = readField("Médicos");
  [dto.foodAndCleaning, dto.foodAndCleaningNote] = readField("Comida/Limpieza");
  [dto.leisure, dto.leisureNote] = readField("Ocio");
  [dto.sports, dto.sportsNote] = readField("Deporte");
  [dto.transportation, dto.transportationNote] = readField("Transporte");
  [dto.otherExpenses, dto.otherExpensesNote] = readField("Otros");
  [dto.netSavings, dto.netSavingsNote] = readField("Ahorro neto");
  [dto.grossSavings, dto.grossSavingsNote] = readField("Ahorro bruto");
  [dto.totalExpenses, dto.totalExpensesNote] = readField(
    "Total gastos comunes",
    false,
    ["Total gastos"]
  );
  [dto.regularIncome, dto.regularIncomeNote] = readField("Ingresos fijos");
  return dto;
}
