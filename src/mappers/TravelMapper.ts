interface TravelColumnIndexes {
  name: number;
  amount: number;
  comment: number;
  total: number;
}

/**
 * Recorre la fila superior para descubrir los años y valida el bloque de cuatro columnas
 * de cada uno. Mapea viajes y gastos hasta la fila con la fórmula del total anual.
 * @param sheet Hoja de cálculo que contiene los viajes organizados por año.
 * @returns Lista de DTO de viajes, uno por cada año encontrado.
 */
function mapTravelData(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): TravelDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const formulas: string[][] = range.getFormulas();
  const notes: string[][] = range.getNotes();
  if (rows.length < 3) {
    throw new Error(`Sheet "${sheet.getName()}" does not contain any trips.`);
  }

  const result: TravelDTO[] = [];
  for (let columnIndex = 0; columnIndex < rows[0].length; columnIndex++) {
    const year = SpreadsheetUtils.readYear(rows[0][columnIndex]);
    if (year === null) {
      continue;
    }

    const columns = getTravelColumnIndexes(rows[1], columnIndex);
    const totalRowIndex = findAnnualTotalRow(
      rows,
      formulas,
      columns
    );
    const dto = new TravelDTO();
    dto.year = year;
    dto.trips = mapTripsForYear(
      rows,
      notes,
      columns,
      totalRowIndex
    );
    [dto.total, dto.totalNote] = SpreadsheetUtils.readValueAndNote(
      rows[totalRowIndex][columns.total],
      notes[totalRowIndex]?.[columns.total]
    );
    result.push(dto);
  }

  if (result.length === 0) {
    throw new Error(`No trip years were found in "${sheet.getName()}".`);
  }
  return result;
}

/**
 * Comprueba que el bloque tenga las columnas Viaje, Importes, Comentario y Total
 * en el orden esperado, y devuelve sus índices absolutos dentro de la hoja.
 * @param headers Valores de la fila con los encabezados de columnas.
 * @param startColumn Índice de la primera columna del bloque anual.
 * @returns Índices absolutos de las columnas de nombre, importe, comentario y total.
 */
function getTravelColumnIndexes(
  headers: unknown[],
  startColumn: number
): TravelColumnIndexes {
  const columns: TravelColumnIndexes = {
    name: startColumn,
    amount: startColumn + 1,
    comment: startColumn + 2,
    total: startColumn + 3
  };
  const expectedHeaders = ["viaje", "importes", "comentario", "total"];
  const columnIndexes = Object.values(columns);
  for (let index = 0; index < expectedHeaders.length; index++) {
    const actualHeader = SpreadsheetUtils.readText(headers[columnIndexes[index]]);
    if (
      actualHeader === null ||
      SpreadsheetUtils.normalizeLabel(actualHeader) !== expectedHeaders[index]
    ) {
      throw new Error(
        `Column ${columnIndexes[index] + 1} does not contain the "${expectedHeaders[index]}" header.`
      );
    }
  }
  return columns;
}

/**
 * Busca una fórmula SUM en la columna Total que no pertenezca a un viaje ni a un gasto.
 * Devuelve esa fila como límite del bloque o lanza error si no encuentra el total.
 * @param rows Filas de valores de la hoja.
 * @param formulas Fórmulas de las celdas, alineadas con las filas de valores.
 * @param columns Índices de las columnas del bloque de viajes.
 * @returns Índice de la fila que contiene el total anual; lanza un error si falta.
 */
function findAnnualTotalRow(
  rows: unknown[][],
  formulas: string[][],
  columns: TravelColumnIndexes
): number {
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const formula = formulas[rowIndex]?.[columns.total]?.trim() ?? "";
    const tripName = SpreadsheetUtils.readText(rows[rowIndex][columns.name]);
    const amount = rows[rowIndex][columns.amount];
    const comment = SpreadsheetUtils.readText(rows[rowIndex][columns.comment]);
    const tieneDetalle = SpreadsheetUtils.readText(amount) !== null || comment !== null;
    if (
      /^=SUM\(/i.test(formula) &&
      tripName === null &&
      !tieneDetalle
    ) {
      return rowIndex;
    }
  }
  throw new Error(
    "The annual total was not found in the sheet."
  );
}

/**
 * Crea un viaje al encontrar su nombre y añade los gastos de las filas siguientes.
 * Las celdas combinadas dejan el nombre vacío en filas posteriores, que continúan
 * asociándose al viaje actual; un gasto sin viaje se considera un error.
 * @param rows Filas de valores de la hoja.
 * @param notes Notas asociadas a las celdas de cada fila.
 * @param columns Índices de las columnas del bloque de viajes.
 * @param totalRowIndex Índice de la fila que cierra los datos de ese año.
 * @returns Lista de viajes y sus gastos hasta la fila de total anual.
 */
function mapTripsForYear(
  rows: unknown[][],
  notes: string[][],
  columns: TravelColumnIndexes,
  totalRowIndex: number
): TripDTO[] {
  const result: TripDTO[] = [];
  let currentTrip: TripDTO | null = null;

  for (let rowIndex = 2; rowIndex < totalRowIndex; rowIndex++) {
    const row = rows[rowIndex];
    const name = SpreadsheetUtils.readText(row[columns.name]);
    if (name !== null) {
      currentTrip = new TripDTO();
      currentTrip.name = name;
      currentTrip.expenses = [];
      [currentTrip.total, currentTrip.totalNote] = SpreadsheetUtils.readValueAndNote(
        row[columns.total],
        notes[rowIndex]?.[columns.total]
      );
      result.push(currentTrip);
    }

    const [amount, amountNote] = SpreadsheetUtils.readValueAndNote(
      row[columns.amount],
      notes[rowIndex]?.[columns.amount]
    );
    const comment = SpreadsheetUtils.readText(row[columns.comment]);
    if (amount === null && comment === null) {
      continue;
    }
    if (currentTrip === null) {
      throw new Error(
        `An expense without a trip was found in row ${rowIndex + 1}.`
      );
    }

    const expense = new TripExpenseDTO();
    expense.amount = amount;
    expense.amountNote = amountNote;
    expense.comment = comment;
    currentTrip.expenses.push(expense);
  }

  return result;
}
