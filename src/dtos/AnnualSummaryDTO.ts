class AnnualSummaryDTO {
  year!: number;
  months!: MonthlySummaryDTO[];
  total!: AnnualTotalDTO;
  monthlyAverage!: FinancialSummaryFieldsDTO;
}

interface MonthlySummaryDTO extends FinancialSummaryFieldsDTO {}
class MonthlySummaryDTO {
  month!: Month;
}

interface AnnualTotalDTO extends FinancialSummaryFieldsDTO {}
class AnnualTotalDTO {
  travelExpenses!: number | null;
  travelExpensesNote?: string;
  bonusesAndBenefits!: number | null;
  bonusesAndBenefitsNote?: string;
}
