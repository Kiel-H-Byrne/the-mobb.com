// const withImages = require('next-images')
// module.exports = withImages({
  
// })
const path = require('path')

module.exports = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    NEXT_PUBLIC_OG_KEY: process.env.NEXT_PUBLIC_OG_KEY
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}