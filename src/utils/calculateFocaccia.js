export const calculateFocaccia = (values, setResults, setModalVisible) => {
  const {
    flourAmount,
    proteinContent,
    fiberContent,
    temperature,
    coldProofing,
  } = values

  const totalSalt = flourAmount * 0.02 // 2% di sale
  const totalYeast = flourAmount * 0.003 // 0.3% di lievito

  const baseHydration = 0.75 // 75% di idratazione di base per la focaccia
  const proteinAdjustment = Math.max(0, (proteinContent - 10) * 0.01)
  const fiberAdjustment = fiberContent * 0.003
  const totalWater =
    flourAmount * (baseHydration + proteinAdjustment + fiberAdjustment)

  const getProofingTime = (temp, isCold) => {
    if (isCold) return temp < 20 ? "24-36 h" : temp < 25 ? "18-24 h" : "12-18 h"
    return temp < 20 ? "8-10 h" : temp < 25 ? "6-8 h" : "5-6 h"
  }
  const riseTime = `${getProofingTime(
    temperature,
    coldProofing
  )} (total proofing time${coldProofing ? ", in refrigerator" : ""})`

  const wRating =
    proteinContent < 11
      ? "180 - 220"
      : proteinContent < 12
      ? "220 - 240"
      : proteinContent < 13
      ? "240 - 280"
      : proteinContent < 14
      ? "280 - 320"
      : "320+"

  const glycemicIndex =
    fiberContent > 10 ? "Low" : fiberContent > 5 ? "Medium" : "High"

  setResults({
    totalFlourAmount: flourAmount.toFixed(0),
    totalWater: totalWater.toFixed(0),
    totalSalt: totalSalt.toFixed(0),
    totalYeast: totalYeast.toFixed(1),
    riseTime,
    proteinRatio: proteinContent.toFixed(1),
    fiberRatio: fiberContent.toFixed(1),
    glycemicIndex,
    wRating,
  })

  setModalVisible(true)
}
