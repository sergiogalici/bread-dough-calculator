export const calculateDough = (values, setResults, setModalVisible) => {
  const { flours, temperature, coldProofing } = values

  // Inizializzazione delle variabili
  let totalFlourAmount = 0
  let totalProtein = 0
  let totalFiber = 0
  let flourComposition = {}

  // Fattori di correzione per le proteine in base al tipo di farina
  const proteinFactor = {
    "grano duro": 0.85,
    "grano tenero": 0.95,
    "farina di segale": 0.05,
    "farina di farro": 0.15,
    "farina di mais": 0,
    "farina di riso": 0,
  }

  // Calcolo dei totali
  flours.forEach((flour) => {
    const { flourAmount, proteinContent, fiberContent, flourKind } = flour
    totalFlourAmount += flourAmount
    totalFiber += flourAmount * (fiberContent / 100)
    totalProtein +=
      flourAmount * (proteinContent / 100) * (proteinFactor[flourKind] || 1)
    flourComposition[flourKind] =
      (flourComposition[flourKind] || 0) + flourAmount
  })

  // Calcolo del sale (2% del peso della farina)
  const totalSalt = totalFlourAmount * 0.02

  // Calcolo del lievito in base alla temperatura
  const yeastFactor = temperature < 20 ? 0.02 : temperature < 25 ? 0.015 : 0.01
  const totalYeast = totalFlourAmount * yeastFactor

  // Calcolo dell'idratazione
  const baseHydration = 0.65 // 65% come base
  const proteinAdjustment = Math.max(
    0,
    (totalProtein / totalFlourAmount - 0.1) * 0.02
  )
  const fiberAdjustment = (totalFiber / totalFlourAmount) * 0.003
  const totalWater =
    totalFlourAmount * (baseHydration + proteinAdjustment + fiberAdjustment)

  // Calcolo dei tempi di lievitazione
  const getProofingTime = (temp, isCold) => {
    if (isCold) return temp < 20 ? "24-36 h" : temp < 25 ? "18-24 h" : "12-18 h"
    return temp < 20 ? "8-10 h" : temp < 25 ? "6-8 h" : "5-6 h"
  }
  const firstProofing = getProofingTime(temperature, false)
  const secondProofing = getProofingTime(temperature, coldProofing)
  const riseTime = `${firstProofing} (first proofing), ${secondProofing} (second proofing${
    coldProofing ? ", in refrigerator" : ""
  })`

  // Calcolo del W rating
  const proteinRatio = (totalProtein / totalFlourAmount) * 100
  const wRating =
    proteinRatio < 10
      ? "90 - 220"
      : proteinRatio < 11
      ? "160 - 240"
      : proteinRatio < 12
      ? "220 - 260"
      : proteinRatio < 13
      ? "240 - 290"
      : proteinRatio < 14
      ? "270 - 340"
      : proteinRatio < 15
      ? "320 - 430"
      : proteinRatio < 16
      ? "360 - 400+"
      : "400+"

  // Calcolo dell'indice glicemico
  const fiberRatio = (totalFiber / totalFlourAmount) * 100
  const glycemicIndex =
    fiberRatio > 10 ? "Low" : fiberRatio > 5 ? "Medium" : "High"

  setResults({
    totalFlourAmount: totalFlourAmount.toFixed(0),
    flourComposition: Object.entries(flourComposition)
      .map(([key, value]) => `${key}: ${value.toFixed(0)}g`)
      .join(", "),
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
