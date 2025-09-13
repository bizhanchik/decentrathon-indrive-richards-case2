// Type definitions for inDrive website components

export interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  backgroundColor?: string;
}

export interface ServiceCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  href?: string;
}

export interface ImpactCard {
  id: string;
  image: string;
  statistic: string;
  description: string;
  backgroundColor?: string;
}

export interface SafetyFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: string;
}

export interface FooterSection {
  title: string;
  links: NavigationItem[];
}

export interface AppDownload {
  platform: 'ios' | 'android' | 'huawei';
  href: string;
  icon: string;
  text: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Props interfaces for components
export interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export interface HeroProps {
  slides: HeroSlide[];
  autoplayInterval?: number;
}

export interface ServicesProps {
  services: ServiceCard[];
}

export interface ImpactProps {
  cards: ImpactCard[];
}

export interface SafetyProps {
  features: SafetyFeature[];
}

export interface FooterProps {
  sections: FooterSection[];
  socialLinks: SocialLink[];
  appDownloads: AppDownload[];
  legalLinks: NavigationItem[];
}