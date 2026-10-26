const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class ResumenAnualMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/comun/MesValue.js",
      "../../../dist/dtos/comun/ResumenCamposFinancierosDTO.js",
      "../../../dist/dtos/ResumenAnualDTO.js",
      "../../../dist/utils/Utils.js",
      "../../../dist/mappers/ResumenCamposFinancierosMapper.js",
      "../../../dist/mappers/ResumenAnualMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes, name = "Resumen 2026") {
    this.context.sheet = {
      getName: () => name,
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("crearResumenAnualDTO(sheet)", this.context);
  }
}

const mapperTests = new ResumenAnualMapperTests();
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const currentHeaders = [
  "Mes", "Alquiler", "Electricidad", "Agua", "Internet", "Inversiones",
  "Suscripciones", "Médicos", "Comida/Limpieza", "Ocio", "Deporte",
  "Transporte", "Otros", "Ahorro neto", "Ahorro bruto",
  "Total gastos comunes", "Ingresos fijos"
];

function createSummaryRows(year, headers, financialFieldCount) {
  const monthRows = months.map((month) => [
    month,
    ...Array.from({ length: financialFieldCount }, (_, index) => index + 1)
  ]);
  const extraHeaders = ["Viajes", "Bonos, ayudas, renta"];
  monthRows[11].push(...extraHeaders);
  return [
    ["", year],
    headers,
    ...monthRows,
    [`Total ${year}`, ...Array(financialFieldCount).fill(20), 100, 50],
    ["Media", ...Array(financialFieldCount).fill(2)]
  ];
}

test("ResumenAnualMapperTests - mapea meses, totales y columnas complementarias", () => {
  const rows = createSummaryRows(2026, currentHeaders, 16);
  const notes = rows.map(() => Array(19).fill(""));
  notes[2][1] = "Nota del alquiler";

  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.año, 2026);
  assert.equal(dto.meses.length, 12);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.meses[0])),
    {
      mes: "Enero",
      alquiler: 1,
      notaAlquiler: "Nota del alquiler",
      electricidad: 2,
      agua: 3,
      internet: 4,
      inversiones: 5,
      suscripciones: 6,
      medicos: 7,
      comidaLimpieza: 8,
      ocio: 9,
      deporte: 10,
      transporte: 11,
      otros: 12,
      ahorroNeto: 13,
      ahorroBruto: 14,
      totalGastos: 15,
      ingresosFijos: 16
    }
  );
  assert.equal(dto.total.alquiler, 20);
  assert.equal(dto.total.viajes, 100);
  assert.equal(dto.total.bonosAyudasRenta, 50);
  assert.equal(dto.mediaMensual.totalGastos, 2);
});

test("ResumenAnualMapperTests - representa con cero campos ausentes en años antiguos", () => {
  const oldHeaders = currentHeaders.filter((header) => header !== "Internet");
  const rows = createSummaryRows(2025, oldHeaders, 15);
  const notes = rows.map(() => Array(18).fill(""));

  const dto = mapperTests.mapSheet(rows, notes, "Resumen 2025");

  assert.equal(dto.año, 2025);
  assert.equal(dto.meses[0].internet, 0);
  assert.equal(dto.meses[0].notaInternet, undefined);
});

test("ResumenAnualMapperTests - conserva null cuando Internet existe pero está vacío", () => {
  const rows = createSummaryRows(2026, currentHeaders, 16);
  rows[2][4] = "";
  const notes = rows.map(() => Array(19).fill(""));

  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.meses[0].internet, null);
});

test("ResumenAnualMapperTests - omite meses sin valores ni notas", () => {
  const oldHeaders = currentHeaders.filter((header) => header !== "Internet");
  const rows = createSummaryRows(2021, oldHeaders, 15);
  for (const row of rows.slice(2, 4)) {
    for (let columnIndex = 1; columnIndex <= 11; columnIndex++) {
      row[columnIndex] = "-";
    }
    for (let columnIndex = 12; columnIndex <= 15; columnIndex++) {
      row[columnIndex] = 0;
    }
  }
  const notes = rows.map(() => Array(18).fill(""));

  const dto = mapperTests.mapSheet(rows, notes, "Resumen 2021");

  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.meses.map(({ mes }) => mes))),
    months.slice(2)
  );
});
