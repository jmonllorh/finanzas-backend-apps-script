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
  const salarioBrutoAnual = Utils.createValueWrapper(
    row[columns.salarioBrutoAnual],
    notas[columns.salarioBrutoAnual],
    UnidadValue.Euro
  );
  const incrementoBrutoAnual = Utils.createPercentageWrapper(
    row[columns.incrementoBrutoAnual],
    notas[columns.incrementoBrutoAnual]
  );
  const salarioNetoMensual = Utils.createValueWrapper(
    row[columns.salarioNetoMensual],
    notas[columns.salarioNetoMensual],
    UnidadValue.Euro
  );
  const incrementoNetoMensual = Utils.createPercentageWrapper(
    row[columns.incrementoNetoMensual],
    notas[columns.incrementoNetoMensual]
  );
  const comentarios = Utils.readText(row[columns.comentarios]);

  const dto = new EvolucionSalarioDTO();
  dto.fecha = fecha;
  dto.salarioBrutoAnual = salarioBrutoAnual;
  dto.incrementoBrutoAnual = incrementoBrutoAnual;
  dto.salarioNetoMensual = salarioNetoMensual;
  dto.incrementoNetoMensual = incrementoNetoMensual;
  dto.comentarios = comentarios;
  return dto;
}
