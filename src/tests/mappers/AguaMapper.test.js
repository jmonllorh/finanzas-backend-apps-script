const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class AguaMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/comun/UnidadValue.js",
      "../../../dist/dtos/comun/MesValue.js",
      "../../../dist/dtos/comun/RegistroWrapperDTO.js",
      "../../../dist/dtos/categorias/AguaDTO.js",
      "../../../dist/utils/Utils.js",
      "../../../dist/mappers/AguaMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes) {
    this.context.sheet = {
      getName: () => "Agua",
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("crearAguaDTO(sheet)", this.context);
  }
}

const mapperTests = new AguaMapperTests();
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

test("AguaMapperTests - rellena cada año con importes, consumo y precio por litro", () => {
  const rows = [
    [2026, ...Array(12).fill("")],
    ["Concepto", ...months],
    ["Importe", 0, 72.62, ...Array(10).fill("")],
    ["Consumo", 0, 11, ...Array(10).fill("")],
    ["€/L", 0, 6.601818182, ...Array(10).fill("")],
    Array(13).fill(""),
    [2025, ...Array(12).fill("")],
    ["Concepto", ...months],
    ["Importe", 0, 70.79, ...Array(10).fill("")],
    ["Consumo", 0, 10, ...Array(10).fill("")],
    ["€/L", 0, 7.079, ...Array(10).fill("")]
  ];
  const notes = rows.map(() => Array(13).fill(""));
  notes[2][2] = "Incluye alcantarillado";

  const dtos = mapperTests.mapSheet(rows, notes);

  assert.equal(dtos.length, 2);
  assert.equal(dtos[0].año, 2026);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dtos[0].meses[1])),
    {
      mes: "Febrero",
      importe: { valor: 72.62, unidad: "€", nota: "Incluye alcantarillado" },
      consumo: { valor: 11, unidad: "m³" },
      precioPorLitro: { valor: 6.601818182, unidad: "€/L" }
    }
  );
  assert.equal(dtos[0].meses[0].importe.valor, 0);
  assert.equal(dtos[1].meses[1].precioPorLitro.valor, 7.079);
});
