export const calculateBrioche = (values, setResults, setModalVisible) => {
  const {
    briocheWeight,
    briocheCount,
    hydrationPercentage,
    fatPercentage,
    fatType,
    includeEggs,
    milkType,
    temperature,
  } = values

  // Calcolo della quantità di farina
  const totalDoughWeight = briocheWeight * briocheCount
  const flourAmount =
    totalDoughWeight / (1 + (hydrationPercentage + fatPercentage) / 100)

  // Calcolo del grasso
  const totalFat = (flourAmount * fatPercentage) / 100

  // Calcolo delle uova (assumiamo 1 uovo ogni 200g di farina)
  const eggsCount = includeEggs ? Math.round(flourAmount / 200) : 0
  const totalEggs = eggsCount * 50 // Assumiamo 50g per uovo

  // Calcolo dell'acqua nelle uova e nel grasso
  const waterInEggs = totalEggs * 0.75
  const waterInFat =
    fatType === "butter" || fatType === "margarine" ? totalFat * 0.2 : 0

  // Calcolo dell'idratazione totale desiderata
  const totalDesiredWater = (flourAmount * hydrationPercentage) / 100

  // Calcolo del latte necessario
  const totalMilk = Math.max(0, totalDesiredWater - waterInEggs - waterInFat)

  const totalSalt = flourAmount * 0.02 // 2% del peso della farina
  const totalSugar = flourAmount * 0.1 // 10% del peso della farina

  // Calcolo del lievito
  let yeastPercentage
  if (temperature < 20) {
    yeastPercentage = 0.015
  } else if (temperature < 25) {
    yeastPercentage = 0.025
  } else {
    yeastPercentage = 0.035
  }
  const totalYeast = flourAmount * yeastPercentage

  // Tempo di lievitazione
  let proofingTime
  if (temperature < 20) {
    proofingTime = "3-4 hours"
  } else if (temperature < 25) {
    proofingTime = "2.5-3 hours"
  } else {
    proofingTime = "2-2.5 hours"
  }

  setResults({
    totalFlourAmount: Math.round(flourAmount),
    totalMilk: Math.round(totalMilk),
    totalSalt: Math.round(totalSalt),
    totalFat: Math.round(totalFat),
    totalEggs: totalEggs,
    eggsCount: eggsCount,
    totalYeast: Math.round(totalYeast),
    totalSugar: Math.round(totalSugar),
    fatType: fatType,
    milkType: milkType,
    proofingTime: proofingTime,
    numberOfBrioche: briocheCount,
    briocheWeight: briocheWeight,
    totalHydration: hydrationPercentage,
    waterFromEggs: Math.round(waterInEggs),
    waterFromFat: Math.round(waterInFat),
    glycemicIndex: "High",
  })

  setModalVisible(true)
}
