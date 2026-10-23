interface ColumnasEvolucionSalario {
  fecha: number;
  salarioBrutoAnual: number;
  incrementoBrutoAnual: number;
  salarioNetoMensual: number;
  incrementoNetoMensual: number;
  comentarios: number;
}

function crearEvolucionSalarioDTOs(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): EvolucionSalarioDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error('La hoja "Evolución salario" no contiene encabezados.');
  }

  const headers = rows[0].map((value) => String(value).trim());
  const columns = crearColumnasEvolucionSalario(headers);

  const result: EvolucionSalarioDTO[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row.every((value) => value === "" || value === null)) {
      continue;
    }

    result.push(crearEvolucionSalarioDTODesdeFila(row, notes[rowIndex], columns));
  }

  return result;
}

function crearColumnasEvolucionSalario(
  headers: string[]
): ColumnasEvolucionSalario {
  return {
    fecha: Utils.findColumn(headers, "Fecha"),
    salarioBrutoAnual: Utils.findColumn(headers, "Salario bruto anual"),
    incrementoBrutoAnual: Utils.findColumn(headers, "Incremento bruto anual"),
    salarioNetoMensual: Utils.findColumn(headers, "Salario neto mensual"),
    incrementoNetoMensual: Utils.findColumn(headers, "Incremento neto mensual"),
    comentarios: Utils.findColumn(headers, "Comentarios")
  };
}

function crearEvolucionSalarioDTODesdeFila(
  row: unknown[],
  notas: string[],
  columns: ColumnasEvolucionSalario
): EvolucionSalarioDTO {
  const fecha = Utils.readDate(row[columns.fecha]);
  const salarioBrutoAnual = Utils.readNumber(row[columns.salarioBrutoAnual]);
  const incrementoBrutoAnual = Utils.readNumber(row[columns.incrementoBrutoAnual]);
  const salarioNetoMensual = Utils.readNumber(row[columns.salarioNetoMensual]);
  const incrementoNetoMensual = Utils.readNumber(row[columns.incrementoNetoMensual]);
  const comentarios = Utils.readText(row[columns.comentarios]);
  const notaSalarioBrutoAnual = Utils.readText(notas[columns.salarioBrutoAnual]);
  const notaIncrementoBrutoAnual = Utils.readText(notas[columns.incrementoBrutoAnual]);
  const notaSalarioNetoMensual = Utils.readText(notas[columns.salarioNetoMensual]);
  const notaIncrementoNetoMensual = Utils.readText(notas[columns.incrementoNetoMensual]);

  const dto = new EvolucionSalarioDTO();
  dto.fecha = fecha;
  dto.salarioBrutoAnual = {
    valor: salarioBrutoAnual,
    unidad: UnidadValue.Euro,
    ...(notaSalarioBrutoAnual === null ? {} : { nota: notaSalarioBrutoAnual })
  };
  dto.incrementoBrutoAnual = {
    valor: incrementoBrutoAnual === null ? null : incrementoBrutoAnual * 100,
    unidad: UnidadValue.Porcentaje,
    ...(notaIncrementoBrutoAnual === null ? {} : { nota: notaIncrementoBrutoAnual })
  };
  dto.salarioNetoMensual = {
    valor: salarioNetoMensual,
    unidad: UnidadValue.Euro,
    ...(notaSalarioNetoMensual === null ? {} : { nota: notaSalarioNetoMensual })
  };
  dto.incrementoNetoMensual = {
    valor: incrementoNetoMensual === null ? null : incrementoNetoMensual * 100,
    unidad: UnidadValue.Porcentaje,
    ...(notaIncrementoNetoMensual === null ? {} : { nota: notaIncrementoNetoMensual })
  };
  dto.comentarios = comentarios;
  return dto;
}
