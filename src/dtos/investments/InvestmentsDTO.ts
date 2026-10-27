class InvestmentsDTO {
  funds!: FundRecordDTO;
  deposits!: DepositRecordDTO;
}

class FundRecordDTO {
  items!: MonthlyFundRecordDTO[];
  totals!: FundRecordTotalsDTO[];
  homeEmergencyFund!: number | null;
  homeEmergencyFundNote?: string;
}

class FundRecordTotalsDTO {
  type!: AssetType;
  value!: number | null;
  valueNote?: string;
  benefit!: number | null;
  benefitNote?: string;
  gain!: number | null;
  gainNote?: string;
}

class MonthlyFundRecordDTO {
  date!: Date;
  assets!: FundAssetDTO[];
  maximumHomePurcharsePrice!: number | null;
  maximumHomePurcharsePriceNote?: string;
}

class FundAssetDTO {
  type!: AssetType;
  value!: number | null;
  valueNote?: string;
  contributed?: number | null;
  contributedNote?: string;
  benefit?: number | null;
  benefitNote?: string;
  gain?: number | null;
  gainNote?: string;
}

class DepositRecordDTO {
  items!: DepositDTO[];
  totalInterest!: number | null;
  totalInterestNote?: string;
  totalAssetAmount!: number | null;
  totalAssetAmountNote?: string;
}

class DepositDTO {
  institution!: string;
  amount!: number | null;
  amountNote?: string;
  startDate!: Date;
  expirationDate!: Date;
  nominalInterestRate!: number | null;
  nominalInterestRateNote?: string;
  grossInterest!: number | null;
  grossInterestNote?: string;
  netInterest!: number | null;
  netInterestNote?: string;
  isActive!: boolean;
}
