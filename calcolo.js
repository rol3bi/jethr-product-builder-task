const COSTANTI_FISCALI = {
  inps: {
    aliquotaDipendente: 0.0919, // L. 335/1995
  },
  irpef: {
    // TUIR art. 11, soglie L. 199/2025 (Legge di Bilancio 2026)
    scaglioni: [
      { fino: 28000, aliquota: 0.23 },
      { fino: 50000, aliquota: 0.33 },
      { fino: Infinity, aliquota: 0.43 },
    ],
  },
  detrazioneLavoroDipendente: {
    // TUIR art. 13
    sogliaBassa: 15000,
    importoFisso: 1955,
    sogliaMedia: 28000,
    coefficienteA: 1910,
    coefficienteB: 1190,
    baseB: 13000,
    sogliaAlta: 50000,
    baseC: 22000,
  },
  addizionaleRegionale: {
    // Regione Lombardia, l.r. 10/2003 art. 72
    scaglioni: [
      { fino: 15000, aliquota: 0.0123 },
      { fino: 28000, aliquota: 0.0158 },
      { fino: 50000, aliquota: 0.0172 },
      { fino: Infinity, aliquota: 0.0173 },
    ],
  },
  addizionaleComunale: {
    // Comune di Milano
    aliquota: 0.008,
    sogliaEsenzione: 23000,
  },
  mensilita: 13,
};

// Aliquota per fascia solo sulla quota di base che ricade in quella fascia
// (non sull'intero importo). Usata per IRPEF e addizionale regionale.
function applicaScaglioni(base, scaglioni) {
  let imposta = 0;
  let sogliaPrecedente = 0;
  for (const scaglione of scaglioni) {
    if (base <= sogliaPrecedente) break;
    const quota = Math.min(base, scaglione.fino) - sogliaPrecedente;
    imposta += quota * scaglione.aliquota;
    sogliaPrecedente = scaglione.fino;
  }
  return imposta;
}

function calcolaINPS(ral) {
  return ral * COSTANTI_FISCALI.inps.aliquotaDipendente;
}

function calcolaImponibileFiscale(ral, inps) {
  return ral - inps;
}

function calcolaIRPEFLorda(imponibile) {
  return applicaScaglioni(imponibile, COSTANTI_FISCALI.irpef.scaglioni);
}

// Fasce TUIR art. 13: fissa fino a 15k, poi due formule decrescenti fino a
// azzerarsi a 50k.
function calcolaDetrazioneLavoroDipendente(imponibile) {
  const d = COSTANTI_FISCALI.detrazioneLavoroDipendente;
  if (imponibile <= d.sogliaBassa) {
    return d.importoFisso;
  }
  if (imponibile <= d.sogliaMedia) {
    return d.coefficienteA + (d.coefficienteB * (d.sogliaMedia - imponibile)) / d.baseB;
  }
  if (imponibile < d.sogliaAlta) {
    return (d.coefficienteA * (d.sogliaAlta - imponibile)) / d.baseC;
  }
  return 0;
}

function calcolaAddizionaleRegionale(imponibile) {
  return applicaScaglioni(imponibile, COSTANTI_FISCALI.addizionaleRegionale.scaglioni);
}

function calcolaAddizionaleComunale(imponibile) {
  const c = COSTANTI_FISCALI.addizionaleComunale;
  return imponibile > c.sogliaEsenzione ? imponibile * c.aliquota : 0;
}

function calcolaNetto(ral) {
  const inps = calcolaINPS(ral);
  const imponibileFiscale = calcolaImponibileFiscale(ral, inps);
  const irpefLorda = calcolaIRPEFLorda(imponibileFiscale);
  const detrazioneLavoroDipendente = calcolaDetrazioneLavoroDipendente(imponibileFiscale);
  const irpefNetta = Math.max(0, irpefLorda - detrazioneLavoroDipendente);
  const addizionaleRegionale = calcolaAddizionaleRegionale(imponibileFiscale);
  const addizionaleComunale = calcolaAddizionaleComunale(imponibileFiscale);

  const trattenuteTotali = inps + irpefNetta + addizionaleRegionale + addizionaleComunale;
  const nettoAnnuo = ral - trattenuteTotali;
  const nettoMensile = nettoAnnuo / COSTANTI_FISCALI.mensilita;

  return {
    ral,
    inps,
    imponibileFiscale,
    irpefLorda,
    detrazioneLavoroDipendente,
    irpefNetta,
    addizionaleRegionale,
    addizionaleComunale,
    trattenuteTotali,
    nettoAnnuo,
    nettoMensile,
  };
}
