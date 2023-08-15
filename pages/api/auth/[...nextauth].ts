import NextAuth from 'next-auth';
//@ts-ignore
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
    providers: [
        // OAuth authentication providers
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
            // scope:
            //   "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        }),
        // Sign in with passwordless email link
        // EmailProvider({
        //     server: process.env.MAIL_SERVER,
        //     from: '<no-reply@thehilmar.com>'
        // }),
        // Providers.Facebook({})
        // Providers.Reddit({})
        // Providers.Twitter({})
        // Providers.Instagram({})
    ],
    // SQL or MongoDB database (or leave empty)
    //   database: process.env.MONGODB_URI,
    //   debug: true,
    //   callbacks: {
    //     session: async (session: Session, user: Profile) => {
    //       // console.log(session.id, user.id)
    //       session.id = user.id
    //       return Promise.resolve(session)
    //     }
    //   }
});