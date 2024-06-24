export const calculatePita = (values, setResults, setModalVisible) => {
  const {
    pitaCount,
    hydrationPercentage,
    pitaWeight,
    temperature,
    proteinContent = 10,
    fiberContent = 2,
    expertMode,
  } = values

  const flourAmount = (pitaCount * pitaWeight) / (1 + hydrationPercentage / 100)

  const { waterRangeMin, waterRangeMax } = calculateWaterRatio(
    0, // totalDurumWheat
    flourAmount, // totalSoftWheat
    0, // totalRye
    0, // totalSpelt
    0, // totalCorn
    0, // totalRice
    flourAmount * (fiberContent / 100), // totalFiber
    flourAmount,
    proteinContent
  )

  const adjustedHydration = expertMode
    ? hydrationPercentage
    : ((waterRangeMin + waterRangeMax) / (2 * flourAmount)) * 100

  const totalWater = (flourAmount * adjustedHydration) / 100

  // Calcolo del lievito in base alla temperatura
  let totalYeast
  if (temperature < 20) {
    totalYeast = flourAmount * 0.015
  } else if (temperature < 25) {
    totalYeast = flourAmount * 0.02
  } else {
    totalYeast = flourAmount * 0.025
  }

  // Calcolo del tempo di lievitazione
  let proofingTime
  if (temperature < 20) {
    proofingTime = "2-2.5 h"
  } else if (temperature < 25) {
    proofingTime = "1.5-2 h"
  } else {
    proofingTime = "1-1.5 h"
  }

  const totalDoughWeight =
    flourAmount + totalWater + totalSalt + totalOil + totalYeast

  setResults({
    totalFlourAmount: Math.round(flourAmount),
    totalWater: Math.round(totalWater),
    totalSalt: Math.round(totalSalt),
    totalYeast: Math.round(totalYeast),
    totalOil: Math.round(totalOil),
    proofingTime: proofingTime,
    numberOfPitas: pitaCount,
    pitaWeight: pitaWeight,
    totalHydration: hydrationPercentage,
    glycemicIndex: "Medium",
    totalDoughWeight: Math.round(totalDoughWeight),
    adjustedHydration: Math.round(adjustedHydration),
    proteinContent,
    fiberContent,
  })

  setModalVisible(true)
}
