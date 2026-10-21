class ResumenAnualDTO {
  año!: number;
  meses!: ResumenMensualDTO[];
  total!: TotalAnualDTO;
  mediaMensual!: ResumenCamposFinancierosDTO;
}

class ResumenMensualDTO extends ResumenCamposFinancierosDTO {
  mes!: MesDTO;
}

class TotalAnualDTO extends ResumenCamposFinancierosDTO {
  viajes!: number | null;
  bonosAyudasRenta!: number | null;
}

