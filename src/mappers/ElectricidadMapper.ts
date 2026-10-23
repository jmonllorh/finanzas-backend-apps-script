// TODO- Refactorizar clase común
interface ColumnaMesElectricidad {
  mes: MesValue;
  indice: number;
}

interface FilasElectricidad {
  importe: number;
  consumo: number;
  precioEnergia: number;
  precioPotenciaPunta: number;
  precioPotenciaValle: number;
  precioPotenciaTotal: number;
}

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
    const año = Utils.readNumber(rows[rowIndex][0]);
    if (año === null || !Number.isInteger(año) || año < 1900) {
      continue;
    }

    const monthHeaders = rows[rowIndex + 1];
    if (!monthHeaders) {
      throw new Error(`La hoja "${sheet.getName()}" no contiene los meses del año ${año}.`);
    }

    const columnasMeses = crearColumnasMesesElectricidad(monthHeaders);
    const endRowIndex = buscarFinBloqueElectricidad(rows, rowIndex + 2);
    const filas = buscarFilasElectricidad(rows, rowIndex + 2, endRowIndex);
    const dto = new ElectricidadDTO();
    dto.año = año;
    dto.meses = columnasMeses.map(({ mes, indice }) => {
      const mesDTO = new ElectricidadDetalleDTO();
      mesDTO.mes = mes;
      mesDTO.importe = crearValorElectricidad(
        rows,
        notes,
        filas.importe,
        indice,
        UnidadValue.Euro
      );
      mesDTO.consumo = crearValorElectricidad(
        rows,
        notes,
        filas.consumo,
        indice,
        UnidadValue.Kilovatio
      );
      const precio = new ElectricidadPrecioDTO();
      precio.precioEnergia = crearValorElectricidad(
        rows,
        notes,
        filas.precioEnergia,
        indice,
        UnidadValue.EuroPorKilovatio
      );
      precio.precioPotenciaPunta = crearValorElectricidad(
        rows,
        notes,
        filas.precioPotenciaPunta,
        indice,
        UnidadValue.EuroPorKilovatio
      );
      precio.precioPotenciaValle = crearValorElectricidad(
        rows,
        notes,
        filas.precioPotenciaValle,
        indice,
        UnidadValue.EuroPorKilovatio
      );
      precio.precioPotenciaTotal = crearValorElectricidad(
        rows,
        notes,
        filas.precioPotenciaTotal,
        indice,
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

// TODO- Refactorizar método común
function crearColumnasMesesElectricidad(
  headers: unknown[]
): ColumnaMesElectricidad[] {
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

// TODO- Refactorizar en método común
function buscarFinBloqueElectricidad(rows: unknown[][], startRowIndex: number): number {
  for (let rowIndex = startRowIndex; rowIndex < rows.length; rowIndex++) {
    const año = Utils.readNumber(rows[rowIndex][0]);
    if (año !== null && Number.isInteger(año) && año >= 1900) {
      return rowIndex;
    }
  }
  return rows.length;
}

function buscarFilasElectricidad(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number
): FilasElectricidad {
  return {
    importe: encontrarFilaElectricidad(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("importe total")
    ),
    consumo: encontrarFilaElectricidad(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("consumo total")
    ),
    precioEnergia: encontrarFilaElectricidad(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("energia €/kw")
    ),
    precioPotenciaPunta: encontrarFilaElectricidad(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.includes("potencia") && label.includes("punta")
    ),
    precioPotenciaValle: encontrarFilaElectricidad(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.includes("potencia") && label.includes("valle")
    ),
    precioPotenciaTotal: encontrarFilaElectricidad(
      rows,
      startRowIndex,
      endRowIndex,
      (label) => label.startsWith("potencia total")
    )
  };
}

// TODO- Refactorizar método común
function encontrarFilaElectricidad(
  rows: unknown[][],
  startRowIndex: number,
  endRowIndex: number,
  matches: (label: string) => boolean
): number {
  for (let rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
    const label = Utils.readText(rows[rowIndex][0]);
    if (label && matches(normalizarConceptoElectricidad(label))) {
      return rowIndex;
    }
  }
  throw new Error(`No se encontró la fila en la hoja de electricidad.`);
}

// TODO- Refactorizar método común
function normalizarConceptoElectricidad(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// TODO- Refactorizar método común
function crearValorElectricidad(
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
