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
  const rows: unknown[][] = sheet.getDataRange().getValues();
  if (rows.length === 0) {
    throw new Error('La hoja "Evolución salario" no contiene encabezados.');
  }

  const headers = rows[0].map((value) => String(value).trim());
  const columns: ColumnasEvolucionSalario = {
    fecha: Utils.findColumn(headers, "Fecha"),
    salarioBrutoAnual: Utils.findColumn(headers, "Salario bruto anual"),
    incrementoBrutoAnual: Utils.findColumn(headers, "Incremento bruto anual"),
    salarioNetoMensual: Utils.findColumn(headers, "Salario neto mensual"),
    incrementoNetoMensual: Utils.findColumn(headers, "Incremento neto mensual"),
    comentarios: Utils.findColumn(headers, "Comentarios")
  };

  const result: EvolucionSalarioDTO[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row.every((value) => value === "" || value === null)) {
      continue;
    }

    result.push(crearEvolucionSalarioDTODesdeFila(row, columns));
  }

  return result;
}

function crearEvolucionSalarioDTODesdeFila(
  row: unknown[],
  columns: ColumnasEvolucionSalario
): EvolucionSalarioDTO {
  const fecha = Utils.readDate(row[columns.fecha]);
  const salarioBrutoAnual = Utils.readNumber(row[columns.salarioBrutoAnual]);
  const incrementoBrutoAnual = Utils.readNumber(row[columns.incrementoBrutoAnual]);
  const salarioNetoMensual = Utils.readNumber(row[columns.salarioNetoMensual]);
  const incrementoNetoMensual = Utils.readNumber(row[columns.incrementoNetoMensual]);
  const comentarios = Utils.readText(row[columns.comentarios]);

  const dto = new EvolucionSalarioDTO();
  dto.fecha = fecha;
  dto.salarioBrutoAnual = { valor: salarioBrutoAnual, unidad: UnidadDTO.Euro };
  dto.incrementoBrutoAnual = {
    valor: incrementoBrutoAnual === null ? null : incrementoBrutoAnual * 100,
    unidad: UnidadDTO.Porcentaje
  };
  dto.salarioNetoMensual = { valor: salarioNetoMensual, unidad: UnidadDTO.Euro };
  dto.incrementoNetoMensual = {
    valor: incrementoNetoMensual === null ? null : incrementoNetoMensual * 100,
    unidad: UnidadDTO.Porcentaje
  };
  dto.comentarios = comentarios;
  return dto;
}
