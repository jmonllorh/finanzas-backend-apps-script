class TotalBreakdownDTO {
  years!: FinancialBreakdownDTO[];
  total!: FinancialBreakdownDTO;
  monthlyAverage!: FinancialSummaryFieldsDTO;
  assets!: BreakdownAssetDTO[];
}

interface FinancialBreakdownDTO extends FinancialSummaryFieldsDTO {}
class FinancialBreakdownDTO {
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
