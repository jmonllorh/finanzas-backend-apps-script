interface ColumnaMesCategoriaGastos {
  mes: MesValue;
  indice: number;
}

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
    const año = Utils.readNumber(rows[rowIndex][0]);
    if (año === null || !Number.isInteger(año) || año < 1900) {
      continue;
    }

    const monthHeaders = rows[rowIndex + 1];
    if (!monthHeaders) {
      throw new Error(`La hoja "${sheet.getName()}" no contiene los meses del año ${año}.`);
    }

    const columnasMeses = crearColumnasMeses(monthHeaders);
    let totalRowIndex = -1;

    for (let candidateIndex = rowIndex + 2; candidateIndex < rows.length; candidateIndex++) {
      const candidateYear = Utils.readNumber(rows[candidateIndex][0]);
      if (candidateYear !== null && Number.isInteger(candidateYear) && candidateYear >= 1900) {
        break;
      }

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

function crearColumnasMeses(
  headers: unknown[]
): ColumnaMesCategoriaGastos[] {
  const mesesValidos: MesValue[] = Object.values(MesValue);
  return mesesValidos.map((_, indice) => {
    const header = Utils.readText(headers[indice]);
    const mes = mesesValidos.find((mesValido) => mesValido === header);
    if (!mes) {
      throw new Error(`El mes de la columna ${indice + 1} no es válido.`);
    }
    return { mes, indice };
  });
}

function crearCategoriaGastosDTODesdeFilas(
  año: number,
  columnasMeses: ColumnaMesCategoriaGastos[],
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
    const importes: (ValorWrapperDTO | null)[] = filasGastos.map(
      (row, rowIndex) => {
        const importe = Utils.readNumber(row[indice]);
        if (importe === null) {
          return null;
        }

        const nota = Utils.readText(notasGastos[rowIndex]?.[indice]);
        return {
          valor: importe,
          unidad: UnidadValue.Euro,
          ...(nota === null ? {} : { nota })
        };
      }
    );
    mesDTO.importes = importes.filter(
      (importe): importe is ValorWrapperDTO => importe !== null
    );
    const notaTotal = Utils.readText(notasTotales[indice]);
    mesDTO.total = {
      valor: Utils.readNumber(filaTotales[indice]),
      unidad: UnidadValue.Euro,
      ...(notaTotal === null ? {} : { nota: notaTotal })
    };
    return mesDTO;
  });
  return result;
}
