interface MonthColumn {
  month: Month;
  index: number;
}

class SpreadsheetUtils {
  /**
   * Convierte un valor de celda a texto y elimina los espacios al principio y al final.
   * Trata cadenas vacías o compuestas solo por espacios, null y undefined como ausencia de valor.
   * @param value Valor leído de la celda que se desea convertir.
   * @returns El texto convertido y recortado o null si el valor está vacío.
   */
  static readText(value: unknown): string | null {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const text = String(value).trim();
    return text === "" ? null : text;
  }

  /**
   * Convierte números o cadenas numéricas a number y los redondea a dos decimales.
   * Devuelve null para celdas vacías, valores no numéricos o números no finitos.
   * @param value Valor numérico o cadena numérica leído de la hoja.
   * @returns El número redondeado a dos decimales o null si no es válido.
   */
  static readNumber(value: unknown): number | null {
    const number = SpreadsheetUtils.parseNumber(value);
    return number === null ? null : SpreadsheetUtils.roundToTwoDecimals(number);
  }

  /**
   * Convierte números o cadenas numéricas sin redondear.
   * Devuelve null para celdas vacías, valores no numéricos o números no finitos.
   * @param value Valor numérico o cadena numérica que se desea interpretar.
   * @returns El número finito convertido o null si el valor está vacío o no es numérico.
   */
  private static parseNumber(value: unknown): number | null {
    if (value === null || (typeof value === "string" && value.trim() === "")) {
      return null;
    }
    const number = typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
    return Number.isFinite(number) ? number : null;
  }

  /**
   * Redondea al centésimo más cercano y evita errores binarios en los casos límite.
   * @param value Número que se desea redondear.
   * @returns El número redondeado a dos decimales.
   */
  private static roundToTwoDecimals(value: number): number {
    const sign = Math.sign(value);
    return sign * Math.round((Math.abs(value) + Number.EPSILON) * 100) / 100;
  }

  /**
   * Lee el valor como número y lo acepta como año solo si es entero y >= 1900.
   * Devuelve null si no cumple esas condiciones.
   * @param value Valor de celda que podría representar un año.
   * @returns El año entero válido o null si el valor no cumple los criterios.
   */
  static readYear(value: unknown): number | null {
    const year = SpreadsheetUtils.readNumber(value);
    return year !== null && Number.isInteger(year) && year >= 1900
      ? year
      : null;
  }

  /**
   * Valida los doce encabezados de mes, en el orden de Month, desde la columna inicial.
   * Devuelve cada mes junto al índice de su columna y falla si algún encabezado no coincide.
   * @param headers Valores de las celdas que forman la fila de encabezados.
   * @param firstMonthColumnIndex Índice base de la primera columna de mes.
   * @returns Las doce columnas validadas, cada una asociada con su mes.
   */
  static createMonthColumns(
    headers: unknown[],
    firstMonthColumnIndex: number
  ): MonthColumn[] {
    const validMonths: Month[] = Object.values(Month);
    return validMonths.map((_, monthIndex) => {
      const columnIndex = firstMonthColumnIndex + monthIndex;
      const header = SpreadsheetUtils.readText(headers[columnIndex]);
      const month = validMonths.find((validMonth) => validMonth === header);
      if (!month) {
        throw new Error(`The month in column ${columnIndex + 1} is invalid.`);
      }
      return { month: month, index: columnIndex };
    });
  }

  /**
   * Busca desde startRowIndex la siguiente fila cuyo primer valor sea un año válido.
   * Si no encuentra otro bloque anual, devuelve rows.length.
   * @param rows Filas de valores de la hoja.
   * @param startRowIndex Índice desde el que comienza la búsqueda, incluido.
   * @returns Índice de la siguiente fila anual o rows.length si no existe.
   */
  static findNextYearRow(rows: unknown[][], startRowIndex: number): number {
    for (let rowIndex = startRowIndex; rowIndex < rows.length; rowIndex++) {
      if (SpreadsheetUtils.readYear(rows[rowIndex][0]) !== null) {
        return rowIndex;
      }
    }
    return rows.length;
  }

  /**
   * Normaliza etiquetas para compararlas sin distinguir acentos, mayúsculas ni espacios extremos.
   * No elimina otros signos ni modifica los espacios interiores.
   * @param value Etiqueta original que se desea normalizar.
   * @returns Etiqueta en minúsculas, sin diacríticos y sin espacios extremos.
   */
  static normalizeLabel(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  /**
   * Recorre el rango [startRowIndex, endRowIndex) de la columna indicada y devuelve la primera
   * fila cuya etiqueta normalizada satisface matches. Usa la primera columna por defecto.
   * @param rows Filas de valores de la hoja en las que buscar.
   * @param startRowIndex Índice inicial del rango de búsqueda, incluido.
   * @param endRowIndex Índice final del rango de búsqueda, excluido.
   * @param matches Predicado que determina si una etiqueta normalizada coincide.
   * @param columnIndex Índice de la columna que contiene las etiquetas; por defecto, la primera.
   * @returns Índice de la primera fila coincidente; lanza un error si no hay coincidencias.
   */
  static findRowIndex(
    rows: unknown[][],
    startRowIndex: number,
    endRowIndex: number,
    matches: (label: string) => boolean,
    columnIndex = 0
  ): number {
    for (let rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
      const label = SpreadsheetUtils.readText(rows[rowIndex][columnIndex]);
      if (label && matches(SpreadsheetUtils.normalizeLabel(label))) {
        return rowIndex;
      }
    }
    throw new Error("No matching row was found in the sheet.");
  }

  /**
   * Lee el valor numérico y su nota, devolviendo undefined para notas vacías
   * para que puedan omitirse al serializar el DTO.
   * @param value Valor de celda que se convertirá en número.
   * @param note Nota asociada al valor, si existe.
   * @param roundToTwoDecimals Indica si el número debe redondearse a dos decimales.
   * @returns Tupla con el número válido o null y la nota o undefined.
   */
  static readValueAndNote(
    value: unknown,
    note: unknown,
    roundToTwoDecimals = true
  ): [number | null, string | undefined] {
    const textNote = SpreadsheetUtils.readText(note);
    const number = roundToTwoDecimals
      ? SpreadsheetUtils.readNumber(value)
      : SpreadsheetUtils.parseNumber(value);
    return [number, textNote ?? undefined];
  }

  /**
   * Convierte una fracción a porcentaje y conserva la nota; los valores no válidos
   * siguen siendo null.
   * @param value Fracción numérica que se desea expresar como porcentaje.
   * @param note Nota asociada al valor, si existe.
   * @returns Tupla con el porcentaje redondeado o null y la nota o undefined.
   */
  static readPercentageAndNote(
    value: unknown,
    note: unknown
  ): [number | null, string | undefined] {
    const percentage = SpreadsheetUtils.parseNumber(value);
    const textNote = SpreadsheetUtils.readText(note);
    return [
      percentage === null ? null : SpreadsheetUtils.roundToTwoDecimals(percentage * 100),
      textNote ?? undefined
    ];
  }

  /**
   * Acepta únicamente objetos Date con marca temporal válida y devuelve una copia.
   * Para cadenas, otros tipos o fechas inválidas devuelve null.
   * @param value Valor de celda que podría ser una fecha.
   * @returns Copia de la fecha válida o null si el valor no es una fecha válida.
   */
  static readDate(value: unknown): Date | null {
    if (Object.prototype.toString.call(value) !== "[object Date]") {
      return null;
    }
    const timestamp = Number(value);
    return Number.isFinite(timestamp) ? new Date(timestamp) : null;
  }

  /**
   * Busca una coincidencia exacta del encabezado y devuelve su índice.
   * Lanza un error con el encabezado buscado si no aparece en la fila.
   * @param headers Encabezados de la hoja en el orden de sus columnas.
   * @param header Nombre exacto del encabezado que se desea localizar.
   * @returns Índice de la columna coincidente; lanza un error si no existe.
   */
  static findColumn(headers: string[], header: string): number {
    const index = headers.indexOf(header);
    if (index === -1) {
      throw new Error(`Column "${header}" was not found in "${headers}".`);
    }
    return index;
  }

  /**
   * Normaliza las etiquetas de activos conocidas en la hoja y las convierte a AssetType.
   * Lanza un error si la etiqueta no forma parte de las equivalencias admitidas.
   * @param label Etiqueta del activo tal como aparece en la hoja.
   * @returns Tipo de activo correspondiente a una etiqueta reconocida.
   */
  static getBreakdownAssetType(
    label: string,
  ): AssetType {
    switch (SpreadsheetUtils.normalizeLabel(label)) {
      case "bancos":
        return AssetType.Banks;
      case "depositos":
        return AssetType.Deposits;
      case "renta variable":
        return AssetType.Equities;
      case "fondo monetario":
        return AssetType.MoneyMarketFund;
      case "neuberger":
        return AssetType.FixedIncome;
      case "total":
        return AssetType.Total;
      default:
        throw new Error(`Asset type "${label}" is not defined.`);
    }
  }
}
