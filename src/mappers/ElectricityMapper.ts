interface ElectricityRowIndexes {
  amount: number;
  consumption: number;
  energyPrice: number;
  peakPowerPrice: number;
  offPeakPowerPrice: number;
  totalPowerPrice: number;
}

/**
 * Recorre los bloques anuales, valida sus meses y mapea para cada mes el importe,
 * el consumo y los precios de energía y potencia, incluyendo sus notas.
 * @param sheet Hoja de cálculo con los datos anuales de electricidad.
 * @returns Lista de DTO de electricidad, uno por cada año encontrado.
 */
function mapElectricityData(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): ElectricityDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error(`Sheet "${sheet.getName()}" does not contain any data.`);
  }

  const result: ElectricityDTO[] = [];
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
    const rowIndexes = findElectricityRowIndexes(rows, rowIndex + 2, endRowIndex);
    const dto = new ElectricityDTO();
    dto.year = year;
    dto.months = monthColumns.map(({ month, index }) => {
      const monthDTO = new ElectricityDetailDTO();
      monthDTO.month = month;
      [monthDTO.amount, monthDTO.amountNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.amount][index],
        notes[rowIndexes.amount]?.[index]
      );
      [monthDTO.consumption, monthDTO.consumptionNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.consumption][index],
        notes[rowIndexes.consumption]?.[index]
      );
      const price = new ElectricityPriceDTO();
      [price.energyPrice, price.energyPriceNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.energyPrice][index],
        notes[rowIndexes.energyPrice]?.[index],
        false
      );
      [price.peakPowerPrice, price.peakPowerPriceNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.peakPowerPrice][index],
        notes[rowIndexes.peakPowerPrice]?.[index],
        false
      );
      [price.offPeakPowerPrice, price.offPeakPowerPriceNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.offPeakPowerPrice][index],
        notes[rowIndexes.offPeakPowerPrice]?.[index],
        false
      );
      [price.totalPowerPrice, price.totalPowerPriceNote] = SpreadsheetUtils.readValueAndNote(
        rows[rowIndexes.totalPowerPrice][index],
        notes[rowIndexes.totalPowerPrice]?.[index],
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
 * Busca las filas de importe, consumo, precio de energía y precios de potencia
 * por etiqueta dentro del bloque anual; los límites evitan cruzar al año siguiente.
 * @param rows Filas de valores de la hoja.
 * @param startRowIndex Índice de la primera fila del bloque anual que se examina.
 * @param endRowIndex Índice final del bloque anual, excluido.
 * @returns Índices de las filas de importes, consumo y precios.
 */
function findElectricityRowIndexes(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number
): ElectricityRowIndexes {
  return {
    amount: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("importe total")
    ),
    consumption: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("consumo total")
    ),
    energyPrice: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("energia €/kw")
    ),
    peakPowerPrice: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.includes("potencia") && label.includes("punta")
    ),
    offPeakPowerPrice: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.includes("potencia") && label.includes("valle")
    ),
    totalPowerPrice: SpreadsheetUtils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("potencia total")
    )
  };
}
