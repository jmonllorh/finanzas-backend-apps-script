/**
 * Recorre los bloques por año, valida sus encabezados mensuales y localiza la fila
 * de totales mediante su fórmula SUM. Las filas anteriores se tratan como gastos.
 */
function crearCategoriaGastosDTO(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): CategoriaGastosDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const formulas: string[][] = range.getFormulas();
  const notes: string[][] = range.getNotes();

  if (rows.length === 0) {
    throw new Error(`La hoja "${sheet.getName()}" no contiene datos.`);
  }

  const result: CategoriaGastosDTO[] = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const año = Utils.readYear(rows[rowIndex][0]);
    if (año === null) {
      continue;
    }

    const monthHeaders = rows[rowIndex + 1];
    if (!monthHeaders) {
      throw new Error(`La hoja "${sheet.getName()}" no contiene los meses del año ${año}.`);
    }

    const columnasMeses = Utils.createMonthColumns(monthHeaders, 0);
    const endYearRowIndex = Utils.findNextYearRow(rows, rowIndex + 2);
    let totalRowIndex = -1;

    for (let candidateIndex = rowIndex + 2; candidateIndex < endYearRowIndex; candidateIndex++) {
      const firstCellFormula = formulas[candidateIndex]?.[0] ?? "";
      if (/^=SUM\(/i.test(firstCellFormula.trim())) {
        totalRowIndex = candidateIndex;
        break;
      }
    }

    if (totalRowIndex === -1) {
      throw new Error(`No se encontró la fila de totales del año ${año} en "${sheet.getName()}".`);
    }

    result.push(
      crearCategoriaGastosDTODesdeFilas(
        año,
        columnasMeses,
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
 */
function crearCategoriaGastosDTODesdeFilas(
  año: number,
  columnasMeses: ColumnaMes[],
  filasGastos: unknown[][],
  notasGastos: string[][],
  filaTotales: unknown[],
  notasTotales: string[]
): CategoriaGastosDTO {
  const result = new CategoriaGastosDTO();
  result.año = año;
  result.meses = columnasMeses.map(({ mes, indice }) => {
    const mesDTO = new GastosCategoriaMensualDTO();
    mesDTO.mes = mes;
    const importes: (RegistroWrapperDTO | null)[] = filasGastos.map((row, rowIndex) => {
      const importe = Utils.createValueWrapper(
        row[indice],
        notasGastos[rowIndex]?.[indice],
        UnidadValue.Euro
      );
      if (importe.valor === null) {
        return null;
      }
      return importe;
    });
    mesDTO.importes = importes.filter(
      (importe): importe is RegistroWrapperDTO => importe !== null
    );
    mesDTO.total = Utils.createValueWrapper(
      filaTotales[indice],
      notasTotales[indice],
      UnidadValue.Euro
    );
    return mesDTO;
  });
  return result;
}
