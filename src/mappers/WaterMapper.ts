interface WaterRowIndexes {
  amount: number;
  consumption: number;
  pricePerLiter: number;
}

/**
 * Recorre los bloques anuales de la hoja y construye un DTO con sus doce meses.
 * Cada mes incluye importe, consumo y precio por litro, con sus notas.
 * @param sheet Hoja de cálculo que contiene los datos anuales de agua.
 * @returns Lista de DTO de agua, uno por cada año encontrado.
 */
function mapWaterData(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): WaterDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error(`Sheet "${sheet.getName()}" does not contain any data.`);
  }

  const result: WaterDTO[] = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const year = SpreadsheetUtils.readYear(rows[rowIndex][0]);
    if (year === null) {
      continue;
    }

    const monthHeaders = rows[rowIndex + 1];
    if (!monthHeaders) {
      throw new Error(`Sheet "${sheet.getName()}" does not contain the months for ${year}.`);
    }

    const monthColumns = SpreadsheetUtils.createMonthColumns(monthHeaders, 1);
    const endRowIndex = SpreadsheetUtils.findNextYearRow(rows, rowIndex + 2);
    const rowIndexes = findWaterRowIndexes(rows, rowIndex + 2, endRowIndex);
    const dto = new WaterDTO();
    dto.year = year;
    dto.months = monthColumns.map(({ month, index }) => {
      const monthDTO = new WaterDetailDTO();
      monthDTO.month = month;
      [monthDTO.amount, monthDTO.amountNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.amount][index],
        notes[rowIndexes.amount]?.[index]
      );
      [monthDTO.consumption, monthDTO.consumptionNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.consumption][index],
        notes[rowIndexes.consumption]?.[index]
      );
      [monthDTO.pricePerLiter, monthDTO.pricePerLiterNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.pricePerLiter][index],
        notes[rowIndexes.pricePerLiter]?.[index],
        false
      );
      return monthDTO;
    });
    result.push(dto);
    rowIndex = endRowIndex - 1;
  }

  return result;
}

/**
 * Localiza, dentro de los límites de un año, las filas etiquetadas como importe,
 * consumo y precio por litro. Lanza error si falta alguna de las tres.
 * @param rows Filas de valores de la hoja.
 * @param startRowIndex Índice de la primera fila del bloque anual que se examina.
 * @param endRowIndex Índice final del bloque anual, excluido.
 * @returns Índices de las filas de importe, consumo y precio por litro.
 */
function findWaterRowIndexes(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number
): WaterRowIndexes {
  return {
    amount: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("importe")
    ),
    consumption: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("consumo")
    ),
    pricePerLiter: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label === "€/l"
    )
  };
}
