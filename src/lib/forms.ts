import type { CollectionEntry } from "astro:content";

export type FormEntry = CollectionEntry<"forms">;
export type FormDefinition = FormEntry["data"];
export type FormField = FormDefinition["sections"][number]["fields"][number];

export function fieldsFor(definition: FormDefinition): FormField[] {
  return definition.sections.flatMap((section) => section.fields);
}

export function fieldMapFor(definition: FormDefinition): Map<string, FormField> {
  return new Map(fieldsFor(definition).map((field) => [field.id, field]));
}

export function fieldValue(value: unknown): string | string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (value === null || value === undefined) return "";
  return String(value);
}

export function firstValue(value: unknown): string {
  const normalised = fieldValue(value);
  return Array.isArray(normalised) ? normalised[0] ?? "" : normalised;
}

export function hasValue(value: unknown): boolean {
  const normalised = fieldValue(value);
  return Array.isArray(normalised)
    ? normalised.some((item) => item.trim().length > 0)
    : normalised.trim().length > 0;
}
