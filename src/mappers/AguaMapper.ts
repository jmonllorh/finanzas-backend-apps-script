interface ColumnaMesAgua {
  mes: MesValue;
  indice: number;
}

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
    const año = Utils.readNumber(rows[rowIndex][0]);
    if (año === null || !Number.isInteger(año) || año < 1900) {
      continue;
    }

    const monthHeaders = rows[rowIndex + 1];
    if (!monthHeaders) {
      throw new Error(`La hoja "${sheet.getName()}" no contiene los meses del año ${año}.`);
    }

    const columnasMeses = crearColumnasMesesAgua(monthHeaders);
    const endRowIndex = buscarFinBloqueAgua(rows, rowIndex + 2);
    const filas = buscarFilasAgua(rows, rowIndex + 2, endRowIndex);
    const dto = new AguaDTO();
    dto.año = año;
    dto.meses = columnasMeses.map(({ mes, indice }) => {
      const mesDTO = new AguaDetalleDTO();
      mesDTO.mes = mes;
      mesDTO.importe = crearValorAgua(
        rows,
        notes,
        filas.importe,
        indice,
        UnidadValue.Euro
      );
      mesDTO.consumo = crearValorAgua(
        rows,
        notes,
        filas.consumo,
        indice,
        UnidadValue.MetroCubico
      );
      mesDTO.precioPorLitro = crearValorAgua(
        rows,
        notes,
        filas.precioPorLitro,
        indice,
        UnidadValue.EuroPorLitro
      );
      return mesDTO;
    });
    result.push(dto);
    rowIndex = endRowIndex - 1;
  }

  return result;
}

function crearColumnasMesesAgua(headers: unknown[]): ColumnaMesAgua[] {
  const mesesValidos: MesValue[] = Object.values(MesValue);
  return mesesValidos.map((_, indice) => {
    const header = Utils.readText(headers[indice + 1]);
    const mes = mesesValidos.find((mesValido) => mesValido === header);
    if (!mes) {
      throw new Error(`El mes de la columna ${indice + 2} no es válido.`);
    }
    return { mes, indice: indice + 1 };
  });
}

function buscarFinBloqueAgua(rows: unknown[][], startRowIndex: number): number {
  for (let rowIndex = startRowIndex; rowIndex < rows.length; rowIndex++) {
    const año = Utils.readNumber(rows[rowIndex][0]);
    if (año !== null && Number.isInteger(año) && año >= 1900) {
      return rowIndex;
    }
  }
  return rows.length;
}

function buscarFilasAgua(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number
): FilasAgua {
  return {
    importe: encontrarFilaAgua(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("importe")
    ),
    consumo: encontrarFilaAgua(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("consumo")
    ),
    precioPorLitro: encontrarFilaAgua(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label === "€/l"
    )
  };
}

function encontrarFilaAgua(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number,
  matches: (label: string) => boolean
): number {
  for (let rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
    const label = Utils.readText(rows[rowIndex][0]);
    if (label && matches(normalizarConceptoAgua(label))) {
      return rowIndex;
    }
  }
  throw new Error(`No se encontró la fila en la hoja de agua.`);
}

function normalizarConceptoAgua(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function crearValorAgua(
  rows: unknown[][],
  notes: string[][],
  rowIndex: number,
  columnIndex: number,
  unidad: UnidadValue
): ValorWrapperDTO {
  const nota = Utils.readText(notes[rowIndex]?.[columnIndex]);
  return {
    valor: Utils.readNumber(rows[rowIndex][columnIndex]),
    unidad,
    ...(nota === null ? {} : { nota })
  };
}
