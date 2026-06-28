import type { Schema } from 'mongoose'
import { Counter } from '../models/Counter'

export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  )

  if (!counter) {
    throw new Error(`Failed to get next sequence for ${name}`)
  }

  return counter.seq
}

export function applyAutoIncrement(schema: Schema, counterName: string): void {
  schema.pre('save', async function () {
    if (this.isNew && this._id == null) {
      this._id = await getNextSequence(counterName)
    }
  })
}
