# 💬 ChitChat

**Friendly messaging made simple** - A modern, real-time chat application built with Next.js and Firebase.

![ChitChat](https://img.shields.io/badge/ChitChat-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

- 🔐 **Secure Authentication** - Email/password signup and login
- 💬 **Real-time Messaging** - Instant message delivery
- 👥 **Friend System** - Send and accept friend requests
- 📱 **Mobile Responsive** - Perfect on all devices
- 🎨 **Beautiful UI** - Clean white theme with colorful buttons
- ⚡ **Fast Performance** - Optimized for speed
- 🔄 **Typing Indicators** - See when friends are typing
- 📧 **Username Validation** - Real-time availability checking

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chitchat
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config

4. **Configure environment**
   ```bash
   # Create .env.local with your Firebase config
   # Get these values from Firebase Console > Project Settings > General
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** 🎉

## 🏗️ Built With

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Authentication)
- **Deployment**: Vercel / Firebase Hosting

## 📱 Screenshots

*Add your screenshots here*

## 🚀 Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables (see below)
   - Deploy! 🚀

3. **Environment Variables for Vercel**
   Add these in your Vercel dashboard:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Icons by [Lucide React](https://lucide.dev)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)

---

**ChitChat** - Where conversations come alive! 💬✨