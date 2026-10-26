interface ColumnaMes {
  mes: MesValue;
  indice: number;
}

class Utils {
  /**
   * Convierte un valor de celda a texto, preservando cadenas y serializando otros tipos.
   * Trata "", null y undefined como ausencia de valor.
   */
  static readText(value: unknown): string | null {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    return typeof value === "string" ? value : String(value);
  }

  /**
   * Convierte números o cadenas numéricas a number.
   * Devuelve null para celdas vacías, valores no numéricos o números no finitos.
   */
  static readNumber(value: unknown): number | null {
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
   * Lee el valor como número y lo acepta como año solo si es entero y >= 1900.
   * Devuelve null si no cumple esas condiciones.
   */
  static readYear(value: unknown): number | null {
    const year = Utils.readNumber(value);
    return year !== null && Number.isInteger(year) && year >= 1900
      ? year
      : null;
  }

  /**
   * Valida los doce encabezados de mes, en el orden de MesValue, desde la columna inicial.
   * Devuelve cada mes junto al índice de su columna y falla si algún encabezado no coincide.
   */
  static createMonthColumns(
    headers: unknown[],
    firstMonthColumnIndex: number
  ): ColumnaMes[] {
    const validMonths: MesValue[] = Object.values(MesValue);
    return validMonths.map((_, monthIndex) => {
      const columnIndex = firstMonthColumnIndex + monthIndex;
      const header = Utils.readText(headers[columnIndex]);
      const month = validMonths.find((validMonth) => validMonth === header);
      if (!month) {
        throw new Error(`El mes de la columna ${columnIndex + 1} no es válido.`);
      }
      return { mes: month, indice: columnIndex };
    });
  }

  /**
   * Busca desde startRowIndex la siguiente fila cuyo primer valor sea un año válido.
   * Si no encuentra otro bloque anual, devuelve rows.length.
   */
  static findNextYearRow(rows: unknown[][], startRowIndex: number): number {
    for (let rowIndex = startRowIndex; rowIndex < rows.length; rowIndex++) {
      if (Utils.readYear(rows[rowIndex][0]) !== null) {
        return rowIndex;
      }
    }
    return rows.length;
  }

  /**
   * Normaliza etiquetas para compararlas sin distinguir acentos, mayúsculas ni espacios extremos.
   * No elimina otros signos ni modifica los espacios interiores.
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
   */
  static findRowIndex(
    rows: unknown[][],
    startRowIndex: number,
    endRowIndex: number,
    matches: (label: string) => boolean,
    columnIndex = 0
  ): number {
    for (let rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
      const label = Utils.readText(rows[rowIndex][columnIndex]);
      if (label && matches(Utils.normalizeLabel(label))) {
        return rowIndex;
      }
    }
    throw new Error(`No se encontró la fila en la hoja.`);
  }

  /**
   * Construye el wrapper de un valor numérico, convirtiendo entradas inválidas a null.
   * Añade la unidad indicada y solo incluye nota cuando la celda contiene texto.
   */
  static createValueWrapper(
    value: unknown,
    note: unknown,
    unit: UnidadValue
  ): RegistroWrapperDTO {
    const textNote = Utils.readText(note);
    return {
      valor: Utils.readNumber(value),
      unidad: unit,
      ...(textNote === null ? {} : { nota: textNote })
    };
  }

  /**
   * Crea un wrapper porcentual multiplicando por 100 los valores numéricos de entrada.
   * Si el valor no es válido, conserva null; la nota se procesa como en createValueWrapper.
   */
  static createPercentageWrapper(value: unknown, note: unknown): RegistroWrapperDTO {
    const result = Utils.createValueWrapper(value, note, UnidadValue.Porcentaje);
    result.valor = result.valor === null ? null : result.valor * 100;
    return result;
  }

  /**
   * Acepta únicamente objetos Date con marca temporal válida y devuelve una copia.
   * Para cadenas, otros tipos o fechas inválidas devuelve null.
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
   */
  static findColumn(headers: string[], header: string): number {
    const index = headers.indexOf(header);
    if (index === -1) {
      throw new Error(`No se encontró la columna "${header}" dentro de "${headers}".`);
    }
    return index;
  }

  /**
   * Normaliza las etiquetas de activos conocidas en la hoja y las convierte a TipoActivoValue.
   * Lanza un error si la etiqueta no forma parte de las equivalencias admitidas.
   */
  static obtenerTipoActivoDesglosado(
    label: string,
  ): TipoActivoValue {
    switch (Utils.normalizeLabel(label)) {
      case "bancos":
        return TipoActivoValue.Bancos;
      case "depositos":
        return TipoActivoValue.Depositos;
      case "renta variable":
        return TipoActivoValue.RentaVariable;
      case "fondo monetario":
        return TipoActivoValue.FondoMonetario;
      case "neuberger":
        return TipoActivoValue.RentaFija;
      case "total":
        return TipoActivoValue.Total;
      default:
        throw new Error(`El tipo de activo "${label}" no está definido.`);
    }
  }
}
