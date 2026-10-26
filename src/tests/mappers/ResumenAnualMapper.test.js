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
      "../../../dist/dtos/comun/UnidadValue.js",
      "../../../dist/dtos/comun/RegistroWrapperDTO.js",
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
      alquiler: { valor: 1, unidad: "€", nota: "Nota del alquiler" },
      electricidad: { valor: 2, unidad: "€" },
      agua: { valor: 3, unidad: "€" },
      internet: { valor: 4, unidad: "€" },
      inversiones: { valor: 5, unidad: "€" },
      suscripciones: { valor: 6, unidad: "€" },
      medicos: { valor: 7, unidad: "€" },
      comidaLimpieza: { valor: 8, unidad: "€" },
      ocio: { valor: 9, unidad: "€" },
      deporte: { valor: 10, unidad: "€" },
      transporte: { valor: 11, unidad: "€" },
      otros: { valor: 12, unidad: "€" },
      ahorroNeto: { valor: 13, unidad: "€" },
      ahorroBruto: { valor: 14, unidad: "€" },
      totalGastos: { valor: 15, unidad: "€" },
      ingresosFijos: { valor: 16, unidad: "€" }
    }
  );
  assert.equal(dto.total.alquiler.valor, 20);
  assert.equal(dto.total.viajes.valor, 100);
  assert.equal(dto.total.bonosAyudasRenta.valor, 50);
  assert.equal(dto.mediaMensual.totalGastos.valor, 2);
});

test("ResumenAnualMapperTests - representa como null campos que no existen en años antiguos", () => {
  const oldHeaders = currentHeaders.filter((header) => header !== "Internet");
  const rows = createSummaryRows(2025, oldHeaders, 15);
  const notes = rows.map(() => Array(18).fill(""));

  const dto = mapperTests.mapSheet(rows, notes, "Resumen 2025");

  assert.equal(dto.año, 2025);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.meses[0].internet)),
    { valor: null, unidad: "€" }
  );
});
