const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class UtilsTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/comun/MesValue.js",
      "../../../dist/utils/Utils.js"
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

const utilsTests = new UtilsTests();

test("UtilsTests - readText conserva texto, convierte otros valores y normaliza vacíos", () => {
  assert.equal(utilsTests.evaluate("Utils.readText('comentario')"), "comentario");
  assert.equal(utilsTests.evaluate("Utils.readText(42)"), "42");
  assert.equal(utilsTests.evaluate("Utils.readText(false)"), "false");
  assert.equal(utilsTests.evaluate("Utils.readText('')"), null);
  assert.equal(utilsTests.evaluate("Utils.readText(null)"), null);
  assert.equal(utilsTests.evaluate("Utils.readText(undefined)"), null);
});

test("UtilsTests - readNumber redondea a dos decimales y rechaza valores no numéricos", () => {
  assert.equal(utilsTests.evaluate("Utils.readNumber(42)"), 42);
  assert.equal(utilsTests.evaluate("Utils.readNumber('2')"), 2);
  assert.equal(utilsTests.evaluate("Utils.readNumber(' 2 ')"), 2);
  assert.equal(utilsTests.evaluate("Utils.readNumber(4459.629999999999)"), 4459.63);
  assert.equal(utilsTests.evaluate("Utils.readNumber(6.601818182)"), 6.6);
  assert.equal(utilsTests.evaluate("Utils.readNumber(1.235)"), 1.24);
  assert.equal(utilsTests.evaluate("Utils.readNumber(-1.235)"), -1.24);
  assert.equal(utilsTests.evaluate("Utils.readNumber('')"), null);
  assert.equal(utilsTests.evaluate("Utils.readNumber(null)"), null);
  assert.equal(utilsTests.evaluate("Utils.readNumber('texto')"), null);
  assert.equal(utilsTests.evaluate("Utils.readNumber(true)"), null);
});

test("UtilsTests - readYear acepta solo años enteros desde 1900", () => {
  assert.equal(utilsTests.evaluate("Utils.readYear(2025)"), 2025);
  assert.equal(utilsTests.evaluate("Utils.readYear('2025')"), 2025);
  assert.equal(utilsTests.evaluate("Utils.readYear(1899)"), null);
  assert.equal(utilsTests.evaluate("Utils.readYear(2025.5)"), null);
  assert.equal(utilsTests.evaluate("Utils.readYear('texto')"), null);
});

test("UtilsTests - createMonthColumns respeta el desplazamiento de columna", () => {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const headers = JSON.stringify(["Concepto", ...months]);
  const columns = utilsTests.evaluate(
    `Utils.createMonthColumns(${headers}, 1)`
  );
  assert.equal(columns.length, 12);
  assert.deepEqual(
    JSON.parse(JSON.stringify(columns[0])),
    { mes: "Enero", indice: 1 }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(columns[11])),
    { mes: "Diciembre", indice: 12 }
  );
  assert.throws(
    () => utilsTests.evaluate("Utils.createMonthColumns(['No es un mes'], 0)"),
    /El mes de la columna 1 no es válido\./
  );
});

test("UtilsTests - findNextYearRow devuelve el comienzo del siguiente bloque", () => {
  const rows = JSON.stringify([["texto"], [2025], ["Concepto"], [2024]]);
  assert.equal(
    utilsTests.evaluate(`Utils.findNextYearRow(${rows}, 0)`),
    1
  );
  assert.equal(
    utilsTests.evaluate(`Utils.findNextYearRow(${rows}, 2)`),
    3
  );
  assert.equal(
    utilsTests.evaluate(`Utils.findNextYearRow(${rows}, 4)`),
    4
  );
});

test("UtilsTests - normalizeLabel y findRowIndex comparten normalización y errores claros", () => {
  assert.equal(
    utilsTests.evaluate("Utils.normalizeLabel('  Energía €/KW  ')"),
    "energia €/kw"
  );
  const rows = JSON.stringify([["Importe total"], ["  Consumo total  "]]);
  assert.equal(
    utilsTests.evaluate(
      `Utils.findRowIndex(${rows}, 0, 2, label => label.startsWith('consumo'))`
    ),
    1
  );
  assert.throws(
    () => utilsTests.evaluate(
      `Utils.findRowIndex(${rows}, 0, 2, label => label === 'precio')`
    ),
    /No se encontró la fila en la hoja\./
  );
});

test("UtilsTests - findRowIndex busca en la columna indicada", () => {
  const rows = JSON.stringify([
    ["", "", "Entidad"],
    ["", "", " total activos: "],
    ["", "", "Depósito"]
  ]);
  assert.equal(
    utilsTests.evaluate(
      `Utils.findRowIndex(${rows}, 0, 3, label => label === 'total activos:', 2)`
    ),
    1
  );
});

test("UtilsTests - readValueAndNote devuelve el valor y solo las notas presentes", () => {
  const value = utilsTests.evaluate(
    "Utils.readValueAndNote(12.5, 'Nota')"
  );
  assert.equal(value[0], 12.5);
  assert.equal(value[1], "Nota");
  const rounded = utilsTests.evaluate(
    "Utils.readValueAndNote(12.345, 'Nota')"
  );
  assert.equal(rounded[0], 12.35);
  const precise = utilsTests.evaluate(
    "Utils.readValueAndNote(6.601818182, '', false)"
  );
  assert.equal(precise[0], 6.601818182);
  const withoutNote = utilsTests.evaluate(
    "Utils.readValueAndNote('', '')"
  );
  assert.equal(withoutNote[0], null);
  assert.equal(withoutNote[1], undefined);
});

test("UtilsTests - readPercentageAndNote convierte fracciones y conserva valores nulos", () => {
  const percentage = utilsTests.evaluate(
    "Utils.readPercentageAndNote(0.125, 'Porcentaje configurado')"
  );
  assert.equal(percentage[0], 12.5);
  assert.equal(percentage[1], "Porcentaje configurado");
  assert.equal(
    utilsTests.evaluate("Utils.readPercentageAndNote(0.108829, '')")[0],
    10.88
  );
  const zero = utilsTests.evaluate(
    "Utils.readPercentageAndNote(0, '')"
  );
  assert.equal(zero[0], 0);
  assert.equal(zero[1], undefined);
  const missing = utilsTests.evaluate(
    "Utils.readPercentageAndNote('', null)"
  );
  assert.equal(missing[0], null);
  assert.equal(missing[1], undefined);
});

test("UtilsTests - readDate acepta Date y devuelve null para otros valores", () => {
  assert.equal(
    utilsTests.evaluate(
      "Utils.readDate(new Date(Date.UTC(2017, 1, 15))).toISOString()"
    ),
    "2017-02-15T00:00:00.000Z"
  );
  assert.equal(utilsTests.evaluate("Utils.readDate('15/02/2017')"), null);
  assert.equal(utilsTests.evaluate("Utils.readDate('')"), null);
  assert.equal(utilsTests.evaluate("Utils.readDate(null)"), null);
  assert.equal(utilsTests.evaluate("Utils.readDate(new Date('invalid'))"), null);
});

test("UtilsTests - findColumn devuelve el índice o informa del encabezado ausente", () => {
  assert.equal(
    utilsTests.evaluate("Utils.findColumn(['Fecha', 'Salario'], 'Fecha')"),
    0
  );
  assert.equal(
    utilsTests.evaluate("Utils.findColumn(['Fecha', 'Salario'], 'Salario')"),
    1
  );
  assert.throws(
    () => utilsTests.evaluate(
      "Utils.findColumn(['Fecha', 'Salario'], 'Comentarios')"
    ),
    /No se encontró la columna "Comentarios" dentro de "Fecha,Salario"\./
  );
});
