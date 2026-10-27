/**
 * Localiza las filas de total y media mensual, mapea los años intermedios y añade
 * los campos financieros, los valores agregados y el bloque de activos.
 * @param sheet Hoja de cálculo que contiene el desglose financiero total.
 * @returns DTO con los valores por año, el total, la media mensual y los activos.
 */
function mapTotalBreakdown(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): TotalBreakdownDTO {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length < 2) {
    throw new Error(`Sheet "${sheet.getName()}" does not contain any data.`);
  }

  const headers = rows[0];
  const totalRowIndex = SpreadsheetUtils.findRowIndex(
    rows,
    1,
    rows.length,
    (label) => label === "total"
  );
  const mediaRowIndex = SpreadsheetUtils.findRowIndex(
    rows,
    totalRowIndex + 1,
    rows.length,
    (label) => label.startsWith("media mensual")
  );

  const years: FinancialBreakdownDTO[] = [];
  for (let rowIndex = 1; rowIndex < totalRowIndex; rowIndex++) {
    const year = SpreadsheetUtils.readYear(rows[rowIndex][0]);
    if (year === null) {
      continue;
    }
    years.push(
      mapFinancialBreakdownFromRow(
        headers,
        rows[rowIndex],
        notes[rowIndex] ?? [],
        year
      )
    );
  }
  if (years.length === 0) {
    throw new Error(`No years were found in sheet "${sheet.getName()}".`);
  }

  const dto = new TotalBreakdownDTO();
  dto.years = years;
  dto.total = mapFinancialBreakdownFromRow(
    headers,
    rows[totalRowIndex],
    notes[totalRowIndex] ?? [],
    null
  );
  dto.monthlyAverage = mapFinancialSummaryFields(
    headers,
    rows[mediaRowIndex],
    notes[mediaRowIndex] ?? []
  );
  dto.assets = mapBreakdownAssets(
    rows,
    notes,
    mediaRowIndex + 1
  );
  return dto;
}

/**
 * Convierte una fila anual o total en un DTO: primero asigna los campos financieros
 * compartidos y después mapea viajes, bonos/ayudas/renta e ingresos totales.
 * @param headers Encabezados de las columnas de la hoja.
 * @param row Fila de valores anuales o de totales que se va a convertir.
 * @param notes Notas asociadas a las celdas de la fila.
 * @param year Año de la fila, o null cuando corresponde a la fila de total.
 * @returns DTO con los campos financieros de la fila.
 */
function mapFinancialBreakdownFromRow(
  headers: unknown[],
  row: unknown[],
  notes: string[],
  year: number | null
): FinancialBreakdownDTO {
  const headerTexts = headers.map((value) => SpreadsheetUtils.readText(value) ?? "");
  const dto = new FinancialBreakdownDTO();
  dto.year = year;
  Object.assign(
    dto,
    mapFinancialSummaryFields(headers, row, notes)
  );
  [dto.travelExpenses, dto.travelExpensesNote] = getBreakdownValue(
    row,
    notes,
    headerTexts,
    "Viajes"
  );
  [dto.bonusesAndBenefits, dto.bonusesAndBenefitsNote] = getBreakdownValue(
    row,
    notes,
    headerTexts,
    "Bonos, ayudas, renta"
  );
  [dto.totalIncome, dto.totalIncomeNote] = getBreakdownValue(
    row,
    notes,
    headerTexts,
    "Ingresos totales"
  );
  return dto;
}

/**
 * Busca el encabezado exacto en la fila de cabeceras y devuelve su valor y nota.
 * Falla si la columna no está presente.
 * @param row Fila cuyos valores se van a leer.
 * @param notes Notas asociadas a las celdas de la fila.
 * @param headers Encabezados de columnas ya convertidos a texto.
 * @param header Encabezado exacto de la columna requerida.
 * @returns Tupla con el valor numérico de la columna y su nota opcional.
 */
function getBreakdownValue(
  row: unknown[],
  notes: string[],
  headers: string[],
  header: string,
): [number | null, string | undefined] {
  const columnIndex = headers.indexOf(header);
  if (columnIndex === -1) {
    throw new Error(`Column "${header}" was not found in the sheet.`);
  }
  return SpreadsheetUtils.readValueAndNote(
    row[columnIndex],
    notes[columnIndex]
  );
}

/**
 * Encuentra el inicio del bloque en «Bancos» y mapea cada activo hasta «Total»,
 * conservando el valor y las notas de cada fila.
 * @param rows Filas de valores de la hoja.
 * @param notes Notas asociadas a las celdas de la hoja.
 * @param startRowIndex Índice desde el que comienza la búsqueda del bloque de activos.
 * @returns Lista de activos desglosados, incluido el activo Total.
 */
function mapBreakdownAssets(
  rows: unknown[][],
  notes: string[][],
  startRowIndex: number,
): BreakdownAssetDTO[] {
  let startAssetsIndex = -1;
  for (let rowIndex = startRowIndex; rowIndex < rows.length; rowIndex++) {
    const label = SpreadsheetUtils.readText(rows[rowIndex][2]);
    if (label && SpreadsheetUtils.normalizeLabel(label) === "bancos") {
      startAssetsIndex = rowIndex;
      break;
    }
  }
  if (startAssetsIndex === -1) {
    throw new Error("The asset breakdown was not found in the sheet.");
  }

  const result: BreakdownAssetDTO[] = [];
  let hasTotal = false;
  for (let rowIndex = startAssetsIndex; rowIndex < rows.length; rowIndex++) {
    const label = SpreadsheetUtils.readText(rows[rowIndex][2]);
    if (label === null) {
      continue;
    }

    const type = SpreadsheetUtils.getBreakdownAssetType(label);
    const dto = new BreakdownAssetDTO();
    dto.type = type;
    [dto.value, dto.valueNote] = SpreadsheetUtils.readValueAndNote(
      rows[rowIndex][3],
      notes[rowIndex]?.[3]
    );
    result.push(dto);
    if (type === AssetType.Total) {
      hasTotal = true;
      break;
    }
  }

  if (!hasTotal) {
    throw new Error("The total assets row was not found in the sheet.");
  }
  return result;
}
