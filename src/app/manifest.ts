import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Govt Job 2026 : Official Govt Jobs & Results Portal',
    short_name: 'Govt Job',
    description: 'Latest government jobs, online application forms, admit cards, exam results, and answer keys in India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfbf7',
    theme_color: '#8b0000',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-IN',
    categories: ['education', 'business', 'news'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Latest Jobs',
        short_name: 'Jobs',
        description: 'Check latest government recruitment notifications',
        url: '/category/latest-jobs',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Admit Card',
        short_name: 'Admit Card',
        description: 'Download exam hall tickets and admit cards',
        url: '/category/admit-card',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Results',
        short_name: 'Results',
        description: 'Check government examination results',
        url: '/category/results',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Search Jobs',
        short_name: 'Search',
        description: 'Search vacancies by department or qualification',
        url: '/search',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
