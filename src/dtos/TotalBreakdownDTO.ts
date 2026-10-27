class TotalBreakdownDTO {
  years!: FinancialBreakdownDTO[];
  total!: FinancialBreakdownDTO;
  monthlyAverage!: FinancialSummaryFieldsDTO;
  assets!: BreakdownAssetDTO[];
}

class FinancialBreakdownDTO extends FinancialSummaryFieldsDTO {
  year!: number | null;
  travelExpenses!: number | null;
  travelExpensesNote?: string;
  bonusesAndBenefits!: number | null;
  bonusesAndBenefitsNote?: string;
  totalIncome!: number | null;
  totalIncomeNote?: string;
}

class BreakdownAssetDTO {
  type!: AssetType;
  value!: number | null;
  valueNote?: string;
}
