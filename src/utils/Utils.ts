interface ColumnaMes {
  mes: MesValue;
  indice: number;
}

class Utils {
  static readText(value: unknown): string | null {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    return typeof value === "string" ? value : String(value);
  }

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

  static readYear(value: unknown): number | null {
    const year = Utils.readNumber(value);
    return year !== null && Number.isInteger(year) && year >= 1900
      ? year
      : null;
  }

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

  static findNextYearRow(rows: unknown[][], startRowIndex: number): number {
    for (let rowIndex = startRowIndex; rowIndex < rows.length; rowIndex++) {
      if (Utils.readYear(rows[rowIndex][0]) !== null) {
        return rowIndex;
      }
    }
    return rows.length;
  }

  static normalizeLabel(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  static findRowIndex(
    rows: unknown[][],
    startRowIndex: number,
    endRowIndex: number,
    matches: (label: string) => boolean
  ): number {
    for (let rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
      const label = Utils.readText(rows[rowIndex][0]);
      if (label && matches(Utils.normalizeLabel(label))) {
        return rowIndex;
      }
    }
    throw new Error(`No se encontró la fila en la hoja.`);
  }

  static createValueWrapper(
    value: unknown,
    note: unknown,
    unit: UnidadValue
  ): ValorWrapperDTO {
    const textNote = Utils.readText(note);
    return {
      valor: Utils.readNumber(value),
      unidad: unit,
      ...(textNote === null ? {} : { nota: textNote })
    };
  }

  static readDate(value: unknown): Date | null {
    if (Object.prototype.toString.call(value) !== "[object Date]") {
      return null;
    }
    const timestamp = Number(value);
    return Number.isFinite(timestamp) ? new Date(timestamp) : null;
  }

   static findColumn(headers: string[], header: string): number {
    const index = headers.indexOf(header);
    if (index === -1) {
      throw new Error(`No se encontró la columna "${header}" dentro de "${headers}".`);
    }
    return index;
  }
}
