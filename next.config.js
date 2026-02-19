// const withImages = require('next-images')
// module.exports = withImages({
  
// })
const path = require('path')

module.exports = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    NEXT_PUBLIC_OG_KEY: process.env.NEXT_PUBLIC_OG_KEY,
    NEXT_PUBLIC_ATLAS_KEY: process.env.NEXT_PUBLIC_ATLAS_KEY,
    GOOGLE_SERVER_KEY: process.env.GOOGLE_SERVER_KEY,
    DBOBB_MONGODB_URI: process.env.MONGODB_URI,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}