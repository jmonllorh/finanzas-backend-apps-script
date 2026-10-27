class SalaryEvolutionDTO {
  date!: Date | null;
  grossAnnualSalary!: number | null;
  grossAnnualSalaryNote?: string;
  grossAnnualIncrease!: number | null;
  grossAnnualIncreaseNote?: string;
  netMonthlySalary!: number | null;
  netMonthlySalaryNote?: string;
  netMonthlyIncrease!: number | null;
  netMonthlyIncreaseNote?: string;
  comments!: string | null;
}
