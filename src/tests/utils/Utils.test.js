const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class UtilsTests {
  constructor() {
    this.context = vm.createContext({});
    const utilsFile = path.join(__dirname, "../../../dist/utils/Utils.js");
    const script = fs.readFileSync(utilsFile, "utf8");
    vm.runInContext(script, this.context, { filename: utilsFile });
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

test("UtilsTests - readNumber devuelve null para valores no numéricos", () => {
  assert.equal(utilsTests.evaluate("Utils.readNumber(42)"), 42);
  assert.equal(utilsTests.evaluate("Utils.readNumber('2')"), 2);
  assert.equal(utilsTests.evaluate("Utils.readNumber(' 2 ')"), 2);
  assert.equal(utilsTests.evaluate("Utils.readNumber('')"), null);
  assert.equal(utilsTests.evaluate("Utils.readNumber(null)"), null);
  assert.equal(utilsTests.evaluate("Utils.readNumber('texto')"), null);
  assert.equal(utilsTests.evaluate("Utils.readNumber(true)"), null);
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
    () => utilsTests.evaluate("Utils.findColumn(['Fecha', 'Salario'], 'Comentarios')"),
    /No se encontró la columna "Comentarios" dentro de "Fecha,Salario"\./
  );
});
