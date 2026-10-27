interface FilasElectricidad {
  importe: number;
  consumo: number;
  precioEnergia: number;
  precioPotenciaPunta: number;
  precioPotenciaValle: number;
  precioPotenciaTotal: number;
}

/**
 * Recorre los bloques anuales, valida sus meses y mapea para cada mes el importe,
 * el consumo y los precios de energía y potencia, incluyendo sus notas.
 * @param sheet Hoja de cálculo con los datos anuales de electricidad.
 * @returns Lista de DTO de electricidad, uno por cada año encontrado.
 */
function crearElectricidadDTO(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): ElectricidadDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error(`La hoja "${sheet.getName()}" no contiene datos.`);
  }

  const result: ElectricidadDTO[] = [];
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
    const filas = buscarFilasElectricidad(rows, rowIndex + 2, endRowIndex);
    const dto = new ElectricidadDTO();
    dto.año = año;
    dto.meses = columnasMeses.map(({ mes, indice }) => {
      const mesDTO = new ElectricidadDetalleDTO();
      mesDTO.mes = mes;
      [mesDTO.importe, mesDTO.notaImporte] = Utils.readValueAndNote(
        rows[filas.importe][indice],
        notes[filas.importe]?.[indice]
      );
      [mesDTO.consumo, mesDTO.notaConsumo] = Utils.readValueAndNote(
        rows[filas.consumo][indice],
        notes[filas.consumo]?.[indice]
      );
      const precio = new ElectricidadPrecioDTO();
      [precio.precioEnergia, precio.notaPrecioEnergia] = Utils.readValueAndNote(
        rows[filas.precioEnergia][indice],
        notes[filas.precioEnergia]?.[indice],
        false
      );
      [precio.precioPotenciaPunta, precio.notaPrecioPotenciaPunta] = Utils.readValueAndNote(
        rows[filas.precioPotenciaPunta][indice],
        notes[filas.precioPotenciaPunta]?.[indice],
        false
      );
      [precio.precioPotenciaValle, precio.notaPrecioPotenciaValle] = Utils.readValueAndNote(
        rows[filas.precioPotenciaValle][indice],
        notes[filas.precioPotenciaValle]?.[indice],
        false
      );
      [precio.precioPotenciaTotal, precio.notaPrecioPotenciaTotal] = Utils.readValueAndNote(
        rows[filas.precioPotenciaTotal][indice],
        notes[filas.precioPotenciaTotal]?.[indice],
        false
      );
      mesDTO.precio = precio;
      return mesDTO;
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
function buscarFilasElectricidad(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number
): FilasElectricidad {
  return {
    importe: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("importe total")
    ),
    consumo: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("consumo total")
    ),
    precioEnergia: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("energia €/kw")
    ),
    precioPotenciaPunta: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.includes("potencia") && label.includes("punta")
    ),
    precioPotenciaValle: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.includes("potencia") && label.includes("valle")
    ),
    precioPotenciaTotal: Utils.findRowIndex(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("potencia total")
    )
  };
}
