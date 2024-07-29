import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string | null
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const departmentSchema = z.object({
  id: z.string(),
  clientId: z.number().int(),
  name: z.string(),
  enabled: z.boolean(),
  code: z.string(),
  shortName: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  address: z.string().nullish(),
  level: z.number().int(),
  supId: z.string().nullish(),
  others: jsonSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  lastModifiedBy: z.string().nullish(),
  clientEnumId: z.string().nullish(),
})
