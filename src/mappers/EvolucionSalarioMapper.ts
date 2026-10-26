interface ColumnasEvolucionSalario {
  fecha: number;
  salarioBrutoAnual: number;
  incrementoBrutoAnual: number;
  salarioNetoMensual: number;
  incrementoNetoMensual: number;
  comentarios: number;
}

/**
 * Lee los encabezados una vez, obtiene sus índices y procesa cada fila salarial.
 * Descarta filas completamente vacías y conserva las notas asociadas a los campos.
 */
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

/**
 * Resuelve por nombre las columnas obligatorias de salario y comentarios.
 * Si falta un encabezado, Utils.findColumn informa del error.
 */
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

/**
 * Convierte una fila en EvolucionSalarioDTO usando los índices previamente resueltos.
 * Los incrementos se expresan como porcentajes y el resto de importes en euros.
 */
function crearEvolucionSalarioDTODesdeFila(
  row: unknown[],
  notas: string[],
  columns: ColumnasEvolucionSalario
): EvolucionSalarioDTO {
  const fecha = Utils.readDate(row[columns.fecha]);
  const dto = new EvolucionSalarioDTO();
  dto.fecha = fecha;
  [dto.salarioBrutoAnual, dto.notaSalarioBrutoAnual] = Utils.readValueAndNote(
    row[columns.salarioBrutoAnual],
    notas[columns.salarioBrutoAnual]
  );
  [dto.incrementoBrutoAnual, dto.notaIncrementoBrutoAnual] = Utils.readPercentageAndNote(
    row[columns.incrementoBrutoAnual],
    notas[columns.incrementoBrutoAnual]
  );
  [dto.salarioNetoMensual, dto.notaSalarioNetoMensual] = Utils.readValueAndNote(
    row[columns.salarioNetoMensual],
    notas[columns.salarioNetoMensual]
  );
  [dto.incrementoNetoMensual, dto.notaIncrementoNetoMensual] = Utils.readPercentageAndNote(
    row[columns.incrementoNetoMensual],
    notas[columns.incrementoNetoMensual]
  );
  dto.comentarios = Utils.readText(row[columns.comentarios]);
  return dto;
}
