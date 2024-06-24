const reversedLiquidTypes = {
  "whole-milk": "Whole Milk",
  "skim-milk": "Skim Milk",
  "almond-milk": "Almond Milk",
  "soy-milk": "Soy Milk",
  water: "Water",
}

const reversedYogurtTypes = {
  "no-yogurt": "No Yogurt",
  "full-fat": "Full Fat Yogurt",
  "low-fat": "Low Fat Yogurt",
  "non-fat": "Non Fat Yogurt",
}

export const calculateNaan = (values, setResults, setModalVisible) => {
  const {
    naanCount,
    hydrationPercentage,
    fatPercentage,
    yogurtType,
    liquidType,
    naanWeight,
    temperature,
    proteinContent = 10,
    fiberContent = 2,
    expertMode,
  } = values

  const flourAmount =
    (naanCount * naanWeight) / (1 + (hydrationPercentage + fatPercentage) / 100)

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

  let totalLiquid = (flourAmount * adjustedHydration) / 100
  let oilToAdd = (flourAmount * (expertMode ? fatPercentage : 10)) / 100

  // Calcolo dello yogurt
  let yogurtAmount = 0
  let waterFromYogurt = 0
  let fatFromYogurt = 0
  if (yogurtType !== "no-yogurt") {
    yogurtAmount = flourAmount * 0.4
    switch (yogurtType) {
      case "full-fat":
        waterFromYogurt = yogurtAmount * 0.85
        fatFromYogurt = yogurtAmount * 0.035
        break
      case "low-fat":
        waterFromYogurt = yogurtAmount * 0.89
        fatFromYogurt = yogurtAmount * 0.015
        break
      case "non-fat":
        waterFromYogurt = yogurtAmount * 0.91
        fatFromYogurt = 0
        break
    }
    totalLiquid -= waterFromYogurt
    oilToAdd -= fatFromYogurt
  }

  // Calcolo del liquido aggiuntivo
  let fatFromMilk = 0
  let waterFromMilk = totalLiquid
  switch (liquidType) {
    case "whole-milk":
      fatFromMilk = totalLiquid * 0.035
      break
    case "skim-milk":
      fatFromMilk = totalLiquid * 0.001
      break
    case "almond-milk":
    case "soy-milk":
      fatFromMilk = totalLiquid * 0.025
      break
    case "water":
      fatFromMilk = 0
      break
  }
  oilToAdd -= fatFromMilk

  const totalSalt = flourAmount * 0.02

  // Calcolo del lievito in base alla temperatura
  let totalYeast
  if (temperature < 20) {
    totalYeast = flourAmount * 0.015
  } else if (temperature < 25) {
    totalYeast = flourAmount * 0.025
  } else {
    totalYeast = flourAmount * 0.035
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
    flourAmount +
    totalLiquid +
    oilToAdd +
    (yogurtType !== "no-yogurt" ? yogurtAmount : 0) +
    totalSalt +
    totalYeast

  setResults({
    totalFlourAmount: Math.round(flourAmount),
    totalLiquid: Math.round(totalLiquid),
    oilToAdd: Math.round(oilToAdd),
    totalSalt: Math.round(totalSalt),
    totalYeast: Math.round(totalYeast),
    yogurtAmount: yogurtType !== "no-yogurt" ? Math.round(yogurtAmount) : 0,
    waterFromYogurt:
      yogurtType !== "no-yogurt" ? Math.round(waterFromYogurt) : 0,
    waterFromMilk: Math.round(waterFromMilk),
    proofingTime: proofingTime,
    numberOfNaan: naanCount,
    naanWeight: naanWeight,
    liquidType: reversedLiquidTypes[liquidType],
    yogurtType: reversedYogurtTypes[yogurtType],
    totalHydration: hydrationPercentage,
    glycemicIndex: "Medium",
    totalDoughWeight: Math.round(totalDoughWeight),
    adjustedHydration: Math.round(adjustedHydration),
    proteinContent,
    fiberContent,
  })

  setModalVisible(true)
}
