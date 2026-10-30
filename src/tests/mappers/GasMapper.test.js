const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

/** Carga el mapper compilado y sus dependencias en un contexto aislado. */
function createContext() {
  const context = vm.createContext({});
  for (const file of [
    "dtos/common/Month.js",
    "dtos/categories/GasDTO.js",
    "utils/SpreadsheetUtils.js",
    "mappers/GasMapper.js"
  ]) {
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, "../../../dist", file), "utf8"),
      context,
      { filename: file }
    );
  }
  return context;
}

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/** Reproduce las etiquetas y los ceros del bloque Gas del Excel. */
function createYear(year = 2026) {
  return [
    [year],
    ["Concepto", ...months],
    ["Importe total", ...Array(12).fill(0)],
    ["Consumo total (kWh)", ...Array(12).fill(0)],
    ["Precio fijo (€)", ...Array(12).fill(0)],
    ["Precio energía (€/kWh)", ...Array(12).fill(0)]
  ];
}

/** Simula la lectura de valores y notas de una pestaña de Google Sheets. */
function createSheet(rows, notes = rows.map(() => Array(13).fill(""))) {
  return {
    getName: () => "Gas",
    getDataRange: () => ({
      getValues: () => rows,
      getNotes: () => notes
    })
  };
}

/** Ejecuta el mapper con la pestaña simulada. */
function mapSheet(rows, notes) {
  const context = createContext();
  context.sheet = createSheet(rows, notes);
  return JSON.parse(JSON.stringify(vm.runInContext("mapGasData(sheet)", context)));
}

test("GasMapper - maps the workbook shape and preserves twelve zero-valued months", () => {
  const result = mapSheet(createYear());
  assert.equal(result.length, 1);
  assert.equal(result[0].year, 2026);
  assert.deepEqual(result[0].months, months.map((month) => ({
    month,
    amount: 0,
    consumption: 0,
    price: { fixedPrice: 0, energyPrice: 0 }
  })));
});

test("GasMapper - maps multiple years, notes, empty cells and energy price precision", () => {
  const rows = [...createYear(), [], ...createYear(2025)];
  rows[2][1] = 44.706;
  rows[3][1] = 187.126;
  rows[4][1] = 6.726;
  rows[5][1] = 0.0654321;
  for (let i = 2; i <= 5; i++) rows[i][2] = "";
  const notes = rows.map(() => Array(13).fill(""));
  notes[2][1] = "Importe";
  notes[3][1] = "Consumo";
  notes[4][1] = "Fijo";
  notes[5][1] = "Energía";
  const result = mapSheet(rows, notes);
  assert.deepEqual(result.map((year) => year.year), [2026, 2025]);
  assert.deepEqual(result[0].months[0], {
    month: "Enero",
    amount: 44.71,
    amountNote: "Importe",
    consumption: 187.13,
    consumptionNote: "Consumo",
    price: {
      fixedPrice: 6.73,
      fixedPriceNote: "Fijo",
      energyPrice: 0.0654321,
      energyPriceNote: "Energía"
    }
  });
  assert.deepEqual(result[0].months[1], {
    month: "Febrero", amount: null, consumption: null,
    price: { fixedPrice: null, energyPrice: null }
  });
  assert.equal(result[1].months[0].amount, 0);
});

test("GasMapper - finds normalized labels even when rows are reordered", () => {
  const rows = createYear();
  rows[5][0] = "  PRECIO ENERGÍA (€/kWh)  ";
  rows[5][1] = 0.0654321;
  [rows[2], rows[5]] = [rows[5], rows[2]];
  assert.equal(mapSheet(rows)[0].months[0].price.energyPrice, 0.0654321);
});

test("GasMapper - rejects missing fields without borrowing from the next year", () => {
  for (let index = 2; index <= 5; index++) {
    const rows = createYear();
    rows.splice(index, 1);
    assert.throws(() => mapSheet([...rows, ...createYear(2025)]), /No matching row/);
  }
});

test("GasMapper - rejects empty sheets and missing or invalid months", () => {
  assert.throws(() => mapSheet([]), /does not contain any data/);
  assert.throws(() => mapSheet([[2026]]), /does not contain the months/);
  const rows = createYear();
  rows[1][12] = "Invalid";
  assert.throws(() => mapSheet(rows), /month in column 13 is invalid/);
});

test("Main - includes mapped gas or null when the tab is absent", () => {
  for (const present of [true, false]) {
    const context = createContext();
    for (const file of ["dtos/FinancialResponseDTO.js", "Main.js"]) {
      vm.runInContext(
        fs.readFileSync(path.join(__dirname, "../../../dist", file), "utf8"),
        context,
        { filename: file }
      );
    }
    context.PropertiesService = {
      getScriptProperties: () => ({ getProperty: () => "spreadsheet-id" })
    };
    context.SpreadsheetApp = {
      openById: () => ({
        getSheetByName: (name) => name === "Gas" && present
          ? createSheet(createYear()) : null,
        getSheets: () => []
      })
    };
    context.ContentService = {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text) => ({
        setMimeType: () => JSON.parse(text)
      })
    };
    const response = vm.runInContext("doGet({})", context);
    assert.equal(response.status, "success");
    if (present) {
      assert.deepEqual(response.gas, mapSheet(createYear()));
    } else {
      assert.equal(response.gas, null);
    }
    assert.equal(response.water, null);
    assert.equal(response.electricity, null);
  }
});
