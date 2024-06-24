import { calculateWaterRatio } from "./calculateWater"

export const calculateDough = (values, setResults, setModalVisible) => {
  const { flours, temperature, coldProofing } = values
  let totalSalt = 0
  let totalYeast = 0
  let totalFiber = 0
  let totalProtein = 0
  let totalDurumWheat = 0
  let totalSoftWheat = 0
  let totalRye = 0
  let totalSpelt = 0
  let totalCorn = 0
  let totalRice = 0

  flours.forEach((flour) => {
    const { flourAmount, proteinContent, fiberContent, flourKind } = flour

    if (flourKind === "farina di mais" || flourKind === "farina di riso") {
      totalProtein += 0
    } else if (flourKind === "farina di farro") {
      totalProtein += flourAmount * ((proteinContent * 0.15) / 100)
    } else if (flourKind === "farina di segale") {
      totalProtein += flourAmount * ((proteinContent * 0.05) / 100)
    } else if (flourKind === "grano duro") {
      totalProtein += flourAmount * ((proteinContent * 0.85) / 100)
    } else {
      totalProtein += flourAmount * ((proteinContent * 0.95) / 100)
    }

    totalFiber += flourAmount * (fiberContent / 100)
    totalSalt += flourAmount * 0.02

    if (flourKind === "grano duro") {
      totalDurumWheat += flourAmount
    } else if (flourKind === "grano tenero") {
      totalSoftWheat += flourAmount
    } else if (flourKind === "farina di segale") {
      totalRye += flourAmount
    } else if (flourKind === "farina di farro") {
      totalSpelt += flourAmount
    } else if (flourKind === "farina di mais") {
      totalCorn += flourAmount
    } else if (flourKind === "farina di riso") {
      totalRice += flourAmount
    }
  })

  const totalFlourAmount =
    totalDurumWheat + totalSoftWheat + totalRye + totalSpelt + totalCorn

  if (temperature < 10) {
    totalYeast = totalFlourAmount * 0.2
  } else if (temperature >= 10 && temperature < 20) {
    totalYeast = totalFlourAmount * (0.2 - (temperature - 10) * 0.01)
  } else if (temperature >= 20 && temperature < 30) {
    totalYeast = totalFlourAmount * (0.1 + (30 - temperature) * 0.01)
  } else {
    totalYeast = totalFlourAmount * 0.1
  }

  totalYeast = Math.max(
    totalFlourAmount * 0.1,
    Math.min(totalYeast, totalFlourAmount * 0.2)
  )

  let firstProofingTime
  let secondProofingTime

  if (temperature < 10) {
    firstProofingTime = "12-18 h"
    secondProofingTime = coldProofing ? "24-36 h" : "6-12 h"
  } else if (temperature < 15) {
    firstProofingTime = "8-12 h"
    secondProofingTime = coldProofing ? "18-24 h" : "4-8 h"
  } else if (temperature < 20) {
    firstProofingTime = "6-8 h"
    secondProofingTime = coldProofing ? "12-18 h" : "3-6 h"
  } else if (temperature < 25) {
    firstProofingTime = "4-6 h"
    secondProofingTime = coldProofing ? "8-12 h" : "2-4 h"
  } else if (temperature < 30) {
    firstProofingTime = "2-4 h"
    secondProofingTime = coldProofing ? "6-8 h" : "1-2 h"
  } else {
    firstProofingTime = "2-4 h"
    secondProofingTime = coldProofing ? "4-6 h" : "1-2 h"
  }

  const riseTime = `${firstProofingTime} (first proofing), ${secondProofingTime} (second proofing${
    coldProofing ? " in refrigerator" : ""
  })`

  const fiberRatio = (totalFiber / totalFlourAmount) * 100

  const glycemicIndex =
    fiberRatio > 10 ? "Low" : fiberRatio > 5 ? "Average" : "High"

  const proteinRatio = (totalProtein / totalFlourAmount) * 100

  const { waterRangeMin, waterRangeMax } = calculateWaterRatio(
    totalDurumWheat,
    totalSoftWheat,
    totalRye,
    totalSpelt,
    totalCorn,
    totalRice,
    totalFiber,
    totalFlourAmount,
    proteinRatio
  )

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

  setResults({
    totalFlourAmount: totalFlourAmount.toFixed(0),
    totalWater: `${Math.min(totalFlourAmount, waterRangeMin).toFixed(
      0
    )} - ${Math.min(totalFlourAmount, waterRangeMax).toFixed(0)}`,
    totalSalt: totalSalt.toFixed(0),
    totalYeast: totalYeast.toFixed(0),
    riseTime,
    proteinRatio: proteinRatio.toFixed(1),
    fiberRatio: fiberRatio.toFixed(1),
    glycemicIndex,
    wRating,
  })

  setModalVisible(true)
}
