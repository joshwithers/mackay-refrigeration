export interface NavItem {
  label: string;
  href: string;
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const menuGroups: NavGroup[] = [
  {
    label: 'Company',
    items: [
      {
        label: 'Home',
        href: '/',
        description: 'Commercial refrigeration & air conditioning, Mackay QLD',
      },
      {
        label: 'About',
        href: '/about',
        description: 'Who we are and where we operate',
      },
      {
        label: 'Services',
        href: '/services',
        description: 'Cold rooms, HVAC, beer systems, maintenance & more',
      },
      {
        label: 'Reviews',
        href: '/reviews',
        description: 'What our customers say about us',
      },
      {
        label: 'Blog',
        href: '/blog',
        description: 'News, tips and updates from the team',
      },
      {
        label: 'Contact',
        href: '/contact',
        description: 'Free quotes across Mackay and North Queensland',
      },
    ],
  },
  {
    label: 'Legal',
    items: [
      {
        label: 'Hire Contract',
        href: '/hire-contract',
        description: 'Equipment hire conditions and agreement form',
      },
      {
        label: 'Supply Terms & Conditions',
        href: '/terms',
        description: 'Supply of equipment and services agreement',
      },
      {
        label: 'Privacy Policy',
        href: '/privacy',
        description: 'How we handle your personal information',
      },
    ],
  },
];
