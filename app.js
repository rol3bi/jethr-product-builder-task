const formatoEuro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const inputRal = document.getElementById("ral");
const bottoneCalcola = document.getElementById("calcola");
const risultato = document.getElementById("risultato");

function riga(etichetta, valore, { segno = "", evidenzia = false } = {}) {
  const classe = evidenzia ? "riga riga--totale" : "riga";
  const prefisso = segno ? `${segno} ` : "";
  return `
    <div class="${classe}">
      <span class="riga__etichetta">${prefisso}${etichetta}</span>
      <span class="riga__valore">${formatoEuro.format(valore)}</span>
    </div>
  `;
}

function renderRisultato(r) {
  risultato.innerHTML = `
    ${riga("Retribuzione Annua Lorda (RAL)", r.ral)}
    ${riga("Contributi INPS (9,19%)", -r.inps, { segno: "−" })}
    ${riga("Imponibile fiscale", r.imponibileFiscale, { evidenzia: true })}

    ${riga("IRPEF lorda", -r.irpefLorda, { segno: "−" })}
    ${riga("Detrazione lavoro dipendente", r.detrazioneLavoroDipendente, { segno: "+" })}
    ${riga("IRPEF netta", -r.irpefNetta, { segno: "−" })}

    ${riga("Addizionale regionale (Lombardia)", -r.addizionaleRegionale, { segno: "−" })}
    ${riga("Addizionale comunale (Milano)", -r.addizionaleComunale, { segno: "−" })}

    ${riga("Netto annuo", r.nettoAnnuo, { evidenzia: true })}
    ${riga(`Netto mensile (÷13)`, r.nettoMensile, { evidenzia: true })}
  `;
  risultato.hidden = false;
}

function gestisciCalcolo() {
  const ral = Number(inputRal.value);
  if (!Number.isFinite(ral) || ral <= 0) {
    risultato.innerHTML = `<p class="errore">Inserisci una RAL valida, maggiore di zero.</p>`;
    risultato.hidden = false;
    return;
  }
  renderRisultato(calcolaNetto(ral));
}

bottoneCalcola.addEventListener("click", gestisciCalcolo);
inputRal.addEventListener("keydown", (e) => {
  if (e.key === "Enter") gestisciCalcolo();
});
