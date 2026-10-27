const INVESTMENT_COLUMNS = {
  date: { index: 0, header: "Fecha" },
  banks: { index: 1, header: "Valor" },
  currentBankValue: { index: 2, header: "Valor actual" },
  moneyMarketFund: { index: 3, header: "Fondo monetario" },
  fixedIncome: { index: 4, header: "Neuberger" },
  monetaryValue: { index: 5, header: "Valor monetario" },
  equities: { index: 6, header: "Valor" },
  equitiesValue: { index: 10, header: "Valor renta variable" },
  contributed: { index: 7, header: "Aportado" },
  monthlyBenefit: { index: 8, header: "Beneficio mensual" },
  gain: { index: 9, header: "Ganancia" },
  aggregateValue: { index: 11, header: "Valor" },
  aggregateBenefit: { index: 12, header: "Beneficio mensual" },
  aggregateGain: { index: 13, header: "Ganancia" },
  aggregateTotalValue: { index: 14, header: "Valor total" },
  maximumHomePurcharsePrice: { index: 15, header: "Máxima vivienda" },
  homeEmergencyFund: { index: 16, header: "Colchón seguridad vivienda" },
  institution: { index: 19, header: "Entidad" },
  amount: { index: 20, header: "Importe" },
  startDate: { index: 21, header: "Fecha de inicio" },
  expirationDate: { index: 22, header: "Fecha de vencimiento" },
  nominalInterestRate: { index: 23, header: "T.I.N." },
  grossInterest: { index: 24, header: "Intereses brutos" },
  netInterest: { index: 25, header: "Intereses netos" },
  isActive: { index: 26, header: "Activo" }
} as const;

/**
 * Valida la estructura de columnas y crea los bloques de fondos y depósitos.
 * Lee valores y notas juntos para conservar las anotaciones en el DTO resultante.
 * @param sheet Hoja de cálculo que contiene fondos y depósitos.
 * @returns DTO con los registros de fondos, sus totales y los depósitos.
 */
function mapInvestments(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): InvestmentsDTO {
  const range = sheet.getDataRange();
  const rows: unknown[][] = range.getValues();
  const notes: string[][] = range.getNotes();
  if (rows.length < 2) {
    throw new Error("The sheet does not contain investment data.");
  }
  validateInvestmentHeaders(rows[1]);

  const funds = new FundRecordDTO();
  const firstMonthlyRow = findFirstMonthlyRow(rows);
  funds.items = mapMonthlyFundRecords(
    rows,
    notes,
    firstMonthlyRow
  );
  funds.totals = mapFundTotals(rows, notes);
  [funds.homeEmergencyFund, funds.homeEmergencyFundNote] = SpreadsheetUtils.readValueAndNote(
    rows[firstMonthlyRow][INVESTMENT_COLUMNS.homeEmergencyFund.index],
    notes[firstMonthlyRow]?.[INVESTMENT_COLUMNS.homeEmergencyFund.index]
  );

  const deposits = new DepositRecordDTO();
  deposits.items = mapDeposits(rows, notes);
  const totalActivosRowIndex = SpreadsheetUtils.findRowIndex(
    rows,
    0,
    rows.length,
    (label) => label === "total activos:",
    INVESTMENT_COLUMNS.amount.index - 1,
  );
  const totalInteresesRowIndex = SpreadsheetUtils.findRowIndex(
    rows,
    0,
    rows.length,
    (label) => label === "intereses totales:",
    INVESTMENT_COLUMNS.isActive.index - 1,
  );
  [deposits.totalAssetAmount, deposits.totalAssetAmountNote] = SpreadsheetUtils.readValueAndNote(
    rows[totalActivosRowIndex][INVESTMENT_COLUMNS.amount.index],
    notes[totalActivosRowIndex]?.[INVESTMENT_COLUMNS.amount.index]
  );
  [deposits.totalInterest, deposits.totalInterestNote] = SpreadsheetUtils.readValueAndNote(
    rows[totalInteresesRowIndex][INVESTMENT_COLUMNS.isActive.index],
    notes[totalInteresesRowIndex]?.[INVESTMENT_COLUMNS.isActive.index]
  );

  const dto = new InvestmentsDTO();
  dto.funds = funds;
  dto.deposits = deposits;
  return dto;
}

/**
 * Recorre las filas desde el primer registro, omite fechas vacías y exige fechas válidas.
 * Para cada fila crea bancos, fondos, renta variable y el activo Total del agregado.
 * @param rows Filas de valores de la hoja de inversiones.
 * @param notes Notas asociadas a las celdas de cada fila.
 * @param firstMonthlyRow Índice de la primera fila que puede contener un registro mensual.
 * @returns Registros mensuales de fondos con sus activos y valores de vivienda.
 */
function mapMonthlyFundRecords(
  rows: unknown[][],
  notes: string[][],
  firstMonthlyRow: number
): MonthlyFundRecordDTO[] {
  const result: MonthlyFundRecordDTO[] = [];
  for (let rowIndex = firstMonthlyRow; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const dateValue = row[INVESTMENT_COLUMNS.date.index];
    if (SpreadsheetUtils.readText(dateValue) === null) {
      continue;
    }

    const date = SpreadsheetUtils.readDate(dateValue);
    if (date === null) {
      throw new Error(`Row ${rowIndex + 1} does not contain a valid date.`);
    }

    const dto = new MonthlyFundRecordDTO();
    dto.date = date;
    dto.assets = [
      mapFundAsset(
        AssetType.Banks,
        row,
        notes[rowIndex],
        { value: INVESTMENT_COLUMNS.banks.index }
      ),
      mapFundAsset(
        AssetType.MoneyMarketFund,
        row,
        notes[rowIndex],
        { value: INVESTMENT_COLUMNS.moneyMarketFund.index }
      ),
      mapFundAsset(
        AssetType.FixedIncome,
        row,
        notes[rowIndex],
        { value: INVESTMENT_COLUMNS.fixedIncome.index }
      ),
      mapFundAsset(
        AssetType.Equities,
        row,
        notes[rowIndex],
        {
          value: INVESTMENT_COLUMNS.equities.index,
          contributed: INVESTMENT_COLUMNS.contributed.index,
          benefit: INVESTMENT_COLUMNS.monthlyBenefit.index,
          gain: INVESTMENT_COLUMNS.gain.index
        }
      ),
      mapFundAsset(
        AssetType.Total,
        row,
        notes[rowIndex],
        {
          value: INVESTMENT_COLUMNS.aggregateValue.index,
          benefit: INVESTMENT_COLUMNS.aggregateBenefit.index,
          gain: INVESTMENT_COLUMNS.aggregateGain.index
        }
      )
    ];
    [dto.maximumHomePurcharsePrice, dto.maximumHomePurcharsePriceNote] = SpreadsheetUtils.readValueAndNote(
      row[INVESTMENT_COLUMNS.maximumHomePurcharsePrice.index],
      notes[rowIndex]?.[INVESTMENT_COLUMNS.maximumHomePurcharsePrice.index]
    );
    result.push(dto);
  }

  if (result.length === 0) {
    throw new Error("The sheet does not contain monthly fund records.");
  }
  return result;
}

/**
 * Busca desde la primera fila de datos la primera celda no vacía de Fecha.
 * Devuelve su índice si contiene una fecha válida; falla ante fechas inválidas o ausentes.
 * @param rows Filas de valores de la hoja de inversiones.
 * @returns Índice de la primera fila con una fecha mensual válida.
 */
function findFirstMonthlyRow(
  rows: unknown[][]
): number {
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const value = rows[rowIndex][INVESTMENT_COLUMNS.date.index];
    if (SpreadsheetUtils.readText(value) === null) {
      continue;
    }
    if (SpreadsheetUtils.readDate(value) === null) {
      throw new Error(`Row ${rowIndex + 1} does not contain a valid date.`);
    }
    return rowIndex;
  }
  throw new Error("The sheet does not contain monthly fund records.");
}

/**
 * Compara los encabezados de la hoja con los nombres definidos junto a cada índice.
 * Normaliza acentos y mayúsculas; informa la posición esperada si detecta cambios.
 * @param headers Valores de la fila de encabezados que se van a validar.
 * @returns No devuelve valor; lanza un error si algún encabezado no coincide.
 */
function validateInvestmentHeaders(headers: unknown[]): void {
  for (const { index, header } of Object.values(INVESTMENT_COLUMNS)) {
    const actual = SpreadsheetUtils.readText(headers[index]);
    if (
      actual === null ||
      SpreadsheetUtils.normalizeLabel(actual) !== SpreadsheetUtils.normalizeLabel(header)
    ) {
      throw new Error(
        `Column ${index + 1} should be named "${header}".`
      );
    }
  }
}

/**
 * Mapea el valor principal y los campos disponibles para el tipo de activo.
 * Los campos sin columna configurada se representan como null, no como wrappers vacíos.
 * @param type Tipo de activo que identifica el registro.
 * @param row Fila de valores del registro mensual.
 * @param notes Notas asociadas a las celdas de la fila.
 * @param columns Índices de las columnas disponibles para este activo.
 * @returns DTO del activo con sus valores y notas configurados.
 */
function mapFundAsset(
  type: AssetType,
  row: unknown[],
  notes: string[],
  columns: {
    value: number;
    contributed?: number;
    benefit?: number;
    gain?: number;
  }
): FundAssetDTO {
  const dto = new FundAssetDTO();
  dto.type = type;
  [dto.value, dto.valueNote] = SpreadsheetUtils.readValueAndNote(
    row[columns.value],
    notes?.[columns.value]
  );
  if (columns.contributed !== undefined) {
    [dto.contributed, dto.contributedNote] = SpreadsheetUtils.readValueAndNote(
      row[columns.contributed],
      notes?.[columns.contributed]
    );
  }
  if (columns.benefit !== undefined) {
    [dto.benefit, dto.benefitNote] = SpreadsheetUtils.readValueAndNote(
      row[columns.benefit],
      notes?.[columns.benefit]
    );
  }
  if (columns.gain !== undefined) {
    [dto.gain, dto.gainNote] = SpreadsheetUtils.readPercentageAndNote(
      row[columns.gain],
      notes?.[columns.gain]
    );
  }
  return dto;
}

/**
 * Construye los totales de bancos, fondos, rentas y el activo Total del agregado.
 * Localiza los valores por etiqueta en las columnas resumen, sin fijar la fila concreta.
 * @param rows Filas de valores usadas para localizar las etiquetas y los totales.
 * @param notes Notas asociadas a las celdas de la hoja.
 * @returns Totales de cada tipo de activo, incluido el total agregado.
 */
function mapFundTotals(
  rows: unknown[][],
  notes: string[][]
): FundRecordTotalsDTO[] {
  return [
    createFundTotal(
      AssetType.Banks,
      readValueBelowLabel(
        rows,
        notes,
        INVESTMENT_COLUMNS.currentBankValue.index,
        "Valor actual"
      )
    ),
    createFundTotal(
      AssetType.MoneyMarketFund,
      readValueBelowLabel(
        rows,
        notes,
        INVESTMENT_COLUMNS.monetaryValue.index,
        "Valor monetario"
      )
    ),
    createFundTotal(
      AssetType.FixedIncome,
      readValueBelowLabel(
        rows,
        notes,
        INVESTMENT_COLUMNS.monetaryValue.index,
        "Valor renta fija"
      )
    ),
    createFundTotal(
      AssetType.Equities,
      readValueBelowLabel(
        rows,
        notes,
        INVESTMENT_COLUMNS.equitiesValue.index,
        "Valor renta variable"
      ),
      readValueBelowLabel(
        rows,
        notes,
        INVESTMENT_COLUMNS.equitiesValue.index,
        "Beneficio total"
      ),
      readValueBelowLabel(
        rows,
        notes,
        INVESTMENT_COLUMNS.equitiesValue.index,
        "Ganancia total",
        true
      )
    ),
    createFundTotal(
      AssetType.Total,
      readValueBelowLabel(
        rows,
        notes,
        INVESTMENT_COLUMNS.aggregateTotalValue.index,
        "Valor total"
      )
    )
  ];
}

/**
 * Asigna al DTO el tipo de activo y sus valores de valor, beneficio y ganancia.
 * Beneficio y ganancia son opcionales para activos que no tienen esos datos.
 * @param type Tipo de activo al que corresponden los valores.
 * @param value Valor total del activo y su nota.
 * @param benefit Beneficio del activo y su nota, o null si no aplica.
 * @param gain Porcentaje de ganancia y su nota, o null si no aplica.
 * @returns DTO con los valores y notas del total del activo.
 */
function createFundTotal(
  type: AssetType,
  value: [number | null, string | undefined],
  benefit: [number | null, string | undefined] | null = null,
  gain: [number | null, string | undefined] | null = null
): FundRecordTotalsDTO {
  const dto = new FundRecordTotalsDTO();
  dto.type = type;
  [dto.value, dto.valueNote] = value;
  if (benefit === null) {
    dto.benefit = null;
  } else {
    [dto.benefit, dto.benefitNote] = benefit;
  }
  if (gain === null) {
    dto.gain = null;
  } else {
    [dto.gain, dto.gainNote] = gain;
  }
  return dto;
}

/**
 * Busca el valor numérico que sigue a una etiqueta en una columna y conserva su nota.
 * Si percentage es true, convierte la fracción a porcentaje.
 * @param rows Filas de valores en las que buscar la etiqueta y el valor asociado.
 * @param notes Notas asociadas a las celdas de la hoja.
 * @param columnIndex Índice de la columna que contiene la etiqueta y su valor.
 * @param label Etiqueta que precede al valor que se quiere leer.
 * @param percentage Indica si el valor leído debe convertirse de fracción a porcentaje.
 * @returns Tupla con el valor numérico encontrado y su nota opcional.
 */
function readValueBelowLabel(
  rows: unknown[][],
  notes: string[][],
  columnIndex: number,
  label: string,
  percentage = false
): [number | null, string | undefined] {
  const rowIndex = findNextValueRow(
    rows,
    columnIndex,
    label
  );
  return percentage
    ? SpreadsheetUtils.readPercentageAndNote(
        rows[rowIndex][columnIndex],
        notes[rowIndex]?.[columnIndex]
      )
    : SpreadsheetUtils.readValueAndNote(
        rows[rowIndex][columnIndex],
        notes[rowIndex]?.[columnIndex]
      );
}

/**
 * Encuentra la etiqueta en la columna indicada y avanza hasta la primera celda numérica.
 * Así admite filas vacías entre etiqueta y valor; falla si no hay un número posterior.
 * @param rows Filas de valores de la hoja.
 * @param columnIndex Índice de la columna en la que buscar.
 * @param label Etiqueta cuya siguiente celda numérica se desea localizar.
 * @returns Índice de la primera fila posterior que contiene un número válido.
 */
function findNextValueRow(
  rows: unknown[][],
  columnIndex: number,
  label: string
): number {
  const labelRowIndex = SpreadsheetUtils.findRowIndex(
    rows,
    0,
    rows.length,
    (value) => value === SpreadsheetUtils.normalizeLabel(label),
    columnIndex,
  );
  for (let rowIndex = labelRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    if (SpreadsheetUtils.readNumber(rows[rowIndex][columnIndex]) !== null) {
      return rowIndex;
    }
  }
  throw new Error(`No numeric value was found after "${label}".`);
}

/**
 * Lee las filas con entidad como depósitos, excluyendo las etiquetas de deuda y total.
 * Exige fechas de inicio/vencimiento y estado Sí/No antes de construir cada DTO.
 * @param rows Filas de valores de la hoja de inversiones.
 * @param notes Notas asociadas a las celdas de cada fila.
 * @returns Depósitos encontrados con importes, fechas, intereses y estado.
 */
function mapDeposits(
  rows: unknown[][],
  notes: string[][]
): DepositDTO[] {
  const result: DepositDTO[] = [];
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const institution = SpreadsheetUtils.readText(row[INVESTMENT_COLUMNS.institution.index]);
    if (institution === null) {
      continue;
    }
    const label = SpreadsheetUtils.normalizeLabel(institution);
    if (label.startsWith("total activos:") || label.startsWith("deuda")) {
      continue;
    }

    const startDate = SpreadsheetUtils.readDate(row[INVESTMENT_COLUMNS.startDate.index]);
    const expirationDate = SpreadsheetUtils.readDate(
      row[INVESTMENT_COLUMNS.expirationDate.index]
    );
    if (startDate === null || expirationDate === null) {
      throw new Error(
        `Deposit "${institution}" in row ${rowIndex + 1} does not contain valid dates.`
      );
    }

    const activeStatus = SpreadsheetUtils.normalizeLabel(
      SpreadsheetUtils.readText(row[INVESTMENT_COLUMNS.isActive.index]) ?? ""
    );
    if (activeStatus !== "si" && activeStatus !== "no") {
      throw new Error(
        `Deposit "${institution}" in row ${rowIndex + 1} does not indicate whether it is active.`
      );
    }

    const dto = new DepositDTO();
    dto.institution = institution;
    [dto.amount, dto.amountNote] = SpreadsheetUtils.readValueAndNote(
      row[INVESTMENT_COLUMNS.amount.index],
      notes[rowIndex]?.[INVESTMENT_COLUMNS.amount.index]
    );
    dto.startDate = startDate;
    dto.expirationDate = expirationDate;
    [dto.nominalInterestRate, dto.nominalInterestRateNote] = SpreadsheetUtils.readPercentageAndNote(
      row[INVESTMENT_COLUMNS.nominalInterestRate.index],
      notes[rowIndex]?.[INVESTMENT_COLUMNS.nominalInterestRate.index]
    );
    [dto.grossInterest, dto.grossInterestNote] = SpreadsheetUtils.readValueAndNote(
      row[INVESTMENT_COLUMNS.grossInterest.index],
      notes[rowIndex]?.[INVESTMENT_COLUMNS.grossInterest.index]
    );
    [dto.netInterest, dto.netInterestNote] = SpreadsheetUtils.readValueAndNote(
      row[INVESTMENT_COLUMNS.netInterest.index],
      notes[rowIndex]?.[INVESTMENT_COLUMNS.netInterest.index]
    );
    dto.isActive = activeStatus === "si";
    result.push(dto);
  }
  return result;
}
