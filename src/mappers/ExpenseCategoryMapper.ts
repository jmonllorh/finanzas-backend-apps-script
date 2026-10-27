/**
 * Recorre los bloques por año, valida sus encabezados mensuales y localiza la fila
 * de totales mediante su fórmula SUM. Las filas anteriores se tratan como gastos.
 * @param sheet Hoja de cálculo de una categoría de gastos.
 * @returns Lista de DTO con los gastos mensuales de cada año encontrado.
 */
function mapExpenseCategories(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): ExpenseCategoryDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const formulas: string[][] = range.getFormulas();
  const notes: string[][] = range.getNotes();

  if (rows.length === 0) {
    throw new Error(`Sheet "${sheet.getName()}" does not contain any data.`);
  }

  const result: ExpenseCategoryDTO[] = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const year = SpreadsheetUtils.readYear(rows[rowIndex][0]);
    if (year === null) {
      continue;
    }

    const monthHeaders = rows[rowIndex + 1];
    if (!monthHeaders) {
      throw new Error(`Sheet "${sheet.getName()}" does not contain the months for ${year}.`);
    }

    const monthColumns = SpreadsheetUtils.createMonthColumns(monthHeaders, 0);
    const endYearRowIndex = SpreadsheetUtils.findNextYearRow(rows, rowIndex + 2);
    let totalRowIndex = -1;

    for (let candidateIndex = rowIndex + 2; candidateIndex < endYearRowIndex; candidateIndex++) {
      const firstCellFormula = formulas[candidateIndex]?.[0] ?? "";
      if (/^=SUM\(/i.test(firstCellFormula.trim())) {
        totalRowIndex = candidateIndex;
        break;
      }
    }

    if (totalRowIndex === -1) {
      throw new Error(`The totals row for ${year} was not found in "${sheet.getName()}".`);
    }

    result.push(
      mapExpenseCategoryFromRows(
        year,
        monthColumns,
        rows.slice(rowIndex + 2, totalRowIndex),
        notes.slice(rowIndex + 2, totalRowIndex),
        rows[totalRowIndex],
        notes[totalRowIndex]
      )
    );
    rowIndex = totalRowIndex;
  }

  return result;
}

/**
 * Construye los doce meses a partir de las filas del bloque. Omite importes vacíos,
 * conserva las notas de los importes y adjunta el total correspondiente a cada mes.
 * @param year Año al que pertenecen las filas de gastos.
 * @param monthColumns Columnas validadas que relacionan cada índice con su mes.
 * @param expenseRows Filas de gastos del bloque anual, excluida la fila de totales.
 * @param expenseNotes Notas de las celdas correspondientes a las filas de gastos.
 * @param totalsRow Fila con el importe total de cada mes.
 * @param totalNotes Notas asociadas a los totales mensuales.
 * @returns DTO de gastos con sus meses, importes y totales.
 */
function mapExpenseCategoryFromRows(
  year: number,
  monthColumns: MonthColumn[],
  expenseRows: unknown[][],
  expenseNotes: string[][],
  totalsRow: unknown[],
  totalNotes: string[]
): ExpenseCategoryDTO {
  const result = new ExpenseCategoryDTO();
  result.year = year;
  result.months = monthColumns.map(({ month, index }) => {
    const monthDTO = new MonthlyCategoryExpensesDTO();
    monthDTO.month = month;
    const amounts: (CategoryAmountDTO | null)[] = expenseRows.map((row, rowIndex) => {
      const [value, note] = SpreadsheetUtils.readValueAndNote(
        row[index],
        expenseNotes[rowIndex]?.[index]
      );
      if (value === null) {
        return null;
      }
      const amount = new CategoryAmountDTO();
      amount.value = value;
      amount.note = note;
      return amount;
    });
    monthDTO.amounts = amounts.filter(
      (amount): amount is CategoryAmountDTO => amount !== null
    );
    [monthDTO.total, monthDTO.totalNote] = SpreadsheetUtils.readValueAndNote(
      totalsRow[index],
      totalNotes[index]
    );
    return monthDTO;
  });
  return result;
}
