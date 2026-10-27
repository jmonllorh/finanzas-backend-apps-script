class FinancialResponseDTO {
  status!: "success" | "error";
  message?: string;
  annualSummaries!: AnnualSummaryDTO[] | null;
  foodAndCleaning!: ExpenseCategoryDTO[] | null;
  leisure!: ExpenseCategoryDTO[] | null;
  sports!: ExpenseCategoryDTO[] | null;
  transportation!: ExpenseCategoryDTO[] | null;
  otherExpenses!: ExpenseCategoryDTO[] | null;
  electricity!: ElectricityDTO[] | null;
  water!: WaterDTO[] | null;
  travel!: TravelDTO[] | null;
  investments!: InvestmentsDTO | null;
  fundAllocations!: FundAllocationDTO[] | null;
  totalBreakdown!: TotalBreakdownDTO | null;
  salaryEvolution!: SalaryEvolutionDTO[] | null;
}
