/**
 * Localiza las filas de total y media mensual, mapea los años intermedios y añade
 * los campos financieros, los valores agregados y el bloque de activos.
 */
function crearDesgloseTotalDTO(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): DesgloseTotalDTO {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length < 2) {
    throw new Error(`La hoja "${sheet.getName()}" no contiene datos.`);
  }

  const headers = rows[0];
  const totalRowIndex = Utils.findRowIndex(
    rows,
    1,
    rows.length,
    (label) => label === "total"
  );
  const mediaRowIndex = Utils.findRowIndex(
    rows,
    totalRowIndex + 1,
    rows.length,
    (label) => label.startsWith("media mensual")
  );

  const años: DesgloseFinancieroDTO[] = [];
  for (let rowIndex = 1; rowIndex < totalRowIndex; rowIndex++) {
    const año = Utils.readYear(rows[rowIndex][0]);
    if (año === null) {
      continue;
    }
    años.push(
      crearDesgloseFinancieroDesdeFila(
        headers,
        rows[rowIndex],
        notes[rowIndex] ?? [],
        año
      )
    );
  }
  if (años.length === 0) {
    throw new Error(`No se encontraron años en la hoja "${sheet.getName()}".`);
  }

  const dto = new DesgloseTotalDTO();
  dto.años = años;
  dto.total = crearDesgloseFinancieroDesdeFila(
    headers,
    rows[totalRowIndex],
    notes[totalRowIndex] ?? [],
    null
  );
  dto.mediaMensual = crearResumenCamposFinancierosDTO(
    headers,
    rows[mediaRowIndex],
    notes[mediaRowIndex] ?? []
  );
  dto.activos = crearActivosDesglosados(
    rows,
    notes,
    mediaRowIndex + 1
  );
  return dto;
}

/**
 * Convierte una fila anual o total en un DTO: primero asigna los campos financieros
 * compartidos y después mapea viajes, bonos/ayudas/renta e ingresos totales.
 */
function crearDesgloseFinancieroDesdeFila(
  headers: unknown[],
  row: unknown[],
  notes: string[],
  año: number | null
): DesgloseFinancieroDTO {
  const headerTexts = headers.map((value) => Utils.readText(value) ?? "");
  const dto = new DesgloseFinancieroDTO();
  dto.año = año;
  Object.assign(
    dto,
    crearResumenCamposFinancierosDTO(headers, row, notes)
  );
  [dto.viajes, dto.notaViajes] = crearValorDesgloseTotal(
    row,
    notes,
    headerTexts,
    "Viajes"
  );
  [dto.bonosAyudasRenta, dto.notaBonosAyudasRenta] = crearValorDesgloseTotal(
    row,
    notes,
    headerTexts,
    "Bonos, ayudas, renta"
  );
  [dto.ingresosTotales, dto.notaIngresosTotales] = crearValorDesgloseTotal(
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
 */
function crearValorDesgloseTotal(
  row: unknown[],
  notes: string[],
  headers: string[],
  header: string,
): [number | null, string | undefined] {
  const columnIndex = headers.indexOf(header);
  if (columnIndex === -1) {
    throw new Error(`No se encontró la columna "${header}" en la hoja.`);
  }
  return Utils.readValueAndNote(
    row[columnIndex],
    notes[columnIndex]
  );
}

/**
 * Encuentra el inicio del bloque en «Bancos» y mapea cada activo hasta «Total»,
 * conservando el valor y las notas de cada fila.
 */
function crearActivosDesglosados(
  rows: unknown[][],
  notes: string[][],
  startRowIndex: number,
): ActivoDesglosadoDTO[] {
  let startAssetsIndex = -1;
  for (let rowIndex = startRowIndex; rowIndex < rows.length; rowIndex++) {
    const label = Utils.readText(rows[rowIndex][2]);
    if (label && Utils.normalizeLabel(label) === "bancos") {
      startAssetsIndex = rowIndex;
      break;
    }
  }
  if (startAssetsIndex === -1) {
    throw new Error(`No se encontró el desglose de activos en la hoja.`);
  }

  const result: ActivoDesglosadoDTO[] = [];
  let hasTotal = false;
  for (let rowIndex = startAssetsIndex; rowIndex < rows.length; rowIndex++) {
    const label = Utils.readText(rows[rowIndex][2]);
    if (label === null) {
      continue;
    }

    const tipo = Utils.obtenerTipoActivoDesglosado(label);
    const dto = new ActivoDesglosadoDTO();
    dto.tipo = tipo;
    [dto.valor, dto.notaValor] = Utils.readValueAndNote(
      rows[rowIndex][3],
      notes[rowIndex]?.[3]
    );
    result.push(dto);
    if (tipo === TipoActivoValue.Total) {
      hasTotal = true;
      break;
    }
  }

  if (!hasTotal) {
    throw new Error(`No se encontró el total de activos en la hoja.`);
  }
  return result;
}
