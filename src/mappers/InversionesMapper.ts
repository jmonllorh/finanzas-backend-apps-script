const COLUMNAS_INVERSIONES = {
  fecha: { indice: 0, encabezado: "Fecha" },
  bancos: { indice: 1, encabezado: "Valor" },
  valorActualBancos: { indice: 2, encabezado: "Valor actual" },
  fondoMonetario: { indice: 3, encabezado: "Fondo monetario" },
  rentaFija: { indice: 4, encabezado: "Neuberger" },
  valorMonetario: { indice: 5, encabezado: "Valor monetario" },
  rentaVariable: { indice: 6, encabezado: "Valor" },
  valorRentaVariable: { indice: 10, encabezado: "Valor renta variable" },
  aportado: { indice: 7, encabezado: "Aportado" },
  beneficioMensual: { indice: 8, encabezado: "Beneficio mensual" },
  ganancia: { indice: 9, encabezado: "Ganancia" },
  valorAgregado: { indice: 11, encabezado: "Valor" },
  beneficioAgregado: { indice: 12, encabezado: "Beneficio mensual" },
  gananciaAgregado: { indice: 13, encabezado: "Ganancia" },
  valorTotalAgregado: { indice: 14, encabezado: "Valor total" },
  valorMaximoVivienda: { indice: 15, encabezado: "Máxima vivienda" },
  colchonSeguridadVivienda: { indice: 16, encabezado: "Colchón seguridad vivienda" },
  entidad: { indice: 19, encabezado: "Entidad" },
  importe: { indice: 20, encabezado: "Importe" },
  fechaInicio: { indice: 21, encabezado: "Fecha de inicio" },
  fechaVencimiento: { indice: 22, encabezado: "Fecha de vencimiento" },
  tin: { indice: 23, encabezado: "T.I.N." },
  interesesBrutos: { indice: 24, encabezado: "Intereses brutos" },
  interesesNetos: { indice: 25, encabezado: "Intereses netos" },
  activo: { indice: 26, encabezado: "Activo" }
} as const;

/**
 * Valida la estructura de columnas y crea los bloques de fondos y depósitos.
 * Lee valores y notas juntos para conservar las anotaciones en el DTO resultante.
 */
function crearInversionesDTO(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): InversionesDTO {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length < 2) {
    throw new Error("La hoja no contiene los datos de inversiones.");
  }
  validarEncabezadosInversiones(rows[1]);

  const fondos = new RegistroFondoDTO();
  const primeraFilaMensual = encontrarPrimeraFilaMensual(rows);
  fondos.items = crearRegistrosMensualesFondo(
    rows,
    notes,
    primeraFilaMensual
  );
  fondos.totales = crearTotalesFondo(rows, notes);
  fondos.colchonSeguridadVivienda = Utils.createValueWrapper(
    rows[primeraFilaMensual][COLUMNAS_INVERSIONES.colchonSeguridadVivienda.indice],
    notes[primeraFilaMensual]?.[COLUMNAS_INVERSIONES.colchonSeguridadVivienda.indice],
    UnidadValue.Euro
  );

  const depositos = new RegistroDepositoDTO();
  depositos.items = crearDepositos(rows, notes);
  const totalActivosRowIndex = Utils.findRowIndex(
    rows,
    0,
    rows.length,
    (label) => label === "total activos:",
    COLUMNAS_INVERSIONES.importe.indice - 1,
  );
  const totalInteresesRowIndex = Utils.findRowIndex(
    rows,
    0,
    rows.length,
    (label) => label === "intereses totales:",
    COLUMNAS_INVERSIONES.activo.indice - 1,
  );
  depositos.importeTotalActivos = Utils.createValueWrapper(
    rows[totalActivosRowIndex][COLUMNAS_INVERSIONES.importe.indice],
    notes[totalActivosRowIndex]?.[COLUMNAS_INVERSIONES.importe.indice],
    UnidadValue.Euro
  );
  depositos.interesesTotales = Utils.createValueWrapper(
    rows[totalInteresesRowIndex][COLUMNAS_INVERSIONES.activo.indice],
    notes[totalInteresesRowIndex]?.[COLUMNAS_INVERSIONES.activo.indice],
    UnidadValue.Euro
  );

  const dto = new InversionesDTO();
  dto.fondos = fondos;
  dto.depositos = depositos;
  return dto;
}

/**
 * Recorre las filas desde el primer registro, omite fechas vacías y exige fechas válidas.
 * Para cada fila crea bancos, fondos, renta variable y el activo Total del agregado.
 */
function crearRegistrosMensualesFondo(
  rows: unknown[][],
  notes: string[][],
  primeraFilaMensual: number
): RegistroMensualFondoDTO[] {
  const result: RegistroMensualFondoDTO[] = [];
  for (let rowIndex = primeraFilaMensual; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const fechaValue = row[COLUMNAS_INVERSIONES.fecha.indice];
    if (fechaValue === "" || fechaValue === null || fechaValue === undefined) {
      continue;
    }

    const fecha = Utils.readDate(fechaValue);
    if (fecha === null) {
      throw new Error(`La fila ${rowIndex + 1} no tiene una fecha válida.`);
    }

    const dto = new RegistroMensualFondoDTO();
    dto.fecha = fecha;
    dto.activos = [
      crearActivoFondo(
        TipoActivoValue.Bancos,
        row,
        notes[rowIndex],
        { valor: COLUMNAS_INVERSIONES.bancos.indice }
      ),
      crearActivoFondo(
        TipoActivoValue.FondoMonetario,
        row,
        notes[rowIndex],
        { valor: COLUMNAS_INVERSIONES.fondoMonetario.indice }
      ),
      crearActivoFondo(
        TipoActivoValue.RentaFija,
        row,
        notes[rowIndex],
        { valor: COLUMNAS_INVERSIONES.rentaFija.indice }
      ),
      crearActivoFondo(
        TipoActivoValue.RentaVariable,
        row,
        notes[rowIndex],
        {
          valor: COLUMNAS_INVERSIONES.rentaVariable.indice,
          aportado: COLUMNAS_INVERSIONES.aportado.indice,
          beneficio: COLUMNAS_INVERSIONES.beneficioMensual.indice,
          ganancia: COLUMNAS_INVERSIONES.ganancia.indice
        }
      ),
      crearActivoFondo(
        TipoActivoValue.Total,
        row,
        notes[rowIndex],
        {
          valor: COLUMNAS_INVERSIONES.valorAgregado.indice,
          beneficio: COLUMNAS_INVERSIONES.beneficioAgregado.indice,
          ganancia: COLUMNAS_INVERSIONES.gananciaAgregado.indice
        }
      )
    ];
    dto.valorMaximoVivienda = Utils.createValueWrapper(
      row[COLUMNAS_INVERSIONES.valorMaximoVivienda.indice],
      notes[rowIndex]?.[COLUMNAS_INVERSIONES.valorMaximoVivienda.indice],
      UnidadValue.Euro
    );
    result.push(dto);
  }

  if (result.length === 0) {
    throw new Error("La hoja no contiene registros mensuales de fondos.");
  }
  return result;
}

/**
 * Busca desde la primera fila de datos la primera celda no vacía de Fecha.
 * Devuelve su índice si contiene una fecha válida; falla ante fechas inválidas o ausentes.
 */
function encontrarPrimeraFilaMensual(
  rows: unknown[][]
): number {
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const value = rows[rowIndex][COLUMNAS_INVERSIONES.fecha.indice];
    if (value === "" || value === null || value === undefined) {
      continue;
    }
    if (Utils.readDate(value) === null) {
      throw new Error(`La fila ${rowIndex + 1} no tiene una fecha válida.`);
    }
    return rowIndex;
  }
  throw new Error("La hoja no contiene registros mensuales de fondos.");
}

/**
 * Compara los encabezados de la hoja con los nombres definidos junto a cada índice.
 * Normaliza acentos y mayúsculas; informa la posición esperada si detecta cambios.
 */
function validarEncabezadosInversiones(headers: unknown[]): void {
  for (const { indice, encabezado } of Object.values(COLUMNAS_INVERSIONES)) {
    const actual = Utils.readText(headers[indice]);
    if (
      actual === null ||
      Utils.normalizeLabel(actual) !== Utils.normalizeLabel(encabezado)
    ) {
      throw new Error(
        `La columna ${indice + 1} debería llamarse "${encabezado}".`
      );
    }
  }
}

/**
 * Mapea el valor principal y los campos disponibles para el tipo de activo.
 * Los campos sin columna configurada se representan como null, no como wrappers vacíos.
 */
function crearActivoFondo(
  tipo: TipoActivoValue,
  row: unknown[],
  notes: string[],
  columnas: {
    valor: number;
    aportado?: number;
    beneficio?: number;
    ganancia?: number;
  }
): ActivoFondoDTO {
  const dto = new ActivoFondoDTO();
  dto.tipo = tipo;
  dto.valor = Utils.createValueWrapper(
    row[columnas.valor],
    notes?.[columnas.valor],
    UnidadValue.Euro
  );
  dto.aportado =
    columnas.aportado === undefined
      ? null
      : Utils.createValueWrapper(
          row[columnas.aportado],
          notes?.[columnas.aportado],
          UnidadValue.Euro
        );
  dto.beneficio =
    columnas.beneficio === undefined
      ? null
      : Utils.createValueWrapper(
          row[columnas.beneficio],
          notes?.[columnas.beneficio],
          UnidadValue.Euro
        );
  dto.ganancia =
    columnas.ganancia === undefined
      ? null
      : Utils.createPercentageWrapper(
          row[columnas.ganancia],
          notes?.[columnas.ganancia]
        );
  return dto;
}

/**
 * Construye los totales de bancos, fondos, rentas y el activo Total del agregado.
 * Localiza los valores por etiqueta en las columnas resumen, sin fijar la fila concreta.
 */
function crearTotalesFondo(
  rows: unknown[][],
  notes: string[][]
): TotalesRegistroFondoDTO[] {
  return [
    crearTotalFondo(
      TipoActivoValue.Bancos,
      leerValorDebajoEtiqueta(
        rows,
        notes,
        COLUMNAS_INVERSIONES.valorActualBancos.indice,
        "Valor actual"
      )
    ),
    crearTotalFondo(
      TipoActivoValue.FondoMonetario,
      leerValorDebajoEtiqueta(
        rows,
        notes,
        COLUMNAS_INVERSIONES.valorMonetario.indice,
        "Valor monetario"
      )
    ),
    crearTotalFondo(
      TipoActivoValue.RentaFija,
      leerValorDebajoEtiqueta(
        rows,
        notes,
        COLUMNAS_INVERSIONES.valorMonetario.indice,
        "Valor renta fija"
      )
    ),
    crearTotalFondo(
      TipoActivoValue.RentaVariable,
      leerValorDebajoEtiqueta(
        rows,
        notes,
        COLUMNAS_INVERSIONES.valorRentaVariable.indice,
        "Valor renta variable"
      ),
      leerValorDebajoEtiqueta(
        rows,
        notes,
        COLUMNAS_INVERSIONES.valorRentaVariable.indice,
        "Beneficio total"
      ),
      leerValorDebajoEtiqueta(
        rows,
        notes,
        COLUMNAS_INVERSIONES.valorRentaVariable.indice,
        "Ganancia total",
        true
      )
    ),
    crearTotalFondo(
      TipoActivoValue.Total,
      leerValorDebajoEtiqueta(
        rows,
        notes,
        COLUMNAS_INVERSIONES.valorTotalAgregado.indice,
        "Valor total"
      )
    )
  ];
}

/**
 * Asigna al DTO el tipo de activo y sus wrappers de valor, beneficio y ganancia.
 * Beneficio y ganancia son opcionales para activos que no tienen esos datos.
 */
function crearTotalFondo(
  tipo: TipoActivoValue,
  valor: RegistroWrapperDTO,
  beneficio: RegistroWrapperDTO | null = null,
  ganancia: RegistroWrapperDTO | null = null
): TotalesRegistroFondoDTO {
  const dto = new TotalesRegistroFondoDTO();
  dto.tipo = tipo;
  dto.valor = valor;
  dto.beneficio = beneficio;
  dto.ganancia = ganancia;
  return dto;
}

/**
 * Busca el valor numérico que sigue a una etiqueta en una columna y conserva su nota.
 * Devuelve un wrapper en euros o, si percentage es true, convierte la fracción a porcentaje.
 */
function leerValorDebajoEtiqueta(
  rows: unknown[][],
  notes: string[][],
  columnIndex: number,
  label: string,
  percentage = false
): RegistroWrapperDTO {
  const rowIndex = encontrarFilaSiguienteValor(
    rows,
    columnIndex,
    label
  );
  return percentage
    ? Utils.createPercentageWrapper(
        rows[rowIndex][columnIndex],
        notes[rowIndex]?.[columnIndex]
      )
    : Utils.createValueWrapper(
        rows[rowIndex][columnIndex],
        notes[rowIndex]?.[columnIndex],
        UnidadValue.Euro
      );
}

/**
 * Encuentra la etiqueta en la columna indicada y avanza hasta la primera celda numérica.
 * Así admite filas vacías entre etiqueta y valor; falla si no hay un número posterior.
 */
function encontrarFilaSiguienteValor(
  rows: unknown[][],
  columnIndex: number,
  label: string
): number {
  const labelRowIndex = Utils.findRowIndex(
    rows,
    0,
    rows.length,
    (value) => value === Utils.normalizeLabel(label),
    columnIndex,
  );
  for (let rowIndex = labelRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    if (Utils.readNumber(rows[rowIndex][columnIndex]) !== null) {
      return rowIndex;
    }
  }
  throw new Error(`No se encontró un valor numérico después de "${label}".`);
}

/**
 * Lee las filas con entidad como depósitos, excluyendo las etiquetas de deuda y total.
 * Exige fechas de inicio/vencimiento y estado Sí/No antes de construir cada DTO.
 */
function crearDepositos(
  rows: unknown[][],
  notes: string[][]
): DepositoDTO[] {
  const result: DepositoDTO[] = [];
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const entidad = Utils.readText(row[COLUMNAS_INVERSIONES.entidad.indice]);
    if (entidad === null) {
      continue;
    }
    const etiqueta = Utils.normalizeLabel(entidad);
    if (etiqueta.startsWith("total activos:") || etiqueta.startsWith("deuda")) {
      continue;
    }

    const fechaInicio = Utils.readDate(row[COLUMNAS_INVERSIONES.fechaInicio.indice]);
    const fechaVencimiento = Utils.readDate(
      row[COLUMNAS_INVERSIONES.fechaVencimiento.indice]
    );
    if (fechaInicio === null || fechaVencimiento === null) {
      throw new Error(
        `El depósito "${entidad}" en la fila ${rowIndex + 1} no tiene fechas válidas.`
      );
    }

    const estadoActivo = Utils.normalizeLabel(
      Utils.readText(row[COLUMNAS_INVERSIONES.activo.indice]) ?? ""
    );
    if (estadoActivo !== "si" && estadoActivo !== "no") {
      throw new Error(
        `El depósito "${entidad}" en la fila ${rowIndex + 1} no indica si está activo.`
      );
    }

    const dto = new DepositoDTO();
    dto.entidad = entidad;
    dto.importe = Utils.createValueWrapper(
      row[COLUMNAS_INVERSIONES.importe.indice],
      notes[rowIndex]?.[COLUMNAS_INVERSIONES.importe.indice],
      UnidadValue.Euro
    );
    dto.fechaInicio = fechaInicio;
    dto.fechaVencimiento = fechaVencimiento;
    dto.tin = Utils.createPercentageWrapper(
      row[COLUMNAS_INVERSIONES.tin.indice],
      notes[rowIndex]?.[COLUMNAS_INVERSIONES.tin.indice]
    );
    dto.interesesBrutos = Utils.createValueWrapper(
      row[COLUMNAS_INVERSIONES.interesesBrutos.indice],
      notes[rowIndex]?.[COLUMNAS_INVERSIONES.interesesBrutos.indice],
      UnidadValue.Euro
    );
    dto.interesesNetos = Utils.createValueWrapper(
      row[COLUMNAS_INVERSIONES.interesesNetos.indice],
      notes[rowIndex]?.[COLUMNAS_INVERSIONES.interesesNetos.indice],
      UnidadValue.Euro
    );
    dto.activo = estadoActivo === "si";
    result.push(dto);
  }
  return result;
}
