export const calculateWaterRatio = (
  totalDurumWheat,
  totalSoftWheat,
  totalRye,
  totalSpelt,
  totalCorn,
  totalRice,
  totalFiber,
  totalFlourAmount,
  proteinRatio
) => {
  const durumWheatWaterRatio = 1.05
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

  let baseHydrationMin = 0.65
  let baseHydrationMax = 0.73

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
