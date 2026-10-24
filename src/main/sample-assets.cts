import type { SampleProjectDefinition } from '../shared/project.js'

export const sampleAssets = [
  {
    projectId: 'sample-monplaisir-06-juillet',
    audioFileName: 'Monplaisir - Monplaisir - 06 - Juillet.mp3',
    definition: {
      title: 'Monplaisir - Monplaisir - 06 - Juillet',
      description:
        'Bundled sample audio\n"Juillet” by Monplaisir"\nhttps://freemusicarchive.org/music/Monplaisir/Bonjour_from_Paris_Nantes_and_Montreal/Monplaisir_-_Bonjour_from_Paris_Nantes_and_Montreal_-_06_Juillet/\nLicensed under CC0 1.0',
      duration: 153.000249,
      fileHash: 'eed6551638a1d8778d7f3b490b21959665416167a58818be5f7c900ca7973628',
      segments: [
        {
          id: 'segment-1792074312069',
          label: 'Intro',
          start: 0,
          end: 13.725604,
          speed: 1,
          gainDb: 0,
        },
        {
          id: 'segment-1792074330567',
          label: 'Slow Part',
          start: 13.725604,
          end: 26.605237,
          speed: 0.5,
          gainDb: 0,
        },
        {
          id: 'segment-1792074367723',
          label: 'Main Phrase',
          start: 26.605237,
          end: 86.421041,
          speed: 1,
          gainDb: 0,
        },
        {
          id: 'segment-1792074432526',
          label: 'Tricky Part',
          start: 86.421041,
          end: 116.474328,
          speed: 0.8,
          gainDb: 0,
        },
        {
          id: 'segment-1792074481262',
          label: 'Hard Part',
          start: 116.474328,
          end: 122.883766,
          speed: 0.25,
          gainDb: 0,
        },
        {
          id: 'segment-1792074489730',
          label: 'Final Run',
          start: 122.883766,
          end: 153.000249,
          speed: 1,
          gainDb: 0,
        },
      ],
      loopRange: [0, 153.000249],
      loopMode: 'none',
      masterGainDb: 0,
      defaultDelayBeforeMs: 1500,
      defaultPrerollMs: 1000,
      defaultPostrollMs: 1000,
    },
  },
] satisfies readonly {
  projectId: string
  audioFileName: string
  definition: SampleProjectDefinition
}[]
