class ExpenseCategoryDTO {
  year!: number;
  months!: MonthlyCategoryExpensesDTO[];
}

class MonthlyCategoryExpensesDTO {
  month!: Month;
  amounts!: CategoryAmountDTO[];
  total!: number | null;
  totalNote?: string;
}

class CategoryAmountDTO {
  value!: number;
  note?: string;
}
