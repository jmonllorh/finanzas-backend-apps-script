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
