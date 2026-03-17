import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Controla los Puchos',
    short_name: 'Controla los Puchos.',
    description: 'Gestión y reducción progresiva del consumo de tabaco',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/logo.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
