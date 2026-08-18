export const managedFormSlugs = ["service-supply", "hire-contract"] as const;

export type ManagedFormSlug = (typeof managedFormSlugs)[number];

export const formWorkflowMeta: Record<
  ManagedFormSlug,
  {
    title: string;
    plural: string;
    shortTitle: string;
    statuses: readonly string[];
    dueLabel: string;
  }
> = {
  "service-supply": {
    title: "Service supply form",
    plural: "Service supply forms",
    shortTitle: "Service form",
    statuses: [
      "received",
      "reviewed",
      "ready to schedule",
      "scheduled",
      "complete",
      "cancelled",
    ],
    dueLabel: "Target service date",
  },
  "hire-contract": {
    title: "Hire contract",
    plural: "Hire contracts",
    shortTitle: "Hire contract",
    statuses: [
      "received",
      "reviewed",
      "approved",
      "active",
      "return due",
      "complete",
      "cancelled",
    ],
    dueLabel: "Return or follow-up date",
  },
};

export function isManagedFormSlug(value: string): value is ManagedFormSlug {
  return managedFormSlugs.includes(value as ManagedFormSlug);
}

export function formTitle(value: string): string {
  return isManagedFormSlug(value)
    ? formWorkflowMeta[value].title
    : value === "contact"
      ? "Contact enquiry"
      : value.replaceAll("-", " ");
}

export function displayStatus(value: string): string {
  return value
    .split(" ")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function isDemoRecord(id: string | null | undefined): boolean {
  return Boolean(id?.startsWith("demo-"));
}
