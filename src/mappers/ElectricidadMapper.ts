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
      mesDTO.importe = Utils.createValueWrapper(
        rows[filas.importe][indice],
        notes[filas.importe]?.[indice],
        UnidadValue.Euro
      );
      mesDTO.consumo = Utils.createValueWrapper(
        rows[filas.consumo][indice],
        notes[filas.consumo]?.[indice],
        UnidadValue.Kilovatio
      );
      const precio = new ElectricidadPrecioDTO();
      precio.precioEnergia = Utils.createValueWrapper(
        rows[filas.precioEnergia][indice],
        notes[filas.precioEnergia]?.[indice],
        UnidadValue.EuroPorKilovatio
      );
      precio.precioPotenciaPunta = Utils.createValueWrapper(
        rows[filas.precioPotenciaPunta][indice],
        notes[filas.precioPotenciaPunta]?.[indice],
        UnidadValue.EuroPorKilovatio
      );
      precio.precioPotenciaValle = Utils.createValueWrapper(
        rows[filas.precioPotenciaValle][indice],
        notes[filas.precioPotenciaValle]?.[indice],
        UnidadValue.EuroPorKilovatio
      );
      precio.precioPotenciaTotal = Utils.createValueWrapper(
        rows[filas.precioPotenciaTotal][indice],
        notes[filas.precioPotenciaTotal]?.[indice],
        UnidadValue.EuroPorKilovatio
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
