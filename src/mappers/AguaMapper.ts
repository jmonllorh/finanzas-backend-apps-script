interface FilasAgua {
  importe: number;
  consumo: number;
  precioPorLitro: number;
}

/**
 * Recorre los bloques anuales de la hoja y construye un DTO con sus doce meses.
 * Cada mes incluye importe, consumo y precio por litro, con sus notas.
 */
function crearAguaDTO(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): AguaDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error(`La hoja "${sheet.getName()}" no contiene datos.`);
  }

  const result: AguaDTO[] = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const año = Utils.readYear(rows[rowIndex][0]);
    if (año === null) {
      continue;
    }

    const monthHeaders = rows[rowIndex + 1];
    if (!monthHeaders) {
      throw new Error(`La hoja "${sheet.getName()}" no contiene los meses del año ${año}.`);
    }

    const columnasMeses = Utils.createMonthColumns(monthHeaders, 1);
    const endRowIndex = Utils.findNextYearRow(rows, rowIndex + 2);
    const filas = buscarFilasAgua(rows, rowIndex + 2, endRowIndex);
    const dto = new AguaDTO();
    dto.año = año;
    dto.meses = columnasMeses.map(({ mes, indice }) => {
      const mesDTO = new AguaDetalleDTO();
      mesDTO.mes = mes;
      [mesDTO.importe, mesDTO.notaImporte] = Utils.readValueAndNote(
        rows[filas.importe][indice],
        notes[filas.importe]?.[indice]
      );
      [mesDTO.consumo, mesDTO.notaConsumo] = Utils.readValueAndNote(
        rows[filas.consumo][indice],
        notes[filas.consumo]?.[indice]
      );
      [mesDTO.precioPorLitro, mesDTO.notaPrecioPorLitro] = Utils.readValueAndNote(
        rows[filas.precioPorLitro][indice],
        notes[filas.precioPorLitro]?.[indice],
        false
      );
      return mesDTO;
    });
    result.push(dto);
    rowIndex = endRowIndex - 1;
  }

  return result;
}

/**
 * Localiza, dentro de los límites de un año, las filas etiquetadas como importe,
 * consumo y precio por litro. Lanza error si falta alguna de las tres.
 */
function buscarFilasAgua(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number
): FilasAgua {
  return {
    importe: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("importe")
    ),
    consumo: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("consumo")
    ),
    precioPorLitro: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label === "€/l"
    )
  };
}
