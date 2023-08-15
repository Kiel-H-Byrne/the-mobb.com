// const withImages = require('next-images')
// module.exports = withImages({
// })
const path = require('path')

module.exports = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    NEXT_PUBLIC_EMAIL_SERVER: process.env.EMAIL_SERVER,
    NEXT_PUBLIC_EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_OG_KEY: process.env.NEXT_PUBLIC_OG_KEY,
    NEXT_PUBLIC_ATLAS_KEY: process.env.NEXT_PUBLIC_ATLAS_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_SERVER_KEY: process.env.GOOGLE_SERVER_KEY,
    GOOGLE_OAUTH_ID: process.env.GOOGLE_OAUTH_ID,
    GOOGLE_OAUTH_SECRET: process.env.GOOGLE_OAUTH_SECRET,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}