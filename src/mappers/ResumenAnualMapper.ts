/**
 * Aplica el mapper individual a cada hoja anual y conserva el orden recibido.
 */
function crearResumenesAnualesDTO(
  sheets: GoogleAppsScript.Spreadsheet.Sheet[]
): ResumenAnualDTO[] {
  return sheets.map((sheet) => crearResumenAnualDTO(sheet));
}

/**
 * Valida el año y las filas mensuales, localiza total y media mensual y mapea
 * sus campos financieros; añade viajes y bonos/ayudas/renta al total anual.
 */
function crearResumenAnualDTO(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): ResumenAnualDTO {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length < 2) {
    throw new Error(`La hoja "${sheet.getName()}" no contiene el resumen anual.`);
  }

  const año = Utils.readYear(rows[0][1]);
  if (año === null) {
    throw new Error(`No se encontró un año válido en la hoja "${sheet.getName()}".`);
  }

  const headers = rows[1];
  const totalRowIndex = Utils.findRowIndex(
    rows,
    2,
    rows.length,
    (label) => label.startsWith("total")
  );
  const mediaRowIndex = Utils.findRowIndex(
    rows,
    totalRowIndex + 1,
    rows.length,
    (label) => label.startsWith("media")
  );
  const mesesValidos: MesValue[] = Object.values(MesValue);
  const meses = mesesValidos.map((mes, indice) => {
    const rowIndex = indice + 2;
    const row = rows[rowIndex];
    if (!row || Utils.readText(row[0]) !== mes) {
      throw new Error(`No se encontró el mes "${mes}" en la hoja "${sheet.getName()}".`);
    }

    const dto = new ResumenMensualDTO();
    dto.mes = mes;
    Object.assign(
      dto,
      crearResumenCamposFinancierosDTO(
        headers,
        row,
        notes[rowIndex] ?? []
      )
    );
    return dto;
  });

  const columnasExtras = rows[totalRowIndex - 1].map(
    (value) => Utils.readText(value) ?? ""
  );
  const viajesColumnIndex = Utils.findColumn(columnasExtras, "Viajes");
  const bonosColumnIndex = Utils.findColumn(
    columnasExtras,
    "Bonos, ayudas, renta"
  );
  const total = new TotalAnualDTO();
  Object.assign(
    total,
    crearResumenCamposFinancierosDTO(
      headers,
      rows[totalRowIndex],
      notes[totalRowIndex] ?? []
    )
  );
  total.viajes = Utils.createValueWrapper(
    rows[totalRowIndex][viajesColumnIndex],
    notes[totalRowIndex]?.[viajesColumnIndex],
    UnidadValue.Euro
  );
  total.bonosAyudasRenta = Utils.createValueWrapper(
    rows[totalRowIndex][bonosColumnIndex],
    notes[totalRowIndex]?.[bonosColumnIndex],
    UnidadValue.Euro
  );

  const dto = new ResumenAnualDTO();
  dto.año = año;
  dto.meses = meses;
  dto.total = total;
  dto.mediaMensual = crearResumenCamposFinancierosDTO(
    headers,
    rows[mediaRowIndex],
    notes[mediaRowIndex] ?? []
  );
  return dto;
}
