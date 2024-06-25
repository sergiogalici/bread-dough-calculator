interface WaterRatio {
  waterRangeMin: number
  waterRangeMax: number
}

export const calculateWaterRatio = (
  totalDurumWheat: number,
  totalSoftWheat: number,
  totalRye: number,
  totalSpelt: number,
  totalCorn: number,
  totalRice: number,
  totalFiber: number,
  totalFlourAmount: number,
  proteinRatio: number
): WaterRatio => {
  const durumWheatWaterRatio = 1.025
  const softWheatWaterRatio = 1
  const ryeWaterRatio = 1.2
  const speltWaterRatio = 0.85
  const cornWaterRatio = 1.8
  const riceWaterRatio = 0.8

  let waterRatio =
    (totalDurumWheat * durumWheatWaterRatio +
      totalSoftWheat * softWheatWaterRatio +
      totalRye * ryeWaterRatio +
      totalSpelt * speltWaterRatio +
      totalCorn * cornWaterRatio +
      totalRice * riceWaterRatio) /
    totalFlourAmount

  waterRatio += totalFiber * 0.003

  let baseHydrationMin = 0.6
  let baseHydrationMax = 0.68

  if (proteinRatio > 10) {
    baseHydrationMin += (proteinRatio - 10) * 0.02
    baseHydrationMax += (proteinRatio - 10) * 0.025
  }

  baseHydrationMin = Math.min(baseHydrationMin, 0.8)
  baseHydrationMax = Math.min(baseHydrationMax, 1)

  const waterRangeMin = totalFlourAmount * baseHydrationMin * waterRatio
  const waterRangeMax = totalFlourAmount * baseHydrationMax * waterRatio

  return { waterRangeMin, waterRangeMax }
}
