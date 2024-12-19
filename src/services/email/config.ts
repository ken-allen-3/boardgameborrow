export const EMAIL_CONFIG = {
  from: {
    email: import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'kenny@springwavestudios.com',
    name: import.meta.env.VITE_EMAIL_FROM_NAME || 'BoardGameBorrow'
  },
  admin: {
    email: 'kenny@springwavestudios.com',
    name: 'Kenny'
  }
};