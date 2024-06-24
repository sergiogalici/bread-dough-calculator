const milkProperties = {
  whole: { waterContent: 0.87, fatContent: 0.035 },
  skim: { waterContent: 0.91, fatContent: 0.002 },
  almond: { waterContent: 0.97, fatContent: 0.013 },
  soy: { waterContent: 0.94, fatContent: 0.02 },
  oat: { waterContent: 0.9, fatContent: 0.015 },
}

const reverseMilkTypeMap = {
  whole: "Whole Milk",
  skim: "Skim Milk",
  almond: "Almond Milk",
  soy: "Soy Milk",
  oat: "Oat Milk",
}

const reverseFatTypeMap = {
  butter: "Butter",
  oil: "Oil",
  margarine: "Margarine",
  lard: "Lard",
}

export const calculateBrioche = (values, setResults, setModalVisible) => {
  console.log("Values in func = ", values)
  const {
    briocheWeight,
    bunCount: briocheCount,
    hydrationPercentage,
    fatPercentage,
    fatType,
    includeEggs,
    milkType,
    temperature,
  } = values

  const totalDoughWeight = briocheWeight * briocheCount
  const flourAmount =
    totalDoughWeight / (1 + (hydrationPercentage + fatPercentage) / 100)

  const totalFat = (flourAmount * fatPercentage) / 100

  const eggsCount = includeEggs ? Math.round(flourAmount / 200) : 0
  const totalEggs = eggsCount * 60

  const waterInEggs = totalEggs * 0.75
  const fatInEggs = totalEggs * 0.1

  const waterInFat =
    fatType === "butter" || fatType === "margarine" ? totalFat * 0.2 : 0

  const totalDesiredWater = (flourAmount * hydrationPercentage) / 100

  const milkProps = milkProperties[milkType] || {
    waterContent: 0,
    fatContent: 0,
  }
  const totalMilk = Math.max(0, totalDesiredWater - waterInEggs - waterInFat)
  const waterInMilk = totalMilk * milkProps.waterContent
  const fatInMilk = totalMilk * milkProps.fatContent

  const totalSalt = flourAmount * 0.02
  const totalSugar = flourAmount * 0.1

  let yeastPercentage
  if (temperature < 20) {
    yeastPercentage = 0.015
  } else if (temperature < 25) {
    yeastPercentage = 0.025
  } else {
    yeastPercentage = 0.035
  }
  const totalYeast = flourAmount * yeastPercentage

  let proofingTime
  if (temperature < 20) {
    proofingTime = "3-4 h"
  } else if (temperature < 25) {
    proofingTime = "2.5-3 h"
  } else {
    proofingTime = "2-2.5 h"
  }

  const totalFatIncludingEggsAndMilk = totalFat - fatInEggs - fatInMilk

  setResults({
    totalFlourAmount: Math.round(flourAmount),
    totalMilk: Math.round(totalMilk),
    totalSalt: Math.round(totalSalt),
    totalFat: Math.round(totalFatIncludingEggsAndMilk),
    totalEggs: totalEggs,
    eggsCount: eggsCount,
    totalYeast: Math.round(totalYeast),
    totalSugar: Math.round(totalSugar),
    fatType: reverseFatTypeMap[fatType],
    milkType: reverseMilkTypeMap[milkType],
    proofingTime: proofingTime,
    numberOfBrioche: briocheCount,
    briocheWeight: briocheWeight,
    totalHydration: hydrationPercentage,
    waterFromEggs: Math.round(waterInEggs),
    waterFromFat: Math.round(waterInFat),
    waterFromMilk: Math.round(waterInMilk),
    glycemicIndex: "High",
  })

  setModalVisible(true)
}
