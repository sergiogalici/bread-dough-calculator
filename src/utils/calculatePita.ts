import { calculateWaterRatio } from "./calculateWater"

interface Values {
  pitaCount: number
  hydrationPercentage?: number
  pitaWeight?: number
  temperature: number
  proteinContent?: number
  fiberContent?: number
  expertMode: boolean
}

interface Results {
  totalFlourAmount: number
  totalWater: number
  totalSalt: number
  totalYeast: number
  totalOil: number
  proofingTime: string
  numberOfPitas: number
  pitaWeight: number
  totalHydration: number
  glycemicIndex: string
  totalDoughWeight: number
  adjustedHydration: number
  proteinContent: number
  fiberContent: number
}

export const calculatePita = (
  values: Values,
  setResults: (results: Results) => void,
  setModalVisible: (visible: boolean) => void
): void => {
  const {
    pitaCount,
    hydrationPercentage = 65,
    pitaWeight = 80,
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
  const totalSalt = flourAmount * 0.02
  const totalOil = flourAmount * 0.05 // Some oil for softness

  // Calculate yeast based on temperature
  let totalYeast
  if (temperature < 20) {
    totalYeast = flourAmount * 0.015
  } else if (temperature < 25) {
    totalYeast = flourAmount * 0.02
  } else {
    totalYeast = flourAmount * 0.025
  }

  // Calculate proofing time
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
