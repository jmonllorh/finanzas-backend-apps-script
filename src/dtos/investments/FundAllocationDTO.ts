class FundAllocationDTO {
  category!: FundCategory | null;
  name!: string | null;
  weight!: number | null;
  weightNote?: string;
  monthlyContribution!: number | null;
  monthlyContributionNote?: string;
  isin!: string | null;
  technicalName!: string | null;
  commission!: number | null;
  commissionNote?: string;
}

enum FundCategory {
  INDEXED_FUNDS = "Fondos indexados",
  VALUE_FUNDS = "Fondos value",
  FIXED_INCOME = "Renta fija",
  MONEY_MARKET_FUNDS = "Fondos monetarios",
  UNUSED = "No usados"
}
