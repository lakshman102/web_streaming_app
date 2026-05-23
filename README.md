# CloudStream Studio - Cloud-Based Streaming & Broadcasting Platform

A professional, cloud-based streaming application inspired by OBS Studio and StreamYard, enabling users to broadcast live to multiple platforms (YouTube, Twitch, Facebook, Custom RTMP) directly from their browser without installing desktop software.

## Key Features

### Phase 1 (Current - MVP)
- ✅ User authentication (signup/login) with JWT
- ✅ Secure password storage with bcryptjs
- ✅ Session management with refresh tokens
- ✅ MongoDB integration for user data
- ✅ Zustand global state management
- ✅ Dark theme professional UI (inspired by modern streaming tools)

### Phase 2 (In Progress)
- YouTube Live API integration with OAuth 2.0
- Multi-scene setup and management
- WebRTC screen capture and webcam input
- Browser-based canvas composition (Konva.js)
- Configurable encoding settings (bitrate, FPS, resolution)

### Phase 3 (Planned)
- Multi-platform streaming (Twitch, Facebook, Custom RTMP)
- Audio mixing with per-source volume control
- Real-time effects and filters
- Live chat integration from platforms
- Cloud recording and archive management

### Phase 4 (Enterprise)
- Auto-scaling encoding infrastructure (Docker)
- CDN integration for low-latency streaming
- Advanced analytics and performance monitoring
- Team collaboration features
- API for third-party integrations

## Project Structure

```
cloudstream-studio/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── signup/route.ts       # User registration
│   │       ├── login/route.ts        # User authentication
│   │       └── refresh/route.ts      # Token refresh
│   ├── login/page.tsx                # Login UI
│   ├── signup/page.tsx               # Signup UI
│   ├── dashboard/page.tsx            # Main dashboard (coming soon)
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles with dark theme
│
├── lib/
│   ├── db.ts                         # MongoDB connection
│   ├── auth.ts                       # JWT and password utilities
│   ├── models/
│   │   ├── user.ts                   # User schema
│   │   └── stream-session.ts         # StreamSession schema
│   └── store/
│       └── stream-store.ts           # Zustand global state
│
├── components/
│   ├── ui/                           # Shadcn/ui components
│   ├── Studio/                       # Streaming studio components
│   └── Destinations/                 # Platform integration UI
│
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind CSS config
├── next.config.mjs                   # Next.js config
├── IMPLEMENTATION_GUIDE.md           # Phase-by-phase development guide
└── ARCHITECTURE_DIAGRAMS.md          # System architecture documentation
```

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality accessible components
- **Zustand** - Lightweight state management
- **Konva.js** - Canvas library for scene composition

### Backend
- **Node.js** - JavaScript runtime
- **Next.js API Routes** - Backend endpoints
- **Express.js** - Flexible HTTP framework (for separate services)
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Redis** - Caching and job queue
- **Bull** - Job queue for encoding tasks

### Streaming Infrastructure
- **WebRTC** - Real-time media capture
- **Socket.io** - Real-time signaling
- **FFmpeg** - Video encoding (Phase 3)
- **Nginx RTMP** - RTMP server (Phase 3)
- **YouTube Live API** - YouTube streaming
- **Twitch API** - Twitch integration
- **Facebook Graph API** - Facebook streaming

### Security
- **JWT (Jose)** - Token-based authentication
- **Bcryptjs** - Password hashing
- **HTTPS** - Encrypted communication
- **HTTP-only cookies** - Secure token storage

### DevOps & Deployment
- **Vercel** - Frontend hosting
- **Docker** - Containerization for encoding services
- **AWS/DigitalOcean** - Backend infrastructure
- **MongoDB Atlas** - Managed database
- **GitHub** - Version control

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB instance (local or Atlas)
- Redis instance (local or Upstash)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository>
cd cloudstream-studio
pnpm install
```

2. **Configure environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

3. **Start the development server**
```bash
pnpm dev
```

4. **Open your browser**
```
http://localhost:3000
```

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cloudstream-studio

# JWT Secrets
JWT_SECRET=your-secure-secret-key-change-in-production
JWT_REFRESH_SECRET=your-secure-refresh-key-change-in-production

# YouTube OAuth
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback

# Twitch OAuth
TWITCH_CLIENT_ID=your-client-id
TWITCH_CLIENT_SECRET=your-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret

# Encoding Service
ENCODING_SERVICE_URL=http://localhost:8888
RTMP_SERVER_URL=rtmp://localhost:1935
```

## Development Workflow

### Phase 1A: Foundation (Completed ✅)
- User authentication system
- Database schema
- State management setup
- UI components and styling

### Phase 1B: YouTube Integration (Current)
- OAuth 2.0 flow implementation
- Secure token storage
- Stream session creation
- API endpoints for configuration

### Phase 1C: Dashboard UI (Next)
- Main streaming interface
- Scene editor with drag-and-drop
- Platform selector
- Encoding controls

### Phase 1D: WebRTC Integration (Next)
- Screen capture implementation
- Webcam input handling
- Canvas composition
- Real-time preview

### Phase 2A: Multi-Platform Support
- Twitch RTMP integration
- Facebook Graph API
- Custom RTMP server support
- Simultaneous multi-platform streaming

### Phase 2B: Advanced Features
- Audio mixing system
- Live chat aggregation
- Effects and filters
- Cloud recording

### Phase 3A: Encoding Infrastructure
- Docker-based encoding service
- FFmpeg process management
- RTMP server setup
- Load balancing

### Phase 3B: Production Features
- Auto-scaling encoding
- CDN integration
- Advanced analytics
- Performance optimization

### Phase 4: Enterprise
- Team features
- Webhook support
- Advanced moderation
- Custom integrations

## API Endpoints

### Authentication
```
POST   /api/auth/signup              Register new user
POST   /api/auth/login               User login
POST   /api/auth/refresh             Refresh access token
POST   /api/auth/logout              Logout user
```

### Stream Management (Coming Soon)
```
POST   /api/streams/create           Create new stream session
GET    /api/streams/[id]             Get stream details
PUT    /api/streams/[id]/config      Update stream config
POST   /api/streams/[id]/start       Start broadcasting
POST   /api/streams/[id]/stop        Stop broadcasting
GET    /api/streams/[id]/scenes      List scenes
PATCH  /api/streams/[id]/scenes      Update scene
```

### Platform Integrations (Coming Soon)
```
GET    /api/integrations/youtube/connect           YouTube OAuth
GET    /api/integrations/twitch/connect            Twitch OAuth
GET    /api/integrations/facebook/connect          Facebook OAuth
GET    /api/integrations/[platform]/channels      List channels
```

## Database Schema

### User Collection
```javascript
{
  email: string (unique),
  username: string (unique),
  password: string (hashed),
  profile: {
    displayName: string,
    avatar: string,
    bio: string
  },
  integrations: {
    youtube: { accessToken, refreshToken, channelId },
    twitch: { accessToken, userId, channelId },
    facebook: { accessToken, pageId },
    customRtmp: [{ name, url, key }]
  },
  subscription: { plan, expiresAt },
  createdAt: date,
  updatedAt: date
}
```

### StreamSession Collection
```javascript
{
  userId: ObjectId (ref: User),
  title: string,
  description: string,
  status: "idle" | "live" | "ended" | "recording",
  streamKey: string (unique),
  sources: {
    scenes: [{
      id: string,
      name: string,
      sources: [{ id, type, position, settings }],
      isActive: boolean
    }]
  },
  destinations: {
    youtube: { broadcastId, videoId, status },
    twitch: { status, channelId },
    facebook: { pageId, status },
    customRtmp: [{ name, status }]
  },
  audio: { masterVolume, sources[] },
  encoding: { bitrate, fps, resolution, codec },
  statistics: { peakViewers, totalViewers, duration },
  createdAt: date,
  updatedAt: date
}
```

## Security Considerations

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT tokens with short expiration (15 minutes)
- ✅ Refresh tokens in HTTP-only cookies
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ OAuth 2.0 with PKCE flow (coming soon)
- ✅ Rate limiting on API endpoints (coming soon)
- ✅ MongoDB user credentials encryption (coming soon)

## Performance Optimization

- ✅ Next.js server-side rendering
- ✅ Code splitting and lazy loading
- ✅ Image optimization
- ⏳ Redis caching for frequently accessed data
- ⏳ CDN for static assets and live streams
- ⏳ Database query optimization and indexing
- ⏳ WebRTC connection pooling

## Contributing

This is a learning project demonstrating a production-grade streaming platform architecture. For development contributions:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes following the existing code style
3. Commit with descriptive messages: `git commit -m "Add feature: description"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a pull request

## Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Phase-by-phase development roadmap
- **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** - System architecture and data flows
- **[/v0_plans/streaming-app-architecture.md](./v0_plans/streaming-app-architecture.md)** - Detailed technical specifications

## Roadmap

| Phase | Status | Timeline | Features |
|-------|--------|----------|----------|
| Phase 1A | ✅ Done | Week 1 | Auth, DB, UI Foundation |
| Phase 1B | 🔄 In Progress | Week 2 | YouTube Integration |
| Phase 1C | ⏳ Planned | Week 3 | Dashboard UI |
| Phase 1D | ⏳ Planned | Week 4 | WebRTC Capture |
| Phase 2A | ⏳ Planned | Week 5-6 | Multi-Platform |
| Phase 2B | ⏳ Planned | Week 7-8 | Audio Mixer, Chat |
| Phase 3A | ⏳ Planned | Week 9 | Encoding Service |
| Phase 3B | ⏳ Planned | Week 10 | Effects, Recording |
| Phase 4 | ⏳ Planned | Week 11-12+ | Scaling, Enterprise |

## Inspiration

This project is inspired by:
- **OBS Studio** - Professional desktop streaming software
- **StreamYard** - Browser-based streaming studio
- **Vercel** - Modern deployment and infrastructure
- **Professional streaming platforms** - YouTube, Twitch, Facebook Live

## License

This project is created for educational and demonstration purposes.

## Support

For questions or issues:
1. Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for development help
2. Review [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) for system design
3. Open an issue in the repository
4. Consult the official documentation for dependencies

## Next Steps

To continue development:

1. **Review the plan**: Read `IMPLEMENTATION_GUIDE.md`
2. **Understand the architecture**: Review `ARCHITECTURE_DIAGRAMS.md`
3. **Start Phase 1B**: Implement YouTube OAuth integration
4. **Test locally**: Set up MongoDB and Redis, then run `pnpm dev`
5. **Follow the phased approach**: Complete each phase before moving to the next

---

**Status**: Phase 1A Foundation Complete ✅  
**Next**: Phase 1B YouTube Integration  
**Last Updated**: April 2026
