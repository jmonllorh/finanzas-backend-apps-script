class TravelDTO {
  year!: number;
  trips!: TripDTO[];
  total!: number | null;
  totalNote?: string;
}

class TripDTO {
  name!: string;
  expenses!: TripExpenseDTO[];
  total!: number | null;
  totalNote?: string;
}

class TripExpenseDTO {
  amount!: number | null;
  amountNote?: string;
  comment!: string | null;
}
