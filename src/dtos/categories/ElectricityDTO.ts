class ElectricityDTO {
  year!: number;
  months!: ElectricityDetailDTO[];
}

class ElectricityDetailDTO {
  month!: Month;
  amount!: number | null;
  amountNote?: string;
  consumption!: number | null;
  consumptionNote?: string;
  price!: ElectricityPriceDTO;
}

class ElectricityPriceDTO {
  energyPrice!: number | null;
  energyPriceNote?: string;
  peakPowerPrice!: number | null;
  peakPowerPriceNote?: string;
  offPeakPowerPrice!: number | null;
  offPeakPowerPriceNote?: string;
  totalPowerPrice!: number | null;
  totalPowerPriceNote?: string;
}
