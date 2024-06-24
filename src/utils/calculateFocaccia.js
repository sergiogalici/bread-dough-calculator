export const calculateFocaccia = (values, setResults, setModalVisible) => {
  const {
    flourAmount,
    proteinContent,
    fiberContent,
    temperature,
    coldProofing,
  } = values
  const totalSalt = flourAmount * 0.02 // 2% di sale in base alla quantità di farina

  // Calcolo del lievito di birra per una lievitazione lunga (5-6 ore minimo)
  const yeastPercentage = 0.3 // 0.3% di lievito di birra secco
  const totalYeast = flourAmount * (yeastPercentage / 100)

  // Calcolo del tempo di lievitazione in base alla temperatura
  let proofingTime

  if (temperature < 20) {
    proofingTime = coldProofing ? "24-36 hours" : "8-10 hours"
  } else if (temperature < 25) {
    proofingTime = coldProofing ? "18-24 hours" : "6-8 hours"
  } else {
    proofingTime = coldProofing ? "12-18 hours" : "5-6 hours"
  }

  const riseTime = `${proofingTime} (total proofing time${
    coldProofing ? ", in refrigerator" : ""
  })`

  // Calcolo dell'idratazione e del W
  const proteinRatio = proteinContent
  const fiberRatio = fiberContent
  let waterRatio = 0.75 // 75% di idratazione di base per la focaccia
  waterRatio += fiberRatio * 0.003 // Aggiustamento per il contenuto di fibre

  let wRating = ""
  if (proteinRatio < 11) {
    wRating = "180 - 220"
  } else if (proteinRatio < 12) {
    wRating = "220 - 240"
  } else if (proteinRatio < 13) {
    wRating = "240 - 280"
  } else if (proteinRatio < 14) {
    wRating = "280 - 320"
  } else {
    wRating = "320+"
  }

  const totalWater = flourAmount * waterRatio

  // Calcolo dell'indice glicemico
  let glycemicIndex
  if (fiberRatio > 10) {
    glycemicIndex = "Low"
  } else if (fiberRatio > 5) {
    glycemicIndex = "Medium"
  } else {
    glycemicIndex = "High"
  }

  setResults({
    totalFlourAmount: flourAmount.toFixed(0),
    totalWater: totalWater.toFixed(0),
    totalSalt: totalSalt.toFixed(0),
    totalYeast: totalYeast.toFixed(1),
    riseTime,
    proteinRatio: proteinRatio.toFixed(1),
    fiberRatio: fiberRatio.toFixed(1),
    glycemicIndex,
    wRating,
  })

  setModalVisible(true)
}
