class ResumenAnualDTO {
  año!: number;
  meses!: ResumenMensualDTO[];
  total!: TotalAnualDTO;
  mediaMensual!: ResumenCamposFinancierosDTO;
}

class ResumenMensualDTO extends ResumenCamposFinancierosDTO {
  mes!: MesValue;
}

class TotalAnualDTO extends ResumenCamposFinancierosDTO {
  viajes!: number | null;
  notaViajes?: string;
  bonosAyudasRenta!: number | null;
  notaBonosAyudasRenta?: string;
}
