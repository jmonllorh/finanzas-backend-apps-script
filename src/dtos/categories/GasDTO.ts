class GasDTO {
  year!: number;
  months!: GasDetailDTO[];
}

class GasDetailDTO {
  month!: Month;
  amount!: number | null;
  amountNote?: string;
  consumption!: number | null;
  consumptionNote?: string;
  price!: GasPriceDTO;
}

class GasPriceDTO {
  fixedPrice!: number | null;
  fixedPriceNote?: string;
  energyPrice!: number | null;
  energyPriceNote?: string;
}
