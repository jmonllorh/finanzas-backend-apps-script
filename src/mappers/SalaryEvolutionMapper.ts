interface SalaryEvolutionColumnIndexes {
  date: number;
  grossAnnualSalary: number;
  grossAnnualIncrease: number;
  netMonthlySalary: number;
  netMonthlyIncrease: number;
  comments: number;
}

/**
 * Lee los encabezados una vez, obtiene sus índices y procesa cada fila salarial.
 * Descarta filas completamente vacías y conserva las notas asociadas a los campos.
 * @param sheet Hoja de cálculo con los registros de evolución salarial.
 * @returns Lista de DTO salariales para las filas con datos.
 */
function mapSalaryEvolution(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): SalaryEvolutionDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error('Sheet "Evolución salario" does not contain headers.');
  }

  const headers = rows[0].map((value) => String(value).trim());
  const columns = getSalaryEvolutionColumnIndexes(headers);

  const result: SalaryEvolutionDTO[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row.every((value) => SpreadsheetUtils.readText(value) === null)) {
      continue;
    }

    result.push(mapSalaryEvolutionRow(row, notes[rowIndex], columns));
  }

  return result;
}

/**
 * Resuelve por nombre las columnas obligatorias de salario y comentarios.
 * Si falta un encabezado, SpreadsheetUtils.findColumn informa del error.
 * @param headers Encabezados de la hoja en el orden de sus columnas.
 * @returns Índices de las columnas necesarias para mapear cada registro salarial.
 */
function getSalaryEvolutionColumnIndexes(
  headers: string[]
): SalaryEvolutionColumnIndexes {
  return {
    date: SpreadsheetUtils.findColumn(headers, "Fecha"),
    grossAnnualSalary: SpreadsheetUtils.findColumn(headers, "Salario bruto anual"),
    grossAnnualIncrease: SpreadsheetUtils.findColumn(headers, "Incremento bruto anual"),
    netMonthlySalary: SpreadsheetUtils.findColumn(headers, "Salario neto mensual"),
    netMonthlyIncrease: SpreadsheetUtils.findColumn(headers, "Incremento neto mensual"),
    comments: SpreadsheetUtils.findColumn(headers, "Comentarios")
  };
}

/**
 * Convierte una fila en SalaryEvolutionDTO usando los índices previamente resueltos.
 * Los incrementos se expresan como porcentajes y el resto de importes en euros.
 * @param row Valores de una fila de datos salariales.
 * @param notes Notas asociadas a las celdas de la fila.
 * @param columns Índices de las columnas salariales resueltos desde los encabezados.
 * @returns DTO con los datos salariales y sus notas.
 */
function mapSalaryEvolutionRow(
  row: unknown[],
  notes: string[],
  columns: SalaryEvolutionColumnIndexes
): SalaryEvolutionDTO {
  const date = SpreadsheetUtils.readDate(row[columns.date]);
  const dto = new SalaryEvolutionDTO();
  dto.date = date;
  [dto.grossAnnualSalary, dto.grossAnnualSalaryNote] = SpreadsheetUtils.readValueAndNote(
    row[columns.grossAnnualSalary],
    notes[columns.grossAnnualSalary]
  );
  [dto.grossAnnualIncrease, dto.grossAnnualIncreaseNote] = SpreadsheetUtils.readPercentageAndNote(
    row[columns.grossAnnualIncrease],
    notes[columns.grossAnnualIncrease]
  );
  [dto.netMonthlySalary, dto.netMonthlySalaryNote] = SpreadsheetUtils.readValueAndNote(
    row[columns.netMonthlySalary],
    notes[columns.netMonthlySalary]
  );
  [dto.netMonthlyIncrease, dto.netMonthlyIncreaseNote] = SpreadsheetUtils.readPercentageAndNote(
    row[columns.netMonthlyIncrease],
    notes[columns.netMonthlyIncrease]
  );
  dto.comments = SpreadsheetUtils.readText(row[columns.comments]);
  return dto;
}
