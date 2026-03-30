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
    href: "/#case-evidence",
    label: "Case evidence",
    description: "Real outcomes from recent projects",
  },
  {
    href: "/#process-overview",
    label: "Process",
    description: "How we move from brief to launch",
  },
  {
    href: "/#faq",
    label: "FAQ",
    description: "Answers before you enquire",
  },
];
