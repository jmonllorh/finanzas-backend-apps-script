const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class FundAllocationMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/investments/FundAllocationDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/FundAllocationMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes) {
    this.context.sheet = {
      getName: () => "MyInvestor",
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("mapFundAllocations(sheet)", this.context);
  }
}

const mapperTests = new FundAllocationMapperTests();

test("FundAllocationMapperTests - assigns categories and normalizes percentages", () => {
  const rows = [
    ["Fondo", "Peso", "Cantidad mensual", "ISIN", "Nombre técnico", "Comisión"],
    ["Fondos indexados"],
    ["Fondo global", 0.6, 900, "IE0000000001", "Global técnico", 0.0018],
    ["Fondos value"],
    ["Fondo value", 0.1, 150, "ES0000000002", "Value técnico", 0.0186],
    ["Renta fija"],
    ["Fondo renta fija", "-", "-", "IE0000000004", "Renta fija técnica", 0.0019],
    ["Fondos monetarios"],
    ["Fondo AXA monetario", "-", "-", "FR0000000005", "Monetario técnico", 0.0005],
    ["No usados"],
    ["Fondo sin usar", "-", "-", "LU0000000003", "Sin usar técnico", 0.01]
  ];
  const notes = rows.map(() => Array(6).fill(""));
  notes[2][1] = "Peso configurado";

  const dtos = mapperTests.mapSheet(rows, notes);

  assert.equal(dtos.length, 5);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dtos[0])),
    {
      category: "Fondos indexados",
      name: "Fondo global",
      weight: 60,
      weightNote: "Peso configurado",
      monthlyContribution: 900,
      isin: "IE0000000001",
      technicalName: "Global técnico",
      commission: 0.18
    }
  );
  assert.equal(dtos[1].category, "Fondos value");
  assert.equal(dtos[2].category, "Renta fija");
  assert.equal(dtos[3].category, "Fondos monetarios");
  assert.equal(dtos[4].category, "No usados");
  assert.equal(dtos[4].weight, null);
  assert.equal(dtos[4].monthlyContribution, null);
});

test("FundAllocationMapperTests - skips funds without data even when cells contain spaces", () => {
  const rows = [
    ["Fondo", "Peso", "Cantidad mensual", "ISIN", "Nombre técnico", "Comisión"],
    ["Fondos indexados"],
    ["Fondo vacío", " ", "   ", " ", "  ", " "]
  ];
  const notes = rows.map(() => Array(6).fill(""));

  assert.equal(mapperTests.mapSheet(rows, notes).length, 0);
});
