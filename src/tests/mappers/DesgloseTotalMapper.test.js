const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class DesgloseTotalMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/comun/TipoActivoValue.js",
      "../../../dist/dtos/comun/ResumenCamposFinancierosDTO.js",
      "../../../dist/dtos/DesgloseTotalDTO.js",
      "../../../dist/utils/Utils.js",
      "../../../dist/mappers/ResumenCamposFinancierosMapper.js",
      "../../../dist/mappers/DesgloseTotalMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes) {
    this.context.sheet = {
      getName: () => "Desglose total",
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("crearDesgloseTotalDTO(sheet)", this.context);
  }
}

const mapperTests = new DesgloseTotalMapperTests();
const headers = [
  "Año", "Alquiler", "Electricidad", "Agua", "Internet", "Inversiones",
  "Suscripciones", "Médicos", "Comida/Limpieza", "Ocio", "Deporte",
  "Transporte", "Otros", "Viajes", "Ahorro neto", "Ahorro bruto",
  "Total gastos", "Ingresos fijos", "Bonos, ayudas, renta", "Ingresos totales"
];

function createFinancialRow(label, baseValue) {
  return [
    label,
    ...Array.from({ length: 12 }, (_, index) => baseValue + index),
    baseValue + 12,
    baseValue + 13,
    baseValue + 14,
    baseValue + 15,
    baseValue + 16,
    baseValue + 17,
    baseValue + 18
  ];
}

test("DesgloseTotalMapperTests - mapea años, agregados y activos", () => {
  const rows = [
    headers,
    createFinancialRow(2025, 10),
    createFinancialRow(2026, 20),
    createFinancialRow("Total", 30),
    createFinancialRow("Media mensual", 40),
    ...Array.from({ length: 19 }, () => []),
    ["", "", "Bancos", 100],
    ["", "", "Depósitos", 200],
    ["", "", "Renta variable", 300],
    ["", "", "Fondo monetario", 400],
    ["", "", "Neuberger", 500],
    ["", "", "Total", 1500]
  ];
  const notes = rows.map(() => Array(20).fill(""));

  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.años.length, 2);
  assert.equal(dto.años[0].año, 2025);
  assert.equal(dto.años[0].viajes, 22);
  assert.equal(dto.años[0].bonosAyudasRenta, 27);
  assert.equal(dto.años[0].ingresosTotales, 28);
  assert.equal(dto.total.año, null);
  assert.equal(dto.total.totalGastos, 45);
  assert.equal(dto.mediaMensual.alquiler, 40);
  assert.equal(dto.activos.length, 6);
  assert.equal(dto.activos[4].tipo, "Renta fija");
  assert.equal(dto.activos[4].valor, 500);
  assert.equal(dto.activos[5].tipo, "Total");
});
