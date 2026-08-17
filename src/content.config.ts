import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      image: image().optional(),
      youtube: z.string().optional(),
    }),
});

const reviews = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/reviews" }),
  schema: z.object({
    name: z.string(),
    address: z.string(),
    website: z.string().optional(),
    photo: z.string().optional(),
    rating: z.number().min(1).max(5),
    pubDate: z.coerce.date(),
  }),
});

const formField = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  type: z.enum([
    "text",
    "email",
    "tel",
    "date",
    "textarea",
    "select",
    "radio",
    "checkbox",
    "acceptance",
  ]),
  label: z.string(),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  help: z.string().optional(),
  autocomplete: z.string().optional(),
  inputMode: z.enum(["text", "email", "tel", "numeric", "decimal"]).optional(),
  rows: z.number().int().min(2).max(12).optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

const forms = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/forms" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    version: z.string(),
    description: z.string(),
    submitLabel: z.string().default("Submit form"),
    confirmationTitle: z.string().default("Thank you"),
    confirmationMessage: z.string(),
    sections: z.array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        fields: z.array(formField).min(1),
      }),
    ),
  }),
});

export const collections = { blog, reviews, forms };
