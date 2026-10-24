import { z } from 'zod'

const finiteNumberSchema = z.number().finite()

export const loopModeSchema = z.enum(['none', 'segment', 'time'])

export const noLoopSettingsSchema = z.strictObject({
  mode: z.literal('none'),
})

export const timeLoopSettingsSchema = z.strictObject({
  mode: z.literal('time'),
  startSeconds: finiteNumberSchema,
  endSeconds: finiteNumberSchema,
})

export const segmentLoopSettingsSchema = z.strictObject({
  mode: z.literal('segment'),
  startSegmentId: z.string(),
  endSegmentId: z.string(),
})

export const loopSettingsSchema = z.discriminatedUnion('mode', [
  noLoopSettingsSchema,
  timeLoopSettingsSchema,
  segmentLoopSettingsSchema,
])

export const loopPresetReferenceSchema = z.strictObject({
  projectId: z.string(),
  name: z.string().trim().min(1).max(100),
})

export const savedLoopPresetSchema = loopPresetReferenceSchema.extend({
  loopSettings: loopSettingsSchema,
})

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
  description: z.string().default(''),
  duration: finiteNumberSchema,
  fileHash: z.string(),
  segments: z.array(storedSegmentSchema),
  loopSettings: loopSettingsSchema,
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

export const projectSummarySchema = z.strictObject({
  projectId: z.string(),
  title: z.string(),
  duration: finiteNumberSchema,
  isSample: z.boolean(),
  updatedAt: finiteNumberSchema,
})

export const waveformRecordSchema = z.strictObject({
  fileHash: z.string(),
  peaks: z.array(finiteNumberSchema),
})

export type StoredSegment = z.infer<typeof storedSegmentSchema>
export type LoopMode = z.infer<typeof loopModeSchema>
export type LoopSettings = z.infer<typeof loopSettingsSchema>
export type SavedLoopPreset = z.infer<typeof savedLoopPresetSchema>
export type ProjectRecordBase = z.infer<typeof projectRecordBaseSchema>
export type SampleProjectRecord = z.infer<typeof sampleProjectRecordSchema>
export type UserProjectRecord = z.infer<typeof userProjectRecordSchema>
export type ProjectRecord = z.infer<typeof projectRecordSchema>
export type ProjectSummary = z.infer<typeof projectSummarySchema>
export type SampleProjectDefinition = z.infer<typeof projectSettingsSchema>
export type WaveformRecord = z.infer<typeof waveformRecordSchema>
