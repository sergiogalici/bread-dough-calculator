export const calculateNaan = (values, setResults, setModalVisible) => {
  const {
    naanCount,
    hydrationPercentage,
    fatPercentage,
    yogurtType,
    liquidType,
    naanWeight,
    temperature,
  } = values

  const flourAmount =
    (naanCount * naanWeight) / (1 + (hydrationPercentage + fatPercentage) / 100)

  let totalLiquid = (flourAmount * hydrationPercentage) / 100
  let totalFat = (flourAmount * fatPercentage) / 100

  let yogurtAmount = 0
  let waterFromYogurt = 0
  let fatFromYogurt = 0
  if (yogurtType !== "none") {
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
    totalFat += fatFromYogurt
  }

  let fatFromMilk = 0
  let waterFromMilk = totalLiquid
  switch (liquidType) {
    case "whole-milk":
      fatFromMilk = totalLiquid * 0.035
      break
    case "skim-milk":
      waterFromMilk = 0
      break
    case "almond-milk":
    case "soy-milk":
      fatFromMilk = totalLiquid * 0.025
      break
    case "water":
      waterFromMilk = 0
      break
  }
  totalFat += fatFromMilk

  const totalSalt = flourAmount * 0.02
  let totalYeast

  if (temperature < 20) {
    totalYeast = flourAmount * 0.015
  } else if (temperature < 25) {
    totalYeast = flourAmount * 0.025
  } else {
    totalYeast = flourAmount * 0.035
  }

  let proofingTime
  if (temperature < 20) {
    proofingTime = "2-2.5 hours"
  } else if (temperature < 25) {
    proofingTime = "1.5-2 hours"
  } else {
    proofingTime = "1-1.5 hours"
  }

  const totalDoughWeight =
    flourAmount + totalLiquid + totalFat + yogurtAmount + totalSalt + totalYeast
  const numberOfNaan = naanCount

  setResults({
    totalFlourAmount: Math.round(flourAmount),
    totalLiquid: Math.round(totalLiquid),
    totalFat: Math.round(totalFat),
    totalSalt: Math.round(totalSalt),
    totalYeast: Math.round(totalYeast),
    yogurtAmount: Math.round(yogurtAmount),
    waterFromYogurt: Math.round(waterFromYogurt),
    waterFromMilk: Math.round(waterFromMilk),
    proofingTime: proofingTime,
    numberOfNaan: numberOfNaan,
    naanWeight: naanWeight,
    liquidType: liquidType,
    yogurtType: yogurtType,
    totalHydration: hydrationPercentage,
    glycemicIndex: "Medium",
  })

  setModalVisible(true)
}
