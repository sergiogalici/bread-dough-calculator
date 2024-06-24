import { calculateWaterRatio } from "./calculateWater"

const floursMap = {
  "grano tenero": "Soft Wheat",
  "grano duro": "Durum Wheat",
  "farina di mais": "Cornmeal",
  "farina di riso": "Rice Flour",
  "farina di farro": "Spelt Flour",
}
export const calculatePizza = (values, setResults, setModalVisible) => {
  const { numberOfPizzas, weightPerPizza, flours, temperature, coldProofing } =
    values

  const totalDoughWeight = numberOfPizzas * weightPerPizza

  let totalFlourAmount = 0
  let totalProtein = 0
  let totalFiber = 0
  let totalSoftWheat = 0
  let totalDurumWheat = 0
  let totalCornmeal = 0
  let totalRiceFlour = 0
  let totalSpeltFlour = 0

  const estimatedTotalFlour = totalDoughWeight * 0.62

  const flourComposition = []

  flours.forEach((flour) => {
    const {
      flourPercentage = 0,
      proteinContent = 0,
      fiberContent = 0,
      flourKind,
    } = flour
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
      case "farina di farro":
        totalSpeltFlour += flourAmount
        totalProtein += flourAmount * (proteinContent / 100)
        break
    }
    flourComposition.push({
      name: floursMap[flourKind],
      amount: flourAmount.toFixed(0),
    })
  })

  const totalSalt = totalFlourAmount * 0.02
  const totalYeast = totalFlourAmount * 0.003
  const proteinRatio = (totalProtein / totalFlourAmount) * 100

  const { waterRangeMin, waterRangeMax } = calculateWaterRatio(
    totalDurumWheat,
    totalSoftWheat,
    0, // totalRye
    totalSpeltFlour,
    totalCornmeal,
    totalRiceFlour,
    totalFiber,
    totalFlourAmount,
    proteinRatio
  )

  const totalWater =
    ((Math.min(totalFlourAmount, waterRangeMin) +
      Math.min(totalFlourAmount, waterRangeMax)) /
      2) *
    0.9

  const getProofingTime = (temp, isCold) => {
    if (temp < 20) return isCold ? "24-36 h" : "8-10 h"
    if (temp < 25) return isCold ? "18-24 h" : "6-8 h"
    return isCold ? "12-18 h" : "5-6 h"
  }
  const bulkFermentation = getProofingTime(temperature, false)
  const proofing = getProofingTime(temperature, coldProofing)
  const riseTime = `${bulkFermentation} (bulk fermentation), ${proofing} (after shaping${
    coldProofing ? ", in refrigerator" : ""
  })`

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

  setResults({
    numberOfPizzas,
    weightPerPizza,
    totalDoughWeight: totalDoughWeight.toFixed(0),
    totalFlourAmount: totalFlourAmount.toFixed(0),
    flourComposition,
    totalWater: totalWater.toFixed(0),
    totalSalt: totalSalt.toFixed(0),
    totalYeast: totalYeast.toFixed(1),
    riseTime,
    proteinRatio: proteinRatio.toFixed(1),
    fiberRatio: fiberRatio.toFixed(1),
    glycemicIndex,
    wRating,
    isWholeMeal: fiberRatio > 7 ? "Yes" : "No",
    hydrationPercentage: ((totalWater / totalFlourAmount) * 100).toFixed(0),
  })

  setModalVisible(true)
}
