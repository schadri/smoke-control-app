import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Controlador de Cigarrillos',
    short_name: 'Control C.',
    description: 'Gestión y reducción progresiva del consumo de tabaco',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
