export const formatDuration = (value: number) =>
  `${Math.floor(value / 60)}:${Math.floor(value % 60)
    .toString()
    .padStart(2, '0')}`

export const formatGainDb = (gainDb: number) => `${gainDb > 0 ? '+' : ''}${gainDb} dB`
