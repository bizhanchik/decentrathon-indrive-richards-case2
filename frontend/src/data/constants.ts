import type { 
  NavigationItem, 
  HeroSlide, 
  ServiceCard, 
  ImpactCard, 
  SafetyFeature, 
  SocialLink, 
  FooterSection, 
  AppDownload, 
  Language 
} from '../types';

// Navigation data
export const navigationItems: NavigationItem[] = [
  { label: 'Safety', href: '#safety' },
  { label: 'Earn', href: '#earn' },
  { label: 'Ride', href: '#ride' },
  { label: 'Drive', href: '#drive' },
  { label: 'Deliver', href: '#deliver' },
  { label: 'Send', href: '#send' },
];

// Language options
export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

// Hero slides data
export const heroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    image: '/src/assets/images/hero-slide-1.jpg',
    title: 'Join a fair journey',
    subtitle: 'Request a ride, name your fare',
    description: 'Where people agree on ride prices together',
    ctaText: 'Download the app',
    ctaHref: '#download',
    backgroundColor: '#C1F11D'
  },
  {
    id: 'slide-2', 
    image: '/src/assets/images/hero-slide-2.jpg',
    title: 'A fairer way to do business',
    subtitle: 'Drive when you want',
    description: 'is something we can all agree on',
    ctaText: 'Download the app',
    ctaHref: '#download',
    backgroundColor: '#C1F11D'
  },
  {
    id: 'slide-3',
    image: '/src/assets/images/hero-slide-3.jpg', 
    title: 'We create positive change for all communities',
    subtitle: 'Challenge injustice',
    description: 'and challenge injustice',
    ctaText: 'Download the app',
    ctaHref: '#download',
    backgroundColor: '#C1F11D'
  }
];

// Services data
export const services: ServiceCard[] = [
  {
    id: 'ride',
    icon: '🚗',
    title: 'Ride',
    description: 'Request a ride and choose your price'
  },
  {
    id: 'drive',
    icon: '👤',
    title: 'Drive',
    description: 'Earn money by giving rides to passengers'
  },
  {
    id: 'deliver',
    icon: '📦',
    title: 'Deliver',
    description: 'Make deliveries and earn on your schedule'
  },
  {
    id: 'send',
    icon: '📮',
    title: 'Send',
    description: 'Send packages across the city'
  }
];

// Impact cards data
export const impactCards: ImpactCard[] = [
  {
    id: 'impact-1',
    image: '/src/assets/images/impact-card-1.jpg',
    statistic: '1M+',
    description: 'Drivers earning with inDrive globally'
  },
  {
    id: 'impact-2', 
    image: '/src/assets/images/impact-card-2.jpg',
    statistic: '750M+',
    description: 'Rides completed worldwide'
  },
  {
    id: 'impact-3',
    image: '/src/assets/images/impact-card-3.jpg',
    statistic: '47',
    description: 'Countries where inDrive operates'
  }
];

// Safety features data
export const safetyFeatures: SafetyFeature[] = [
  {
    id: 'verification',
    icon: '✓',
    title: 'Driver verification',
    description: 'All drivers go through background checks and verification'
  },
  {
    id: 'tracking',
    icon: '📍',
    title: 'Live tracking',
    description: 'Track your ride in real-time and share with contacts'
  },
  {
    id: 'support',
    icon: '🛡️',
    title: '24/7 support',
    description: 'Round-the-clock customer support for safety concerns'
  },
  {
    id: 'emergency',
    icon: '🚨',
    title: 'Emergency button',
    description: 'Quick access to emergency services when needed'
  }
];

// Footer data
export const footerSections: FooterSection[] = [
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' }
    ]
  },
  {
    title: 'Services',
    links: [
      { label: 'Ride', href: '/ride' },
      { label: 'Drive', href: '/drive' },
      { label: 'Deliver', href: '/deliver' },
      { label: 'Send', href: '/send' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/help' },
      { label: 'Safety', href: '/safety' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Lost items', href: '/lost' }
    ]
  }
];

export const socialLinks: SocialLink[] = [
  { platform: 'Facebook', href: 'https://facebook.com/indrive', icon: '📘' },
  { platform: 'Instagram', href: 'https://instagram.com/indrive', icon: '📷' },
  { platform: 'Twitter', href: 'https://twitter.com/indrive', icon: '🐦' },
  { platform: 'LinkedIn', href: 'https://linkedin.com/company/indrive', icon: '💼' },
  { platform: 'YouTube', href: 'https://youtube.com/indrive', icon: '📺' }
];

export const appDownloads: AppDownload[] = [
  {
    platform: 'ios',
    href: 'https://apps.apple.com/app/indrive',
    icon: '🍎',
    text: 'Download on the App Store'
  },
  {
    platform: 'android',
    href: 'https://play.google.com/store/apps/details?id=sinet.startup.indriver',
    icon: '🤖',
    text: 'Get it on Google Play'
  },
  {
    platform: 'huawei',
    href: 'https://appgallery.huawei.com/app/indrive',
    icon: '📱',
    text: 'Explore it on AppGallery'
  }
];

export const legalLinks: NavigationItem[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Accessibility', href: '/accessibility' }
];