/**
 * Recorre las filas de MyInvestor: las etiquetas de categoría actualizan la categoría
 * activa y las filas con datos generan un fondo con sus porcentajes, importes e ISIN.
 * Ignora las filas vacías.
 * @param sheet Hoja de cálculo con la distribución de fondos.
 * @returns Lista de fondos con sus categorías, valores, notas e identificadores.
 */
function mapFundAllocations(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): FundAllocationDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error(`Sheet "${sheet.getName()}" does not contain any data.`);
  }

  let currentCategory: FundCategory | null = null;
  const result: FundAllocationDTO[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const name = SpreadsheetUtils.readText(row[0]);
    if (name === null) {
      continue;
    }

    const category = getFundCategory(name);
    if (category) {
      currentCategory = category;
      continue;
    }

    if (row.slice(1, 6).every((value) => SpreadsheetUtils.readText(value) === null)) {
      continue;
    }

    const dto = new FundAllocationDTO();
    dto.category = currentCategory;
    dto.name = name;
    [dto.weight, dto.weightNote] = SpreadsheetUtils.readPercentageAndNote(
      row[1],
      notes[rowIndex]?.[1]
    );
    [dto.monthlyContribution, dto.monthlyContributionNote] = SpreadsheetUtils.readValueAndNote(
      row[2],
      notes[rowIndex]?.[2]
    );
    dto.isin = SpreadsheetUtils.readText(row[3]);
    dto.technicalName = SpreadsheetUtils.readText(row[4]);
    [dto.commission, dto.commissionNote] = SpreadsheetUtils.readPercentageAndNote(
      row[5],
      notes[rowIndex]?.[5]
    );
    result.push(dto);
  }

  return result;
}

/**
 * Compara la etiqueta normalizada con los valores de FundCategory y devuelve
 * la categoría correspondiente, o undefined cuando la fila no es una categoría.
 * @param label Texto leído de la fila que se quiere identificar como categoría.
 * @returns Categoría coincidente o undefined si la etiqueta no representa una categoría.
 */
function getFundCategory(
  label: string
): FundCategory | undefined {
  const normalizedLabel = SpreadsheetUtils.normalizeLabel(label);
  return Object.values(FundCategory).find(
    (category) => SpreadsheetUtils.normalizeLabel(category) === normalizedLabel
  );
}
