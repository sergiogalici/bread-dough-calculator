export const calculatePizza = (values, setResults, setModalVisible) => {
  const { numberOfPizzas, weightPerPizza, flours, temperature, coldProofing } =
    values

  // Calcola il peso totale dell'impasto
  const totalDoughWeight = numberOfPizzas * weightPerPizza

  // Inizializza i totali
  let totalFlourAmount = 0
  let totalProtein = 0
  let totalFiber = 0
  let totalSoftWheat = 0
  let totalDurumWheat = 0
  let totalCornmeal = 0
  let totalRiceFlour = 0

  // Calcola la quantità totale di farina (assumiamo che sia il 62% del peso totale dell'impasto)
  const estimatedTotalFlour = totalDoughWeight * 0.62

  // Calcola le quantità di ogni tipo di farina
  flours.forEach(
    ({ flourPercentage, proteinContent, fiberContent, flourKind }) => {
      const flourAmount = estimatedTotalFlour * (flourPercentage / 100)
      totalFlourAmount += flourAmount
      totalFiber += flourAmount * (fiberContent / 100)

      switch (flourKind) {
        case "grano tenero":
          totalSoftWheat += flourAmount
          totalProtein += flourAmount * (proteinContent / 100)
          break
        case "grano duro":
          totalDurumWheat += flourAmount
          totalProtein += flourAmount * (proteinContent / 100)
          break
        case "farina di mais":
          totalCornmeal += flourAmount
          break
        case "farina di riso":
          totalRiceFlour += flourAmount
          break
      }
    }
  )

  const totalSalt = totalFlourAmount * 0.02 // 2% di sale
  const totalYeast = totalFlourAmount * 0.002 // 0.2% di lievito per lievitazione lunga

  // Calcolo dell'idratazione per la pizza (leggermente più bassa del pane)
  const baseHydration = 0.6 // 60% come base per la pizza
  const proteinAdjustment = Math.max(
    0,
    (totalProtein / totalFlourAmount - 0.1) * 0.015
  )
  const fiberAdjustment = (totalFiber / totalFlourAmount) * 0.002
  const totalWater =
    totalFlourAmount * (baseHydration + proteinAdjustment + fiberAdjustment)

  const getProofingTime = (temp, isCold) => {
    if (isCold) return temp < 20 ? "24-36 h" : temp < 25 ? "18-24 h" : "12-18 h"
    return temp < 20 ? "8-10 h" : temp < 25 ? "6-8 h" : "5-6 h"
  }
  const bulkFermentation = getProofingTime(temperature, false)
  const finalProofing = getProofingTime(temperature, coldProofing)
  const riseTime = `${bulkFermentation} (bulk fermentation), ${finalProofing} (after shaping${
    coldProofing ? ", in refrigerator" : ""
  })`

  const proteinRatio = (totalProtein / totalFlourAmount) * 100
  const wRating =
    proteinRatio < 11
      ? "180 - 220"
      : proteinRatio < 12
      ? "220 - 240"
      : proteinRatio < 13
      ? "240 - 280"
      : proteinRatio < 14
      ? "280 - 320"
      : "320+"

  const fiberRatio = (totalFiber / totalFlourAmount) * 100
  const glycemicIndex =
    fiberRatio > 10 ? "Low" : fiberRatio > 5 ? "Medium" : "High"
  const isWholeMeal = fiberRatio > 7

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
    isWholeMeal: isWholeMeal ? "Yes" : "No",
  })

  setModalVisible(true)
}
