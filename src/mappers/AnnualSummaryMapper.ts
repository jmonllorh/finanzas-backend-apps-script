/**
 * Aplica el mapper individual a cada hoja anual y conserva el orden recibido.
 * @param sheets Hojas de cálculo que contienen resúmenes anuales.
 * @returns Lista de DTO anuales en el mismo orden que las hojas recibidas.
 */
function mapAnnualSummaries(
  sheets: GoogleAppsScript.Spreadsheet.Sheet[]
): AnnualSummaryDTO[] {
  return sheets.map((sheet) => mapAnnualSummary(sheet));
}

/**
 * Indica si el mes contiene algún valor distinto de cero o alguna nota.
 * @param dto Datos financieros de un mes que se van a comprobar.
 * @returns true si algún campo mensual tiene un valor significativo; false en caso contrario.
 */
function hasMonthlyData(dto: MonthlySummaryDTO): boolean {
  return Object.entries(dto).some(([field, value]) => {
    if (field === "month") {
      return false;
    }
    if (typeof value === "number") {
      return value !== 0;
    }
    return typeof value === "string" && value.trim() !== "";
  });
}

/**
 * Valida el año y las filas mensuales, localiza total y media mensual y mapea
 * sus campos financieros; añade viajes y bonos/ayudas/renta al total anual.
 * @param sheet Hoja de cálculo correspondiente a un resumen anual.
 * @returns DTO con el año, los meses, el total y la media mensual.
 */
function mapAnnualSummary(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): AnnualSummaryDTO {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length < 2) {
    throw new Error(`Sheet "${sheet.getName()}" does not contain an annual summary.`);
  }

  const year = SpreadsheetUtils.readYear(rows[0][1]);
  if (year === null) {
    throw new Error(`No valid year was found in sheet "${sheet.getName()}".`);
  }

  const headers = rows[1];
  const totalRowIndex = SpreadsheetUtils.findRowIndex(
    rows,
    2,
    rows.length,
    (label) => label.startsWith("total")
  );
  const mediaRowIndex = SpreadsheetUtils.findRowIndex(
    rows,
    totalRowIndex + 1,
    rows.length,
    (label) => label.startsWith("media")
  );
  const validMonths: Month[] = Object.values(Month);
  const months = validMonths.map((month, index) => {
    const rowIndex = index + 2;
    const row = rows[rowIndex];
    if (!row || SpreadsheetUtils.readText(row[0]) !== month) {
      throw new Error(`Month "${month}" was not found in sheet "${sheet.getName()}".`);
    }

    const dto = new MonthlySummaryDTO();
    dto.month = month;
    Object.assign(
      dto,
      mapFinancialSummaryFields(
        headers,
        row,
        notes[rowIndex] ?? []
      )
    );
    return dto;
  }).filter(hasMonthlyData);

  const extraColumns = rows[totalRowIndex - 1].map(
    (value) => SpreadsheetUtils.readText(value) ?? ""
  );
  const travelExpensesColumnIndex = SpreadsheetUtils.findColumn(extraColumns, "Viajes");
  const bonusesAndBenefitsColumnIndex = SpreadsheetUtils.findColumn(
    extraColumns,
    "Bonos, ayudas, renta"
  );
  const total = new AnnualTotalDTO();
  Object.assign(
    total,
    mapFinancialSummaryFields(
      headers,
      rows[totalRowIndex],
      notes[totalRowIndex] ?? []
    )
  );
  [total.travelExpenses, total.travelExpensesNote] = SpreadsheetUtils.readValueAndNote(
    rows[totalRowIndex][travelExpensesColumnIndex],
    notes[totalRowIndex]?.[travelExpensesColumnIndex]
  );
  [total.bonusesAndBenefits, total.bonusesAndBenefitsNote] = SpreadsheetUtils.readValueAndNote(
    rows[totalRowIndex][bonusesAndBenefitsColumnIndex],
    notes[totalRowIndex]?.[bonusesAndBenefitsColumnIndex]
  );

  const dto = new AnnualSummaryDTO();
  dto.year = year;
  dto.months = months;
  dto.total = total;
  dto.monthlyAverage = mapFinancialSummaryFields(
    headers,
    rows[mediaRowIndex],
    notes[mediaRowIndex] ?? []
  );
  return dto;
}
