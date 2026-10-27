const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class SpreadsheetUtilsTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/common/Month.js",
      "../../../dist/utils/SpreadsheetUtils.js"
    ];
    for (const file of compiledFiles) {
      const compiledFile = path.join(__dirname, file);
      const script = fs.readFileSync(compiledFile, "utf8");
      vm.runInContext(script, this.context, { filename: compiledFile });
    }
  }

  evaluate(expression) {
    return vm.runInContext(expression, this.context);
  }
}

const utilsTests = new SpreadsheetUtilsTests();

test("SpreadsheetUtilsTests - readText trims text, converts other values, and normalizes empty values", () => {
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readText('comentario')"), "comentario");
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readText('  comentario  ')"), "comentario");
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readText(42)"), "42");
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readText(false)"), "false");
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readText('')"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readText('   ')"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readText(null)"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readText(undefined)"), null);
});

test("SpreadsheetUtilsTests - readNumber rounds to two decimals and rejects non-numeric values", () => {
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber(42)"), 42);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber('2')"), 2);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber(' 2 ')"), 2);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber(4459.629999999999)"), 4459.63);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber(6.601818182)"), 6.6);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber(1.235)"), 1.24);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber(-1.235)"), -1.24);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber('')"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber(null)"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber('texto')"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readNumber(true)"), null);
});

test("SpreadsheetUtilsTests - readYear accepts only integer years from 1900", () => {
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readYear(2025)"), 2025);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readYear('2025')"), 2025);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readYear(1899)"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readYear(2025.5)"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readYear('texto')"), null);
});

test("SpreadsheetUtilsTests - createMonthColumns respects the column offset", () => {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const headers = JSON.stringify(["Concepto", ...months]);
  const columns = utilsTests.evaluate(
    `SpreadsheetUtils.createMonthColumns(${headers}, 1)`
  );
  assert.equal(columns.length, 12);
  assert.deepEqual(
    JSON.parse(JSON.stringify(columns[0])),
    { month: "Enero", index: 1 }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(columns[11])),
    { month: "Diciembre", index: 12 }
  );
  assert.throws(
    () => utilsTests.evaluate("SpreadsheetUtils.createMonthColumns(['No es un mes'], 0)"),
    /The month in column 1 is invalid\./
  );
});

test("SpreadsheetUtilsTests - findNextYearRow returns the start of the next block", () => {
  const rows = JSON.stringify([["texto"], [2025], ["Concepto"], [2024]]);
  assert.equal(
    utilsTests.evaluate(`SpreadsheetUtils.findNextYearRow(${rows}, 0)`),
    1
  );
  assert.equal(
    utilsTests.evaluate(`SpreadsheetUtils.findNextYearRow(${rows}, 2)`),
    3
  );
  assert.equal(
    utilsTests.evaluate(`SpreadsheetUtils.findNextYearRow(${rows}, 4)`),
    4
  );
});

test("SpreadsheetUtilsTests - normalizeLabel and findRowIndex share normalization and clear errors", () => {
  assert.equal(
    utilsTests.evaluate("SpreadsheetUtils.normalizeLabel('  Energía €/KW  ')"),
    "energia €/kw"
  );
  const rows = JSON.stringify([["Importe total"], ["  Consumo total  "]]);
  assert.equal(
    utilsTests.evaluate(
      `SpreadsheetUtils.findRowIndex(${rows}, 0, 2, label => label.startsWith('consumo'))`
    ),
    1
  );
  assert.throws(
    () => utilsTests.evaluate(
      `SpreadsheetUtils.findRowIndex(${rows}, 0, 2, label => label === 'precio')`
    ),
    /No matching row was found in the sheet\./
  );
});

test("SpreadsheetUtilsTests - findRowIndex searches the specified column", () => {
  const rows = JSON.stringify([
    ["", "", "Entidad"],
    ["", "", " total activos: "],
    ["", "", "Depósito"]
  ]);
  assert.equal(
    utilsTests.evaluate(
      `SpreadsheetUtils.findRowIndex(${rows}, 0, 3, label => label === 'total activos:', 2)`
    ),
    1
  );
});

test("SpreadsheetUtilsTests - readValueAndNote returns the value and only existing notes", () => {
  const value = utilsTests.evaluate(
    "SpreadsheetUtils.readValueAndNote(12.5, 'Nota')"
  );
  assert.equal(value[0], 12.5);
  assert.equal(value[1], "Nota");
  const rounded = utilsTests.evaluate(
    "SpreadsheetUtils.readValueAndNote(12.345, 'Nota')"
  );
  assert.equal(rounded[0], 12.35);
  const precise = utilsTests.evaluate(
    "SpreadsheetUtils.readValueAndNote(6.601818182, '', false)"
  );
  assert.equal(precise[0], 6.601818182);
  const withoutNote = utilsTests.evaluate(
    "SpreadsheetUtils.readValueAndNote('', '')"
  );
  assert.equal(withoutNote[0], null);
  assert.equal(withoutNote[1], undefined);
});

test("SpreadsheetUtilsTests - readPercentageAndNote converts fractions and preserves null values", () => {
  const percentage = utilsTests.evaluate(
    "SpreadsheetUtils.readPercentageAndNote(0.125, 'Porcentaje configurado')"
  );
  assert.equal(percentage[0], 12.5);
  assert.equal(percentage[1], "Porcentaje configurado");
  assert.equal(
    utilsTests.evaluate("SpreadsheetUtils.readPercentageAndNote(0.108829, '')")[0],
    10.88
  );
  const zero = utilsTests.evaluate(
    "SpreadsheetUtils.readPercentageAndNote(0, '')"
  );
  assert.equal(zero[0], 0);
  assert.equal(zero[1], undefined);
  const missing = utilsTests.evaluate(
    "SpreadsheetUtils.readPercentageAndNote('', null)"
  );
  assert.equal(missing[0], null);
  assert.equal(missing[1], undefined);
});

test("SpreadsheetUtilsTests - readDate accepts Date and returns null for other values", () => {
  assert.equal(
    utilsTests.evaluate(
      "SpreadsheetUtils.readDate(new Date(Date.UTC(2017, 1, 15))).toISOString()"
    ),
    "2017-02-15T00:00:00.000Z"
  );
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readDate('15/02/2017')"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readDate('')"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readDate(null)"), null);
  assert.equal(utilsTests.evaluate("SpreadsheetUtils.readDate(new Date('invalid'))"), null);
});

test("SpreadsheetUtilsTests - findColumn returns the index or reports a missing header", () => {
  assert.equal(
    utilsTests.evaluate("SpreadsheetUtils.findColumn(['Fecha', 'Salario'], 'Fecha')"),
    0
  );
  assert.equal(
    utilsTests.evaluate("SpreadsheetUtils.findColumn(['Fecha', 'Salario'], 'Salario')"),
    1
  );
  assert.throws(
    () => utilsTests.evaluate(
      "SpreadsheetUtils.findColumn(['Fecha', 'Salario'], 'Comentarios')"
    ),
    /Column "Comentarios" was not found in "Fecha,Salario"\./
  );
});
