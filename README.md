# jethr-product-builder-task

# Calcolatore RAL → Netto

Prototipo che, data una Retribuzione Annua Lorda (RAL), calcola il netto
annuale e mensile percepito da un dipendente, mostrando ogni voce trattenuta
(contributi INPS, IRPEF, addizionali regionale e comunale).

Ipotesi assunte come da traccia: dipendente a tempo indeterminato, residente
a Milano, nessuna agevolazione fiscale o contributiva particolare.

## Come si usa

Apri `index.html` in un browser. Nessuna build, nessuna dipendenza.

## Struttura

- `calcolo.js` — costanti fiscali e funzioni pure di calcolo (nessuna logica
  di UI). `calcolaNetto(ral)` è il punto d'ingresso: restituisce un oggetto
  con ogni step intermedio.
- `app.js` — legge l'input, chiama `calcolaNetto()`, stampa il risultato.
- `index.html` — markup e stili.

## Logica di calcolo

```
RAL
− Contributi INPS (9,19%)
= Imponibile fiscale
→ IRPEF lorda (scaglioni progressivi)
− Detrazione lavoro dipendente (art. 13 TUIR)
= IRPEF netta
− Addizionale regionale (Lombardia)
− Addizionale comunale (Milano)
= Netto annuo
÷ 13 mensilità
= Netto mensile
```

## Dati fiscali usati (anno 2026) e fonti

| Voce | Valore | Fonte |
|---|---|---|
| INPS dipendente | 9,19% sulla RAL | L. 335/1995, art. 12 |
| IRPEF | 23% fino a 28.000€; 33% fino a 50.000€; 43% oltre | TUIR art. 11, come modificato da L. 199/2025 (Legge di Bilancio 2026) |
| Detrazione lavoro dipendente | 1.955€ fino a 15.000€; 1.910 + 1.190×(28.000−reddito)/13.000 fino a 28.000€; 1.910×(50.000−reddito)/22.000 fino a 50.000€; 0 oltre | TUIR art. 13 |
| Addizionale regionale | 1,23% / 1,58% / 1,72% / 1,73% a scaglioni (soglie 15.000 / 28.000 / 50.000€) | Regione Lombardia, l.r. 10/2003 art. 72 |
| Addizionale comunale | 0,8%, esente sotto 23.000€ di imponibile | Comune di Milano, delibera su portale MEF |

I dati sono isolati nell'oggetto `COSTANTI_FISCALI` in `calcolo.js`, con la
fonte a fianco di ogni voce, così da poter essere aggiornati anno per anno
senza toccare la logica di calcolo.

## Semplificazioni adottate

Il dominio (busta paga italiana) è molto più ampio di quanto un prototipo
possa coprire. Scelte fatte per restare nel caso standard richiesto:

- **Mensilità fissate a 13** (nessuna quattordicesima): la tredicesima è
  distribuita nel netto annuo e divisa su 13 mensilità, non erogata come
  voce separata a dicembre.
- **Nessun elemento variabile in busta paga**: niente straordinari, welfare
  aziendale, buoni pasto, superminimo, scatti di anzianità — solo la RAL
  base.
- **Nessuna detrazione per carichi di famiglia** e nessun'altra detrazione
  IRPEF (spese mediche, mutuo, ecc.), coerente con "nessuna agevolazione
  particolare".
- **Non incluso il contributo aggiuntivo IVS dell'1%** sulla quota di RAL
  eccedente la prima fascia pensionabile (~56.224€ per il 2026): rilevante
  solo per redditi molto alti, fuori dal caso standard.
- **Non incluso il "trattamento integrativo"** (ex bonus Renzi, fino a
  1.200€/anno per redditi bassi) né l'ulteriore detrazione da cuneo fiscale
  per la fascia 20.000–32.000€: entrambi dipendono da condizioni di
  capienza dell'IRPEF lorda che introdurrebbero casistica non richiesta
  dalla traccia.
- **Anno d'imposta corrente in corso (2026)** assunto per intero, senza
  proporzionamento a giorni lavorati nell'anno.

Ogni punto sopra è un'ipotesi di semplificazione, non un errore: la logica
sottostante (scaglioni, formula della detrazione, addizionali) è quella
reale e verificabile.