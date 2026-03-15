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

export const collections = { blog, reviews };
