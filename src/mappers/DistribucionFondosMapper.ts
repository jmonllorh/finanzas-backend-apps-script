/**
 * Recorre las filas de MyInvestor: las etiquetas de categoría actualizan la categoría
 * activa y las filas con datos generan un fondo con sus porcentajes, importes e ISIN.
 * Ignora las filas vacías.
 */
function crearDistribucionFondosDTO(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): DistribucionFondoDTO[] {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length === 0) {
    throw new Error(`La hoja "${sheet.getName()}" no contiene datos.`);
  }

  let categoriaActual: CategoriaFondo | null = null;
  const result: DistribucionFondoDTO[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const nombre = Utils.readText(row[0]);
    if (nombre === null) {
      continue;
    }

    const categoria = obtenerCategoriaFondo(nombre);
    if (categoria) {
      categoriaActual = categoria;
      continue;
    }

    if (row.slice(1, 6).every((value) => value === "" || value === null)) {
      continue;
    }

    const dto = new DistribucionFondoDTO();
    dto.categoria = categoriaActual;
    dto.nombre = nombre;
    [dto.peso, dto.notaPeso] = Utils.readPercentageAndNote(
      row[1],
      notes[rowIndex]?.[1]
    );
    [dto.cantidadMensual, dto.notaCantidadMensual] = Utils.readValueAndNote(
      row[2],
      notes[rowIndex]?.[2]
    );
    dto.isin = Utils.readText(row[3]);
    dto.nombreTecnico = Utils.readText(row[4]);
    [dto.comision, dto.notaComision] = Utils.readPercentageAndNote(
      row[5],
      notes[rowIndex]?.[5]
    );
    result.push(dto);
  }

  return result;
}

/**
 * Compara la etiqueta normalizada con los valores de CategoriaFondo y devuelve
 * la categoría correspondiente, o undefined cuando la fila no es una categoría.
 */
function obtenerCategoriaFondo(
  label: string
): CategoriaFondo | undefined {
  const normalizedLabel = Utils.normalizeLabel(label);
  return Object.values(CategoriaFondo).find(
    (categoria) => Utils.normalizeLabel(categoria) === normalizedLabel
  );
}
