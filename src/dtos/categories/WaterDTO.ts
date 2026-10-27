class WaterDTO {
  year!: number;
  months!: WaterDetailDTO[];
}

class WaterDetailDTO {
  month!: Month;
  amount!: number | null;
  amountNote?: string;
  consumption!: number | null;
  consumptionNote?: string;
  pricePerLiter!: number | null;
  pricePerLiterNote?: string;
}
