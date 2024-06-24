export const calculatePizza = (values, setResults, setModalVisible) => {
  const { flours, temperature, coldProofing } = values
  let totalSalt = 0
  let totalYeast = 0
  let totalFiber = 0
  let totalProtein = 0
  let totalFlourAmount = 0
  let totalSoftWheat = 0
  let totalDurumWheat = 0
  let totalCornmeal = 0
  let totalRiceFlour = 0
  let totalGlutenFlour = 0

  flours.forEach((flour) => {
    const { flourAmount, proteinContent, fiberContent, flourKind } = flour
    totalFlourAmount += flourAmount
    totalFiber += flourAmount * (fiberContent / 100)
    totalSalt += flourAmount * 0.02 // 2% di sale in base alla quantità di farina

    switch (flourKind) {
      case "grano tenero":
        totalSoftWheat += flourAmount
        totalProtein += flourAmount * (proteinContent / 100)
        totalGlutenFlour += flourAmount
        break
      case "grano duro":
        totalDurumWheat += flourAmount
        totalProtein += flourAmount * (proteinContent / 100)
        totalGlutenFlour += flourAmount
        break
      case "farina di mais":
        totalCornmeal += flourAmount
        break
      case "farina di riso":
        totalRiceFlour += flourAmount
        break
      default:
        console.error("Unknown flour type")
    }
  })

  // Calcolo del lievito di birra per una lievitazione lunga (5-6 ore minimo)
  const yeastPercentage = 0.2 // 0.2% di lievito di birra secco
  totalYeast = totalFlourAmount * (yeastPercentage / 100)

  // Calcolo del tempo di lievitazione in base alla temperatura
  let firstProofingTime
  let secondProofingTime

  if (temperature < 20) {
    firstProofingTime = "8-10 hours"
    secondProofingTime = coldProofing ? "24-36 hours" : "1-2 hours"
  } else if (temperature < 25) {
    firstProofingTime = "6-8 hours"
    secondProofingTime = coldProofing ? "18-24 hours" : "45 minutes - 1 hour"
  } else {
    firstProofingTime = "5-6 hours"
    secondProofingTime = coldProofing ? "12-18 hours" : "30-45 minutes"
  }

  const riseTime = `${firstProofingTime} (bulk fermentation), ${secondProofingTime} (after shaping${
    coldProofing ? ", in refrigerator" : ""
  })`

  // Calcolo dell'idratazione e del W
  const proteinRatio = (totalProtein / totalGlutenFlour) * 100
  const fiberRatio = (totalFiber / totalFlourAmount) * 100

  // Calcolo dell'idratazione base in funzione dei tipi di farina e del contenuto proteico
  let baseHydration = 0.65 // 65% di idratazione di base per la pizza
  baseHydration += (proteinRatio - 10) * 0.02 // Aumenta l'idratazione del 2% per ogni punto percentuale di proteine sopra il 10%
  if (totalDurumWheat > 0) baseHydration += 0.05 // Grano duro assorbe più acqua
  if (totalCornmeal > 0) baseHydration += 0.09 // Farina di mais assorbe più acqua
  if (totalRiceFlour > 0) baseHydration -= 0.05 // Farina di riso assorbe meno acqua

  let waterRatio = baseHydration + fiberRatio * 0.003 // Aggiustamento finale per il contenuto di fibre

  // Determiniamo se la farina è integrale basandoci sul contenuto di fibre
  const isWholeMeal = fiberRatio > 7

  // Calcolo del W rating
  let wRating = ""
  if (proteinRatio < 11) {
    wRating = "180 - 220"
  } else if (proteinRatio < 12) {
    wRating = "220 - 240"
  } else if (proteinRatio < 13) {
    wRating = "240 - 280"
  } else if (proteinRatio < 14) {
    wRating = "280 - 320"
  } else {
    wRating = "320+"
  }

  // Calcolo dell'indice glicemico
  let glycemicIndex
  if (fiberRatio > 10) {
    glycemicIndex = "Low"
  } else if (fiberRatio > 5) {
    glycemicIndex = "Medium"
  } else {
    glycemicIndex = "High"
  }

  setResults({
    totalFlourAmount: totalFlourAmount.toFixed(0),
    flourComposition: `Soft Wheat: ${totalSoftWheat}g, Durum Wheat: ${totalDurumWheat}g, Cornmeal: ${totalCornmeal}g, Rice Flour: ${totalRiceFlour}g`,
    totalWater: (totalFlourAmount * waterRatio).toFixed(0),
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
