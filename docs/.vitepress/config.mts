import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'SaleSpider',
  description: 'Smart Inventory & Sales Management for Modern Stores',
  base: process.env.NODE_ENV === 'production' ? '/SaleSpider/' : '/',

  head: [
    [
      'link',
      {
        rel: 'icon',
        href:
          process.env.NODE_ENV === 'production'
            ? '/SaleSpider/favicon.ico'
            : '/favicon.ico',
      },
    ],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'SaleSpider Documentation' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Deployment', link: '/deployment/' },
      { text: 'Features', link: '/features/' },
      { text: 'GitHub', link: 'https://github.com/IdrisAkintobi/SaleSpider' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is SaleSpider?', link: '/introduction' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Features Overview', link: '/features/' },
          ],
        },
        {
          text: 'Deployment',
          items: [
            { text: 'Deployment Guide', link: '/deployment/' },
            { text: 'Self-Hosted', link: '/deployment/self-hosted' },
            { text: 'Hosted Database', link: '/deployment/hosted-database' },
            { text: 'Cloud Platforms', link: '/deployment/cloud-platforms' },
            { text: 'Windows Deployment', link: '/deployment/windows' },
            { text: 'Offline Operation', link: '/deployment/offline' },
          ],
        },
        {
          text: 'Configuration',
          items: [
            {
              text: 'Environment Variables',
              link: '/configuration/environment-variables',
            },
            { text: 'Backup Configuration', link: '/configuration/backup' },
            { text: 'Security Settings', link: '/configuration/security' },
            {
              text: 'Custom Payment Methods',
              link: '/configuration/custom-payment-methods',
            },
          ],
        },
        {
          text: 'Operations',
          items: [
            { text: 'Backup & Restore', link: '/operations/backup-restore' },
            { text: 'Makefile Commands', link: '/operations/makefile' },
            { text: 'Monitoring', link: '/operations/monitoring' },
            { text: 'Troubleshooting', link: '/operations/troubleshooting' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Dashboard & Reporting', link: '/features/dashboard' },
            { text: 'Inventory Management', link: '/features/inventory' },
            { text: 'Sales Recording', link: '/features/sales' },
            { text: 'Staff Management', link: '/features/staff' },
            { text: 'AI Features', link: '/features/ai' },
          ],
        },
        {
          text: 'Development',
          items: [
            { text: 'Local Setup', link: '/development/local-setup' },
            { text: 'Project Structure', link: '/development/structure' },
            { text: 'Architecture', link: '/development/architecture' },
            { text: 'Contributing', link: '/development/contributing' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/IdrisAkintobi/SaleSpider' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present SaleSpider Contributors',
    },

    editLink: {
      pattern:
        'https://github.com/IdrisAkintobi/SaleSpider/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
      },
    },
  },
})
