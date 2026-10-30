# Contrato del servicio financiero

Especificación para los clientes que consumen los datos de Google Apps Script, en particular la aplicación front Android. El contrato se refleja en los DTO de `src/dtos/` y en la respuesta de ejemplo `assets/response.json`; los datos y las etiquetas de unidades proceden de `assets/Hoja.xlsx`.

## Llamada HTTP

```http
GET https://script.google.com/macros/s/{deploymentId}/dev
Accept: application/json
```

- No requiere parámetros de consulta ni cuerpo.
- La respuesta es JSON (`application/json`).
- La URL proporcionada termina en `/dev`: es el despliegue de desarrollo de Apps Script. Antes de publicar la app, el equipo debe confirmar con el responsable del servicio la URL y los permisos del despliegue de producción. No sustituir `/dev` por `/exec` por cuenta propia.
- El cliente Android debe permitir seguir las redirecciones HTTP del endpoint de Apps Script y realizar la llamada en segundo plano, con timeout y tratamiento de fallos de red adecuados.
- El código del servicio no define un código HTTP distinto para los errores funcionales. No usar únicamente el código HTTP para decidir si la operación fue correcta: comprobar también `status`. La plataforma puede devolver una respuesta no JSON ante fallos no controlados; el cliente debe tolerar errores de transporte o cuerpos que no se puedan decodificar como el DTO.

## Respuestas

### Éxito

`status` vale `"success"`. La respuesta contiene todos los campos de nivel superior indicados más abajo. Cada campo de hoja puede ser `null` si esa pestaña no está disponible en el Spreadsheet.

```json
{
  "status": "success",
  "annualSummaries": [],
  "salaryEvolution": [],
  "foodAndCleaning": [],
  "leisure": [],
  "sports": [],
  "transportation": [],
  "otherExpenses": [],
  "electricity": [],
  "water": [],
  "gas": [],
  "travel": [],
  "investments": null,
  "fundAllocations": [],
  "totalBreakdown": null
}
```

El ejemplo es esquemático: cada valor también puede ser `null` según la disponibilidad de su pestaña. Una lista vacía (`[]`) significa que la pestaña existe, pero no produjo elementos; no equivale a `null`.

### Error

Los errores de configuración que gestiona el servicio usan esta forma:

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

Si `status` es `"error"`, `message` es un texto informativo para diagnóstico; no mostrarlo como mensaje de interfaz sin adaptarlo. La lectura de la propiedad `SPREADSHEET_ID` y su ausencia o valor vacío están contempladas. Otros errores durante la lectura o transformación de las hojas pueden ser gestionados por Apps Script y no tienen garantizado este formato JSON. En Android, separar los errores HTTP/red, los errores de decodificación y el error funcional `status: "error"`.

## Convenciones de los datos

- Los nombres y la capitalización de las propiedades son parte del contrato: respetarlos al crear los modelos del cliente.
- Los campos numéricos son números JSON (no cadenas con símbolos de moneda). Los valores monetarios se expresan en euros (`€`); no añadir ni quitar escalas al parsearlos.
- `null` indica un valor vacío/no disponible en la celda o no aplicable. Un `0` es un valor numérico válido y no debe tratarse como `null`.
- Las propiedades `...Note` y `comment` son texto auxiliar procedente de las notas o comentarios de la hoja. Las propiedades `...Note` pueden no aparecer si no hay nota; `null` se mantiene en los campos que admiten explícitamente ausencia de valor.
- Los arrays conservan el orden en que se recorren los datos de la hoja; el cliente no debe depender de un orden distinto del que reciba.
- Las fechas se serializan como cadenas ISO 8601 en UTC, por ejemplo `2017-02-14T23:00:00.000Z`. Usar un parser ISO 8601. Si se presentan como fecha de calendario, evitar que la conversión de zona horaria cambie el día mostrado.
- Los porcentajes se devuelven en escala porcentual: `2.25` significa `2,25 %`, no `0,0225`.

## Estructura de la respuesta de éxito

La respuesta contiene estas propiedades:

| Propiedad | Tipo | Contenido |
|---|---|---|
| `status` | `Status` | Estado funcional de la respuesta; valores descritos en [Enumeraciones](#enumeraciones). |
| `message` | cadena opcional | Mensaje incluido en respuestas de error normalizadas. |
| `annualSummaries` | lista o `null` | Resúmenes mensuales, total y media de cada pestaña `Resumen AAAA`. |
| `salaryEvolution` | lista o `null` | Evolución salarial. |
| `foodAndCleaning` | lista o `null` | Gastos de Comida/Limpieza por año y mes. |
| `leisure` | lista o `null` | Gastos de Ocio por año y mes. |
| `sports` | lista o `null` | Gastos de Deporte por año y mes. |
| `transportation` | lista o `null` | Gastos de Transporte por año y mes. |
| `otherExpenses` | lista o `null` | Gastos de Otros por año y mes. |
| `electricity` | lista o `null` | Importes, consumo y precios mensuales de electricidad. |
| `water` | lista o `null` | Importes, consumo y precio por litro de agua. |
| `gas` | lista `GasDTO` o `null` | Importes, consumo y precios mensuales de la pestaña Gas. |
| `travel` | lista o `null` | Viajes, gastos y totales por año. |
| `investments` | objeto o `null` | Registros y totales de fondos y depósitos. |
| `fundAllocations` | lista o `null` | Distribución objetivo de fondos. |
| `totalBreakdown` | objeto o `null` | Desglose financiero histórico y activos. |

### Campos financieros compartidos

`months`, `monthlyAverage` y otros objetos financieros reutilizan los campos siguientes. Salvo que se indique otra cosa en una sección específica, todos son importes monetarios en euros (`€`).

| Campo | Significado |
|---|---|
| `rent` | Alquiler. |
| `electricity` | Gasto de electricidad. |
| `water` | Gasto de agua. |
| `gas` | Gasto de gas. |
| `internet` | Gasto de Internet. |
| `investments` | Importe de inversiones registrado en el resumen. |
| `subscriptions` | Suscripciones. |
| `medicalExpenses` | Gastos médicos. |
| `foodAndCleaning` | Gastos de comida y limpieza. |
| `leisure` | Gastos de ocio. |
| `sports` | Gastos de deporte. |
| `transportation` | Gastos de transporte. |
| `otherExpenses` | Otros gastos. |
| `netSavings` | Ahorro neto. |
| `grossSavings` | Ahorro bruto. |
| `totalExpenses` | Total de gastos comunes. |
| `regularIncome` | Ingresos fijos. |
| `<campo>Note` | Nota de la celda asociada al campo; texto opcional. |

## DTO por propiedad

### `annualSummaries`

Cada elemento corresponde a una pestaña anual e incluye:

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `year` | entero, año | Año del resumen. |
| `months` | lista `Month` | Elementos mensuales con `month` [Enumeraciones](#enumeraciones) y todos los campos financieros compartidos en `€`. |
| `total` | objeto | Campos financieros compartidos en `€`, más los campos siguientes. |
| `monthlyAverage` | `FinancialSummaryFieldsDTO` | Media mensual de los campos financieros compartidos, definidos en [Campos financieros compartidos](#campos-financieros-compartidos), en `€` por mes. |
| `travelExpenses` | número o `null`, `€` | Gastos anuales de viajes. |
| `travelExpensesNote` | texto opcional | Nota de los gastos de viajes. |
| `bonusesAndBenefits` | número o `null`, `€` | Bonos y beneficios del total anual. |
| `bonusesAndBenefitsNote` | texto opcional | Nota de bonos y beneficios. |

Los meses sin datos financieros significativos pueden omitirse de `months`.

### `salaryEvolution`

Cada elemento representa una fila de la pestaña `Evolución salario`.

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `date` | fecha ISO 8601 o `null` | Fecha del registro. |
| `grossAnnualSalary` | número o `null`, `€` anuales | Salario bruto anual. |
| `grossAnnualSalaryNote` | texto opcional | Nota del salario bruto anual. |
| `grossAnnualIncrease` | número o `null`, `%` | Incremento bruto anual. |
| `grossAnnualIncreaseNote` | texto opcional | Nota del incremento bruto anual. |
| `netMonthlySalary` | número o `null`, `€` mensuales | Salario neto mensual. |
| `netMonthlySalaryNote` | texto opcional | Nota del salario neto mensual. |
| `netMonthlyIncrease` | número o `null`, `%` | Incremento neto mensual. |
| `netMonthlyIncreaseNote` | texto opcional | Nota del incremento neto mensual. |
| `comments` | texto o `null` | Comentarios de la fila. |

### Categorías de gastos

Se aplica a `foodAndCleaning`, `leisure`, `sports`, `transportation` y `otherExpenses`. Cada elemento anual tiene:

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `year` | entero, año | Año del bloque. |
| `months` | lista | Los doce meses del año, con nombre, importes y total. |
| `months[].month` | `Month` | Mes; valores descritos en [Enumeraciones](#enumeraciones). |
| `months[].amounts` | lista | Conceptos de gasto; el texto del concepto puede llegar en `note`. |
| `months[].amounts[].value` | número, `€` | Importe de un concepto. |
| `months[].amounts[].note` | texto opcional | Descripción o nota asociada al importe. |
| `months[].total` | número o `null`, `€` | Total mensual de la categoría. |
| `months[].totalNote` | texto opcional | Nota del total mensual. |

### `electricity`

Cada elemento corresponde a un año; `months` contiene los meses presentes en la hoja.

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `year` | entero, año | Año del bloque. |
| `months[].month` | `Month` | Mes; valores descritos en [Enumeraciones](#enumeraciones). |
| `months[].amount` | número o `null`, `€` | Importe total mensual de electricidad. |
| `months[].amountNote` | texto opcional | Nota del importe. |
| `months[].consumption` | número o `null`, `kW` | Consumo eléctrico total. |
| `months[].consumptionNote` | texto opcional | Nota del consumo. |
| `months[].price` | objeto | Valores de precios asociados al mes. |
| `months[].price.energyPrice` | número o `null`, `€/kWh` | Precio de energía sin impuestos. |
| `months[].price.energyPriceNote` | texto opcional | Nota del precio de energía. |
| `months[].price.peakPowerPrice` | número o `null`, `€/kW día` | Precio diario de potencia punta. |
| `months[].price.peakPowerPriceNote` | texto opcional | Nota del precio de potencia punta. |
| `months[].price.offPeakPowerPrice` | número o `null`, `€/kW día` | Precio diario de potencia valle. |
| `months[].price.offPeakPowerPriceNote` | texto opcional | Nota del precio de potencia valle. |
| `months[].price.totalPowerPrice` | número o `null`, `€/kW día` | Precio diario total de potencia. |
| `months[].price.totalPowerPriceNote` | texto opcional | Nota del precio total de potencia. |

### `water`

Cada elemento corresponde a un año.

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `year` | entero, año | Año del bloque. |
| `months[].month` | `Month` | Mes; valores descritos en [Enumeraciones](#enumeraciones). |
| `months[].amount` | número o `null`, `€` | Importe de agua, que puede incluir basura, alcantarillado y otros conceptos según la hoja. |
| `months[].amountNote` | texto opcional | Nota del importe. |
| `months[].consumption` | número o `null`, `m³` | Consumo de agua. |
| `months[].consumptionNote` | texto opcional | Nota del consumo. |
| `months[].pricePerLiter` | número o `null`, `€/L` | Precio por litro, unidad indicada expresamente por la hoja. |
| `months[].pricePerLiterNote` | texto opcional | Nota del precio por litro. |

### `gas`

Cada elemento corresponde a un año de la pestaña `Gas` y contiene los doce meses, incluidos los que solo tienen ceros. Si la pestaña no existe, `gas` es `null`.

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `year` | entero, año | Año del bloque. |
| `months[].month` | `Month` | Mes; valores descritos en [Enumeraciones](#enumeraciones). |
| `months[].amount` | número o `null`, `€` | Importe total. |
| `months[].amountNote` | texto opcional | Nota del importe total. |
| `months[].consumption` | número o `null`, `kWh` | Consumo total. |
| `months[].consumptionNote` | texto opcional | Nota del consumo total. |
| `months[].price` | `GasPriceDTO` | Precios asociados al mes. |
| `months[].price.fixedPrice` | número o `null`, `€` | Precio fijo, sin inferir una tarifa diaria ni otro periodo. |
| `months[].price.fixedPriceNote` | texto opcional | Nota del precio fijo. |
| `months[].price.energyPrice` | número o `null`, `€/kWh` | Precio de energía, conservando la precisión de la celda. |
| `months[].price.energyPriceNote` | texto opcional | Nota del precio de energía. |

El importe total, el consumo y el precio fijo se redondean a dos decimales, siguiendo las convenciones de los mappers existentes. Las celdas vacías se representan con `null`; las notas vacías se omiten.

### `travel`

Cada elemento corresponde a un año.

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `year` | entero, año | Año de los viajes. |
| `trips` | lista | Viajes registrados ese año. |
| `trips[].name` | cadena | Nombre del viaje. |
| `trips[].expenses` | lista | Gastos asociados al viaje. |
| `trips[].expenses[].amount` | número o `null`, `€` | Importe del gasto. |
| `trips[].expenses[].amountNote` | texto opcional | Nota asociada al importe. |
| `trips[].expenses[].comment` | texto o `null` | Comentario del gasto. |
| `trips[].total` | número o `null`, `€` | Total del viaje. |
| `trips[].totalNote` | texto opcional | Nota del total del viaje. |
| `total` | número o `null`, `€` | Total de viajes del año. |
| `totalNote` | texto opcional | Nota del total anual. |

### `investments`

Objeto con `funds` y `deposits`.

#### `funds`

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `items` | lista | Registros históricos mensuales. |
| `items[].date` | fecha ISO 8601 | Fecha del registro. |
| `items[].assets` | lista de `FundAssetDTO` | Activos del registro; estructura definida en las filas anidadas siguientes. |
| `items[].assets[].type` | `AssetType` (subconjunto aplicable) | Tipo de activo; valores descritos en [Enumeraciones](#enumeraciones). |
| `items[].assets[].value` | número o `null`, `€` | Valor del activo. |
| `items[].assets[].valueNote` | texto opcional | Nota del valor. |
| `items[].assets[].contributed` | número o `null`, `€`, opcional | Importe aportado, cuando aplica. |
| `items[].assets[].contributedNote` | texto opcional | Nota del importe aportado. |
| `items[].assets[].benefit` | número o `null`, `€`, opcional | Beneficio, cuando aplica. |
| `items[].assets[].benefitNote` | texto opcional | Nota del beneficio. |
| `items[].assets[].gain` | número o `null`, `%`, opcional | Ganancia porcentual, cuando aplica. |
| `items[].assets[].gainNote` | texto opcional | Nota de la ganancia. |
| `items[].maximumHomePurcharsePrice` | número o `null`, `€` | Precio máximo de vivienda calculado en la hoja. |
| `items[].maximumHomePurcharsePriceNote` | texto opcional | Nota del precio máximo de vivienda. |
| `totals` | lista | Totales por tipo de activo. |
| `totals[].type` | `AssetType` | Tipo de activo; valores descritos en [Enumeraciones](#enumeraciones). |
| `totals[].value` | número o `null`, `€` | Valor del activo. |
| `totals[].valueNote` | texto opcional | Nota del valor. |
| `totals[].benefit` | número o `null`, `€` | Beneficio del activo, si aplica. |
| `totals[].benefitNote` | texto opcional | Nota del beneficio. |
| `totals[].gain` | número o `null`, `%` | Ganancia porcentual, si aplica. |
| `totals[].gainNote` | texto opcional | Nota de la ganancia. |
| `homeEmergencyFund` | número o `null`, `€` | Colchón de seguridad para vivienda. |
| `homeEmergencyFundNote` | texto opcional | Nota del colchón. |

#### `deposits`

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `items` | lista | Depósitos individuales. |
| `items[].institution` | cadena | Entidad del depósito. |
| `items[].amount` | número o `null`, `€` | Importe del depósito. |
| `items[].amountNote` | texto opcional | Nota del importe. |
| `items[].startDate` | fecha ISO 8601 | Fecha de inicio. |
| `items[].expirationDate` | fecha ISO 8601 | Fecha de vencimiento. |
| `items[].nominalInterestRate` | número o `null`, `%` | T.I.N. (tasa de interés nominal) del depósito. |
| `items[].nominalInterestRateNote` | texto opcional | Nota de la T.I.N. |
| `items[].grossInterest` | número o `null`, `€` | Intereses brutos. |
| `items[].grossInterestNote` | texto opcional | Nota de los intereses brutos. |
| `items[].netInterest` | número o `null`, `€` | Intereses netos. |
| `items[].netInterestNote` | texto opcional | Nota de los intereses netos. |
| `items[].isActive` | booleano | Indica si el depósito figura como activo (`true`) o no (`false`). |
| `totalInterest` | número o `null`, `€` | Intereses totales de depósitos. |
| `totalInterestNote` | texto opcional | Nota de los intereses totales. |
| `totalAssetAmount` | número o `null`, `€` | Importe total de activos en depósitos. |
| `totalAssetAmountNote` | texto opcional | Nota del importe total. |

### `fundAllocations`

Cada elemento representa un fondo de la distribución objetivo.

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `category` | `FundCategory` o `null` | Categoría del fondo; valores descritos en [Enumeraciones](#enumeraciones). |
| `name` | cadena o `null` | Nombre comercial. |
| `weight` | número o `null`, `%` | Peso objetivo del fondo, en escala porcentual. |
| `weightNote` | texto opcional | Nota del peso. |
| `monthlyContribution` | número o `null`, `€` al mes | Aportación mensual. |
| `monthlyContributionNote` | texto opcional | Nota de la aportación. |
| `isin` | cadena o `null` | Código ISIN. |
| `technicalName` | cadena o `null` | Nombre técnico del fondo. |
| `commission` | número o `null`, `%` | Comisión, en escala porcentual. |
| `commissionNote` | texto opcional | Nota de la comisión. |

### `totalBreakdown`

Objeto con los campos siguientes:

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `years` | lista de `FinancialBreakdownDTO` | Desgloses financieros por año; campos definidos en la tabla `FinancialBreakdownDTO` de esta sección. |
| `total` | `FinancialBreakdownDTO` | Desglose acumulado; campos definidos en la tabla `FinancialBreakdownDTO` de esta sección. |
| `monthlyAverage` | `FinancialSummaryFieldsDTO` | Media mensual de los campos financieros compartidos, definidos en [Campos financieros compartidos](#campos-financieros-compartidos), en `€` por mes. |
| `assets` | lista de `BreakdownAssetDTO` | Valores por tipo de activo; campos definidos en la tabla `BreakdownAssetDTO` de esta sección. |

#### `FinancialBreakdownDTO` (`years[]` y `total`)

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| Campos financieros compartidos | `FinancialSummaryFieldsDTO` | Campos descritos en [Campos financieros compartidos](#campos-financieros-compartidos), todos en `€`. |
| `year` | entero o `null` | Año del desglose; es `null` en `total`. |
| `travelExpenses` | número o `null`, `€` | Gastos de viajes. |
| `travelExpensesNote` | texto opcional | Nota de los gastos de viajes. |
| `bonusesAndBenefits` | número o `null`, `€` | Bonos y beneficios. |
| `bonusesAndBenefitsNote` | texto opcional | Nota de bonos y beneficios. |
| `totalIncome` | número o `null`, `€` | Ingresos totales. |
| `totalIncomeNote` | texto opcional | Nota de ingresos totales. |

#### `BreakdownAssetDTO` (`assets[]`)

| Campo | Tipo/unidad | Descripción |
|---|---|---|
| `type` | `AssetType` | Tipo de activo; valores descritos en [Enumeraciones](#enumeraciones). |
| `value` | número o `null`, `€` | Valor del activo. |
| `valueNote` | texto opcional | Nota del valor. |

## Enumeraciones

Los valores de estas enumeraciones son cadenas exactas, sensibles a mayúsculas, acentos y espacios; el cliente debe conservarlos tal como se reciben.

| Enumeración | Valores permitidos | Uso en la respuesta |
|---|---|---|
| `Status` | `success`, `error` | `status`. |
| `Month` | `Enero`, `Febrero`, `Marzo`, `Abril`, `Mayo`, `Junio`, `Julio`, `Agosto`, `Septiembre`, `Octubre`, `Noviembre`, `Diciembre` | Campo `month` de los DTO con datos mensuales. |
| `AssetType` | `Bancos`, `Depósitos`, `Renta variable`, `Fondo monetario`, `Renta fija`, `Total` | Tipos de activo en `investments.funds.totals[].type` y `totalBreakdown.assets[].type`; `investments.funds.items[].assets[].type` usa un subconjunto. |
| `FundCategory` | `Fondos indexados`, `Fondos value`, `Renta fija`, `Fondos monetarios`, `No usados` | `fundAllocations[].category`. |

## Consumo recomendado en Android

1. Modelar números como tipos numéricos anulables cuando el contrato indique `null`; no convertir `null` a cero.
2. Deserializar `status` antes de presentar los datos y derivar la interfaz de la respuesta funcional, no solo del código HTTP.
3. Tratar cada propiedad superior como nullable, incluso si normalmente llega como lista u objeto.
4. No usar los campos de texto `Note` para cálculos. Son anotaciones libres y pueden contener varias líneas, importes escritos como texto o caracteres especiales.
5. Presentar importes con formato regional de moneda, sin asumir que todos los números son euros: aplicar la unidad indicada para cada campo. La moneda se expresa en `€`, los porcentajes en `%`, el consumo eléctrico en `kW`, el consumo de agua en `m³`, el precio de energía en `€/kWh`, el precio de potencia en `€/kW día` y el precio del agua en `€/L`.
6. Evitar calcular acumulados propios a partir de los datos recibidos salvo que la regla de negocio esté acordada: la respuesta ya incluye totales y medias calculados desde la hoja.
