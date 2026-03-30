export type NavLink = {
  href: string;
  label: string;
  description: string;
};

// Sales-focused IA for the landing flow:
// orient -> proof -> process -> objections.
export const NAV_LINKS: NavLink[] = [
  {
    href: "/#services",
    label: "Services",
    description: "What we can build for your business",
  },
  {
    href: "/work/",
    label: "Work",
    description: "Selected launches and outcomes",
  },
  {
    href: "/packages/",
    label: "Packages",
    description: "Scope, pricing, and delivery",
  },
  {
    href: "/#process-overview",
    label: "Process",
    description: "How we move from brief to launch",
  },
  {
    href: "/studio/",
    label: "Studio",
    description: "The person and principles behind Kersivo",
  },
  {
    href: "/#faq",
    label: "FAQ",
    description: "Answers before you enquire",
  },
];
