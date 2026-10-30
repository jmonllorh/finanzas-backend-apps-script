interface GasRowIndexes {
  amount: number;
  consumption: number;
  fixedPrice: number;
  energyPrice: number;
}

/**
 * Mapea los bloques anuales de gas con sus doce meses, importes, consumo,
 * precios y notas de las celdas.
 * @param sheet Hoja de cálculo con los datos de gas.
 * @returns Lista de DTO de gas, uno por cada año encontrado.
 */
function mapGasData(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): GasDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error(`Sheet "${sheet.getName()}" does not contain any data.`);
  }

  const result: GasDTO[] = [];
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
    const rowIndexes = findGasRowIndexes(rows, rowIndex + 2, endRowIndex);
    const dto = new GasDTO();
    dto.year = year;
    dto.months = monthColumns.map(({ month, index }) => {
      const monthDTO = new GasDetailDTO();
      monthDTO.month = month;
      [monthDTO.amount, monthDTO.amountNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.amount][index],
        notes[rowIndexes.amount]?.[index]
      );
      [monthDTO.consumption, monthDTO.consumptionNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.consumption][index],
        notes[rowIndexes.consumption]?.[index]
      );
      const price = new GasPriceDTO();
      [price.fixedPrice, price.fixedPriceNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.fixedPrice][index],
        notes[rowIndexes.fixedPrice]?.[index]
      );
      [price.energyPrice, price.energyPriceNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.energyPrice][index],
        notes[rowIndexes.energyPrice]?.[index],
        false
      );
      monthDTO.price = price;
      return monthDTO;
    });
    result.push(dto);
    rowIndex = endRowIndex - 1;
  }

  return result;
}

/**
 * Localiza las cuatro filas de gas por sus etiquetas dentro de un bloque anual.
 * Lanza un error si falta un campo para evitar mezclar datos de distintos años.
 * @param rows Filas de valores de la hoja.
 * @param startRowIndex Primera fila de datos del bloque, incluida.
 * @param endRowIndex Límite del bloque anual, excluido.
 * @returns Índices del importe, consumo, precio fijo y precio de energía.
 */
function findGasRowIndexes(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number
): GasRowIndexes {
  return {
    amount: SpreadsheetUtils.findRowIndex(
      rows, startRowIndex, endRowIndex,
      (label) => label.startsWith("importe total")
    ),
    consumption: SpreadsheetUtils.findRowIndex(
      rows, startRowIndex, endRowIndex,
      (label) => label.startsWith("consumo total")
    ),
    fixedPrice: SpreadsheetUtils.findRowIndex(
      rows, startRowIndex, endRowIndex,
      (label) => label.startsWith("precio fijo")
    ),
    energyPrice: SpreadsheetUtils.findRowIndex(
      rows, startRowIndex, endRowIndex,
      (label) => label.startsWith("precio energia")
    )
  };
}
