class AnnualSummaryDTO {
  year!: number;
  months!: MonthlySummaryDTO[];
  total!: AnnualTotalDTO;
  monthlyAverage!: FinancialSummaryFieldsDTO;
}

class MonthlySummaryDTO extends FinancialSummaryFieldsDTO {
  month!: Month;
}

class AnnualTotalDTO extends FinancialSummaryFieldsDTO {
  travelExpenses!: number | null;
  travelExpensesNote?: string;
  bonusesAndBenefits!: number | null;
  bonusesAndBenefitsNote?: string;
}
