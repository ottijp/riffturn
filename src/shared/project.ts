import { z } from 'zod'

const finiteNumberSchema = z.number().finite()

export const loopModeSchema = z.enum(['none', 'segment', 'time'])

export const storedSegmentSchema = z.strictObject({
  id: z.string(),
  label: z.string(),
  start: finiteNumberSchema,
  end: finiteNumberSchema,
  speed: finiteNumberSchema,
  gainDb: finiteNumberSchema,
})

export const projectSettingsSchema = z.strictObject({
  title: z.string(),
  duration: finiteNumberSchema,
  fileHash: z.string(),
  segments: z.array(storedSegmentSchema),
  loopRange: z.tuple([finiteNumberSchema, finiteNumberSchema]),
  loopMode: loopModeSchema,
  masterGainDb: finiteNumberSchema,
  defaultDelayBeforeMs: finiteNumberSchema,
  defaultPrerollMs: finiteNumberSchema,
  defaultPostrollMs: finiteNumberSchema,
})

const projectRecordBaseSchema = projectSettingsSchema.extend({
  projectId: z.string(),
  sourcePath: z.string(),
  updatedAt: finiteNumberSchema,
})

export const sampleProjectRecordSchema = projectRecordBaseSchema.extend({
  isSample: z.literal(true),
})

export const userProjectRecordSchema = projectRecordBaseSchema.extend({
  isSample: z.literal(false),
})

export const projectRecordSchema = z.discriminatedUnion('isSample', [
  sampleProjectRecordSchema,
  userProjectRecordSchema,
])

export const waveformRecordSchema = z.strictObject({
  fileHash: z.string(),
  peaks: z.array(finiteNumberSchema),
})

export type StoredSegment = z.infer<typeof storedSegmentSchema>
export type LoopMode = z.infer<typeof loopModeSchema>
export type ProjectRecordBase = z.infer<typeof projectRecordBaseSchema>
export type SampleProjectRecord = z.infer<typeof sampleProjectRecordSchema>
export type UserProjectRecord = z.infer<typeof userProjectRecordSchema>
export type ProjectRecord = z.infer<typeof projectRecordSchema>
export type SampleProjectDefinition = z.infer<typeof projectSettingsSchema>
export type WaveformRecord = z.infer<typeof waveformRecordSchema>
