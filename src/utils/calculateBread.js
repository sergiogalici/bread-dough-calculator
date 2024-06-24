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

    console.log("type = ", flourKind)
    console.log("protein = ", proteinContent)

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
    totalSalt += flourAmount * 0.02 // Assumo 2% di sale in base alla quantità di farina

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
    } else {
      console.error("Tipo di farina non riconosciuto")
    }
  })

  console.log("Total protein:", totalProtein)
  console.log("Total fiber:", totalFiber)
  console.log("Total durum wheat:", totalDurumWheat)
  console.log("Total soft wheat:", totalSoftWheat)

  const totalFlourAmount =
    totalDurumWheat + totalSoftWheat + totalRye + totalSpelt + totalCorn

  // Calcolo della quantità di lievito in base alla temperatura
  if (temperature < 10) {
    totalYeast = totalFlourAmount * 0.2
  } else if (temperature >= 10 && temperature < 20) {
    totalYeast = totalFlourAmount * (0.2 - (temperature - 10) * 0.01)
  } else if (temperature >= 20 && temperature < 30) {
    totalYeast = totalFlourAmount * (0.1 + (30 - temperature) * 0.01)
  } else {
    totalYeast = totalFlourAmount * 0.1
  }

  // Assicurati che la quantità di lievito sia tra il 10% e il 20% della quantità di farina
  totalYeast = Math.max(
    totalFlourAmount * 0.1,
    Math.min(totalYeast, totalFlourAmount * 0.2)
  )

  // Calcolo del tempo di lievitazione in base alla temperatura
  let firstProofingTime
  let secondProofingTime

  if (temperature < 10) {
    firstProofingTime = "12-18 hours"
    secondProofingTime = coldProofing ? "24-36 hours" : "6-12 hours"
  } else if (temperature < 15) {
    firstProofingTime = "8-12 hours"
    secondProofingTime = coldProofing ? "18-24 hours" : "4-8 hours"
  } else if (temperature < 20) {
    firstProofingTime = "6-8 hours"
    secondProofingTime = coldProofing ? "12-18 hours" : "3-6 hours"
  } else if (temperature < 25) {
    firstProofingTime = "4-6 hours"
    secondProofingTime = coldProofing ? "8-12 hours" : "2-4 hours"
  } else if (temperature < 30) {
    firstProofingTime = "2-4 hours"
    secondProofingTime = coldProofing ? "6-8 hours" : "1-2 hours"
  } else {
    firstProofingTime = "2-4 hours"
    secondProofingTime = coldProofing ? "4-6 hours" : "1-2 hours"
  }

  const riseTime = `${firstProofingTime} (first proofing), ${secondProofingTime} (second proofing${
    coldProofing ? " in refrigerator" : ""
  })`

  // Calcolo dei macronutrienti e indice glicemico
  const fiberRatio = (totalFiber / totalFlourAmount) * 100

  let glycemicIndex
  if (fiberRatio > 10) {
    glycemicIndex = "Low"
  } else if (fiberRatio > 5) {
    glycemicIndex = "Average"
  } else {
    glycemicIndex = "High"
  }

  const proteinRatio = (totalProtein / totalFlourAmount) * 100

  let wRating = ""
  let waterRangeMin, waterRangeMax
  let waterRatio = 1 + fiberRatio / 100

  // Definisci i fattori di assorbimento acqua per ogni tipo di farina
  const durumWheatWaterRatio = 1.05
  const softWheatWaterRatio = 1
  const ryeWaterRatio = 1.2
  const speltWaterRatio = 0.85
  const cornWaterRatio = 1.8
  const riceWaterRatio = 0.8

  // Calcola il water ratio totale come media ponderata
  waterRatio =
    (totalDurumWheat * durumWheatWaterRatio +
      totalSoftWheat * softWheatWaterRatio +
      totalRye * ryeWaterRatio +
      totalSpelt * speltWaterRatio +
      totalCorn * cornWaterRatio +
      totalRice * riceWaterRatio) /
    totalFlourAmount

  waterRatio += totalFiber * 0.003

  console.log("Water ratio:", waterRatio)
  console.log("Protein ratio:", proteinRatio)
  let baseHydrationMin = 0.6
  let baseHydrationMax = 0.75

  // Aumenta l'idratazione del 2% per ogni punto percentuale di proteine sopra il 10%
  if (proteinRatio > 10) {
    baseHydrationMin += (proteinRatio - 10) * 0.02
    baseHydrationMax += (proteinRatio - 10) * 0.025
  }

  // Applica un cap massimo all'idratazione
  baseHydrationMin = Math.min(baseHydrationMin, 0.8)
  baseHydrationMax = Math.min(baseHydrationMax, 1)

  waterRangeMin = totalFlourAmount * baseHydrationMin * waterRatio
  waterRangeMax = totalFlourAmount * baseHydrationMax * waterRatio

  // Calcolo del W rating
  if (proteinRatio < 10) {
    wRating = "90 - 220"
  } else if (proteinRatio < 11) {
    wRating = "160 - 240"
  } else if (proteinRatio < 12) {
    wRating = "220 - 260"
  } else if (proteinRatio < 13) {
    wRating = "240 - 290"
  } else if (proteinRatio < 14) {
    wRating = "270 - 340"
  } else if (proteinRatio < 15) {
    wRating = "320 - 430"
  } else if (proteinRatio < 16) {
    wRating = "360 - 400+"
  } else {
    wRating = "400+"
  }

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
