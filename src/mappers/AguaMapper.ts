interface FilasAgua {
  importe: number;
  consumo: number;
  precioPorLitro: number;
}

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
      mesDTO.importe = Utils.createValueWrapper(
        rows[filas.importe][indice],
        notes[filas.importe]?.[indice],
        UnidadValue.Euro
      );
      mesDTO.consumo = Utils.createValueWrapper(
        rows[filas.consumo][indice],
        notes[filas.consumo]?.[indice],
        UnidadValue.MetroCubico
      );
      mesDTO.precioPorLitro = Utils.createValueWrapper(
        rows[filas.precioPorLitro][indice],
        notes[filas.precioPorLitro]?.[indice],
        UnidadValue.EuroPorLitro
      );
      return mesDTO;
    });
    result.push(dto);
    rowIndex = endRowIndex - 1;
  }

  return result;
}

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
