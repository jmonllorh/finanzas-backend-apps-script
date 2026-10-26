interface ColumnasViaje {
  nombre: number;
  importe: number;
  comentario: number;
  total: number;
}

function crearViajesDTO(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): ViajesDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const formulas: string[][] = range.getFormulas();
  const notes: string[][] = range.getNotes();
  if (rows.length < 3) {
    throw new Error(`La hoja "${sheet.getName()}" no contiene viajes.`);
  }

  const result: ViajesDTO[] = [];
  for (let columnIndex = 0; columnIndex < rows[0].length; columnIndex++) {
    const año = Utils.readYear(rows[0][columnIndex]);
    if (año === null) {
      continue;
    }

    const columnas = crearColumnasViaje(rows[1], columnIndex);
    const totalRowIndex = encontrarFilaTotalAnual(
      rows,
      formulas,
      columnas
    );
    const dto = new ViajesDTO();
    dto.año = año;
    dto.viajes = crearViajesDelAño(
      rows,
      notes,
      columnas,
      totalRowIndex
    );
    dto.total = Utils.createValueWrapper(
      rows[totalRowIndex][columnas.total],
      notes[totalRowIndex]?.[columnas.total],
      UnidadValue.Euro
    );
    result.push(dto);
  }

  if (result.length === 0) {
    throw new Error(`No se encontraron años de viajes en "${sheet.getName()}".`);
  }
  return result;
}

function crearColumnasViaje(
  headers: unknown[],
  startColumn: number
): ColumnasViaje {
  const columnas: ColumnasViaje = {
    nombre: startColumn,
    importe: startColumn + 1,
    comentario: startColumn + 2,
    total: startColumn + 3
  };
  const expectedHeaders = ["viaje", "importes", "comentario", "total"];
  const columnIndexes = Object.values(columnas);
  for (let index = 0; index < expectedHeaders.length; index++) {
    const actualHeader = Utils.readText(headers[columnIndexes[index]]);
    if (
      actualHeader === null ||
      Utils.normalizeLabel(actualHeader) !== expectedHeaders[index]
    ) {
      throw new Error(
        `La columna ${columnIndexes[index] + 1} no contiene el encabezado "${expectedHeaders[index]}".`
      );
    }
  }
  return columnas;
}

function encontrarFilaTotalAnual(
  rows: unknown[][],
  formulas: string[][],
  columnas: ColumnasViaje
): number {
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const formula = formulas[rowIndex]?.[columnas.total]?.trim() ?? "";
    const nombreViaje = Utils.readText(rows[rowIndex][columnas.nombre]);
    const importe = rows[rowIndex][columnas.importe];
    const comentario = Utils.readText(rows[rowIndex][columnas.comentario]);
    const tieneDetalle = importe !== "" && importe !== null && importe !== undefined
      || comentario !== null;
    if (
      /^=SUM\(/i.test(formula) &&
      nombreViaje === null &&
      !tieneDetalle
    ) {
      return rowIndex;
    }
  }
  throw new Error(
    `No se encontró el total anual en la hoja.`
  );
}

function crearViajesDelAño(
  rows: unknown[][],
  notes: string[][],
  columnas: ColumnasViaje,
  totalRowIndex: number
): ViajeDTO[] {
  const result: ViajeDTO[] = [];
  let viajeActual: ViajeDTO | null = null;

  for (let rowIndex = 2; rowIndex < totalRowIndex; rowIndex++) {
    const row = rows[rowIndex];
    const nombre = Utils.readText(row[columnas.nombre]);
    if (nombre !== null) {
      viajeActual = new ViajeDTO();
      viajeActual.nombre = nombre;
      viajeActual.gastos = [];
      viajeActual.total = Utils.createValueWrapper(
        row[columnas.total],
        notes[rowIndex]?.[columnas.total],
        UnidadValue.Euro
      );
      result.push(viajeActual);
    }

    const importe = Utils.createValueWrapper(
      row[columnas.importe],
      notes[rowIndex]?.[columnas.importe],
      UnidadValue.Euro
    );
    const comentario = Utils.readText(row[columnas.comentario]);
    if (importe.valor === null && comentario === null) {
      continue;
    }
    if (viajeActual === null) {
      throw new Error(
        `Hay un gasto sin viaje en la fila ${rowIndex + 1}.`
      );
    }

    const gasto = new GastoViajeDTO();
    gasto.importe = importe;
    gasto.comentario = comentario;
    viajeActual.gastos.push(gasto);
  }

  return result;
}
