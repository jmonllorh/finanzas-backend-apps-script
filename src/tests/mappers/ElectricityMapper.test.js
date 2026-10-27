const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class ElectricityMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/common/Month.js",
      "../../../dist/dtos/categories/ElectricityDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/ElectricityMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes) {
    this.context.sheet = {
      getName: () => "Electricidad",
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("mapElectricityData(sheet)", this.context);
  }
}

const mapperTests = new ElectricityMapperTests();
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

test("ElectricityMapperTests - populates each year with amounts, consumption, and prices", () => {
  const emptyRow = () => Array(13).fill("");
  const rows = [
    [2026, ...Array(12).fill("")],
    ["Concepto", ...months],
    ["Importe total", 44.706, 45.16, ...Array(10).fill("")],
    ["Consumo total", 187.126, 187, ...Array(10).fill("")],
    ["Energía €/kW", 0.105938, 0.1041, ...Array(10).fill("")],
    ["Precio energía", 19.81, 19.46, ...Array(10).fill("")],
    ["Potencia €/kW Punta", 0.013603, 0.054794, ...Array(10).fill("")],
    ["Potencia €/kW Valle", 0.080539, 0.054794, ...Array(10).fill("")],
    ["Potencia total €/kW", 0.094142, 0.109588, ...Array(10).fill("")],
    emptyRow(),
    [2025, ...Array(12).fill("")],
    ["Concepto", ...months],
    ["Importe total", 50.83, ...Array(11).fill("")],
    ["Consumo total", 191, ...Array(11).fill("")],
    ["Energía €/kW", 0.145151, ...Array(11).fill("")],
    ["Precio energía", 27.72, ...Array(11).fill("")],
    ["Potencia €/kW Punta", 0.108163, ...Array(11).fill("")],
    ["Potencia €/kW Valle", 0.033392, ...Array(11).fill("")],
    ["Potencia total €/kW", 0.141555, ...Array(11).fill("")]
  ];
  const notes = rows.map(() => Array(13).fill(""));
  notes[2][1] = "Factura de enero";

  const dtos = mapperTests.mapSheet(rows, notes);

  assert.equal(dtos.length, 2);
  assert.equal(dtos[0].year, 2026);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dtos[0].months[0])),
    {
      month: "Enero",
      amount: 44.71,
      amountNote: "Factura de enero",
      consumption: 187.13,
      price: {
        energyPrice: 0.105938,
        peakPowerPrice: 0.013603,
        offPeakPowerPrice: 0.080539,
        totalPowerPrice: 0.094142
      }
    }
  );
  assert.equal(dtos[0].months[1].amount, 45.16);
  assert.equal(dtos[1].months[0].amount, 50.83);
});
