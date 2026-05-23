# CloudStream Studio - System Architecture & Data Flows

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Browser)                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js + React 19 Frontend                        │  │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────────────┐ │  │
│  │  │   Zustand    │  │  Socket.io      │  │  WebRTC Media Capture   │ │  │
│  │  │ Global State │  │  Real-time      │  │  (Screen/Webcam/Mic)   │ │  │
│  │  │              │  │  Signaling      │  │                        │ │  │
│  │  └──────────────┘  └─────────────────┘  └──────────────────────────┘ │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │         Scene Composer (Konva.js Canvas)                      │ │  │
│  │  │  • Drag-drop source positioning                              │ │  │
│  │  │  • Multi-layer scene management                             │ │  │
│  │  │  • Real-time preview rendering                              │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │      Platform Selector & Encoding Controls                    │ │  │
│  │  │  • YouTube / Twitch / Facebook toggle                         │ │  │
│  │  │  • Bitrate / FPS / Resolution selection                      │ │  │
│  │  │  • Audio mixer with per-source volume                         │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓ (WebSocket + HTTPS)
┌─────────────────────────────────────────────────────────────────────────────┐
│                   BACKEND API LAYER (Next.js API Routes)                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Authentication Routes                                              │  │
│  │  POST /api/auth/signup      → Register user, create JWT            │  │
│  │  POST /api/auth/login       → Authenticate, issue tokens           │  │
│  │  POST /api/auth/refresh     → Refresh expired access token         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Integration Routes (OAuth handling)                                 │  │
│  │  /api/integrations/youtube/*    → YouTube Live API integration      │  │
│  │  /api/integrations/twitch/*     → Twitch RTMP credentials           │  │
│  │  /api/integrations/facebook/*   → Facebook Graph API integration    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Stream Management Routes                                            │  │
│  │  POST   /api/streams/create     → Create stream session             │  │
│  │  PUT    /api/streams/[id]/config → Update scene/encoding settings  │  │
│  │  POST   /api/streams/[id]/start  → Initiate broadcasting            │  │
│  │  POST   /api/streams/[id]/stop   → End stream, close connections    │  │
│  │  GET    /api/streams/[id]/scenes → List scenes for session          │  │
│  │  PATCH  /api/streams/[id]/scenes → Modify scene layout              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓ (HTTPS + Credentials)
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONGODB DATABASE LAYER                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Collections:                                                        │  │
│  │  • users          → Credentials, OAuth tokens, subscriptions        │  │
│  │  • streamSessions → Scene configs, destinations, encoding settings  │  │
│  │  • encodingJobs   → Job queue for FFmpeg processes                  │  │
│  │  • chatMessages   → Live chat archive from platforms               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓ (RTMP Push)
┌─────────────────────────────────────────────────────────────────────────────┐
│              THIRD-PARTY STREAMING PLATFORMS                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  YouTube Live    │  │  Twitch RTMP     │  │  Facebook Live   │          │
│  │  (OAuth 2.0)     │  │  (Stream Key)    │  │  (Graph API)     │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Session Flow

```
USER FLOW: SIGNUP → LOGIN → AUTHENTICATED SESSION

Step 1: Signup
────────────────────────────────────────────────────────────────
User enters: email, username, password
    ↓
POST /api/auth/signup
    ↓
Backend:
  1. Validate input (email unique, username unique, password 8+ chars)
  2. Hash password with bcryptjs (10 rounds)
  3. Create MongoDB User document
  4. Generate JWT tokens:
     - accessToken (15m expiry) → response body
     - refreshToken (7d expiry) → HTTP-only cookie
    ↓
Response:
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "displayName": "username"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
    ↓
Client:
  1. Store accessToken in memory (Zustand)
  2. Browser stores refreshToken in HTTP-only cookie
  3. Redirect to /dashboard


Step 2: API Request with Authentication
────────────────────────────────────────────────────────────────
Client needs to access protected resource
    ↓
Include in request:
  Header: Authorization: Bearer <accessToken>
    ↓
Backend middleware:
  1. Extract token from header
  2. Verify JWT signature
  3. Check expiration
  4. Extract payload (userId, email, username)
  5. Allow request or return 401 Unauthorized


Step 3: Token Refresh (when accessToken expires)
────────────────────────────────────────────────────────────────
Client detects 401 response (accessToken expired)
    ↓
POST /api/auth/refresh
  (Browser auto-sends refreshToken cookie)
    ↓
Backend:
  1. Extract refreshToken from cookie
  2. Verify JWT signature with REFRESH_SECRET
  3. Check expiration (still within 7 days?)
  4. Generate new accessToken (15m)
  5. Return new token
    ↓
Client:
  1. Store new accessToken
  2. Retry original request


Step 4: Logout
────────────────────────────────────────────────────────────────
User clicks "Logout"
    ↓
Client:
  1. Clear accessToken from memory
  2. Clear refreshToken cookie
  3. Call POST /api/auth/logout (optional backend cleanup)
  4. Redirect to /login
```

---

## 3. Stream Creation & Broadcasting Flow

```
STREAMING FLOW: CREATE SESSION → CONFIGURE → START BROADCAST

Phase 1: Create Stream Session
────────────────────────────────────────────────────────────────
User clicks "New Stream" in dashboard
    ↓
Browser (React):
  1. Open dialog: title, description
  2. User enters metadata
    ↓
POST /api/streams/create
{
  "title": "Gaming Session",
  "description": "Playing new games"
}
    ↓
Backend:
  1. Verify JWT token (user authenticated)
  2. Generate unique streamKey (UUID)
  3. Create StreamSession in MongoDB:
     {
       userId: user._id,
       title: "Gaming Session",
       status: "idle",
       streamKey: "abc123xyz",
       scenes: [],
       destinations: {},
       encoding: {
         bitrate: 6000,
         fps: 60,
         resolution: "1080p",
         codec: "h264"
       }
     }
  4. Return stream session ID
    ↓
Client Zustand:
  setCurrentStreamSession({
    id: "stream_session_id",
    title: "Gaming Session",
    streamKey: "abc123xyz",
    status: "idle"
  })


Phase 2: Configure Scenes & Sources
────────────────────────────────────────────────────────────────
User creates scenes with sources:
  1. Scene 1: "Full Screen" 
     - Source 1: Screen capture (full canvas)
     - Source 2: Webcam (bottom-right corner)
  
  2. Scene 2: "Just Webcam"
     - Source 1: Webcam (full canvas)

Browser captures:
  getDisplayMedia() → screenMediaStream
  getUserMedia() → webcamMediaStream
  
Canvas composition:
  - Scene 1: Draw screen at (0,0,1920,1080), webcam at (1600,800,300,300)
  - Scene 2: Draw webcam at (0,0,1920,1080)
    
Zustand state updated:
  addScene({ id: "scene1", name: "Full Screen", ... })
  addScene({ id: "scene2", name: "Just Webcam", ... })
    

PUT /api/streams/[streamId]/config
{
  "scenes": [...],
  "encoding": {
    "bitrate": 6000,
    "fps": 60,
    "resolution": "1080p"
  }
}
    ↓
Backend:
  1. Verify ownership (stream belongs to user)
  2. Update StreamSession in MongoDB
  3. Validate scene structure
  4. Return confirmation


Phase 3: Select Destinations
────────────────────────────────────────────────────────────────
User toggles platforms:
  ✓ YouTube (connected: channel "My Gaming")
  ✓ Twitch (connected: username "gamer123")
  ☐ Facebook
  
Zustand state:
  setDestinations({
    youtube: true,
    twitch: true,
    facebook: false,
    customRtmp: []
  })


Phase 4: Start Broadcasting
────────────────────────────────────────────────────────────────
User clicks "Go Live"
    ↓
POST /api/streams/[streamId]/start
{
  "activeScene": "scene1",
  "destinations": {
    "youtube": true,
    "twitch": true
  }
}
    ↓
Backend:
  1. For each destination:
     
     YouTube:
       a. Fetch stored YouTube accessToken
       b. Call youtube.liveBroadcasts.insert()
       c. Get RTMP ingestion URL & stream key
       d. Store broadcastId in StreamSession
       
     Twitch:
       a. Fetch stored Twitch API key
       b. Get user stream key via API
       c. Prepare RTMP target
       
  2. Create EncodingJob in Bull queue
  3. Update StreamSession.status = "live"
  4. Return streaming endpoints
    ↓
Client Zustand:
  setIsLive(true)
  setStreamStatus("live")
  
Browser:
  1. Establish WebRTC connection to encoding service
  2. Send canvas.captureStream() via WebRTC
  3. Display real-time preview
  4. Start polling viewer count
  5. Subscribe to live chat from platforms


During Stream:
────────────────────────────────────────────────────────────────
Real-time updates via Socket.io:
  
  Server → Client:
    stream:viewer-count → { count: 1234 }
    chat:message → { platform: "youtube", user: "...", text: "..." }
    encoding:stats → { bitrate: 5998, fps: 60, dropped: 0 }
    
  Client → Server:
    stream:scene-update → switch to different scene
    stream:volume-update → adjust audio levels
    source:toggle → show/hide source


Phase 5: End Stream
────────────────────────────────────────────────────────────────
User clicks "End Stream"
    ↓
POST /api/streams/[streamId]/stop
    ↓
Backend:
  1. For each active destination:
     - YouTube: Call liveBroadcasts.transition(state: "ended")
     - Twitch: Stop RTMP stream
     
  2. Stop encoding job
  3. Close WebRTC connection
  4. Update StreamSession.status = "ended"
  5. Calculate statistics:
     - Duration
     - Peak viewers
     - Total chat messages
  6. Save recording metadata (if enabled)
    ↓
Client:
  setIsLive(false)
  setStreamStatus("ended")
  Navigate to /dashboard/streams/[id]/summary
    ↓
Summary Page:
  - "You streamed for 2 hours 15 minutes"
  - "Peak viewers: 1,523"
  - "YouTube: 456 views, 23 likes"
  - "Twitch: 1,200 viewers, 89 followers"
```

---

## 4. Data Model Relationships

```
USER DOCUMENT
├── _id (ObjectId)
├── email (unique)
├── username (unique)
├── password (hashed)
├── profile
│   ├── displayName
│   ├── avatar URL
│   └── bio
├── integrations
│   ├── youtube { accessToken, refreshToken, channelId }
│   ├── twitch { accessToken, userId, channelId }
│   ├── facebook { accessToken, pageId }
│   └── customRtmp [ { name, url, key } ]
├── subscription { plan, expiresAt }
└── streamingChannels [] (ref: StreamSession._id)

   ↓ HAS MANY

STREAM SESSION DOCUMENT
├── _id (ObjectId)
├── userId (ref: User._id) ← FOREIGN KEY
├── title
├── description
├── status ("idle" | "live" | "ended")
├── streamKey (unique)
├── sources
│   └── scenes [ { id, name, sources[], isActive } ]
├── destinations
│   ├── youtube { broadcastId, videoId, status }
│   ├── twitch { status, channelId }
│   ├── facebook { pageId, status }
│   └── customRtmp [ { name, status } ]
├── audio { masterVolume, sources[] }
├── encoding { bitrate, fps, resolution, codec }
├── chatIntegration { enabled, sources[] }
├── startTime
├── endTime
├── recordedVideo { url, duration, size }
├── statistics { peakViewers, totalViewers, duration }
└── timestamps

   ↓ HAS MANY

ENCODING JOB DOCUMENT
├── _id (ObjectId)
├── streamSessionId (ref: StreamSession._id) ← FOREIGN KEY
├── status ("queued" | "processing" | "completed" | "failed")
├── input { webrtcOffer, audioSettings }
├── output { rtmpUrl, hlsUrl, dashUrl }
├── encodingProfile ("1080p60" | "720p30" | "480padaptive")
├── startTime
├── endTime
├── errorLog
└── timestamps

   ↓ HAS MANY

CHAT MESSAGE DOCUMENT
├── _id (ObjectId)
├── streamSessionId (ref: StreamSession._id) ← FOREIGN KEY
├── platform ("youtube" | "twitch" | "facebook")
├── userId (external platform user ID)
├── username
├── message
├── isModerator
└── timestamp
```

---

## 5. Component Communication Flow

```
                     ┌─────────────────────────┐
                     │   Zustand Store         │
                     │  (Global State)         │
                     └──────────────┬──────────┘
                                    ↑ (reads/writes)
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
         ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐
         │  StudioLayout    │  │ SceneEditor  │  │ PlatformSelect │
         │  (Main Container)│  │  (Konva.js)  │  │  (Destination) │
         └──────────────────┘  └──────────────┘  └────────────────┘
                ↑                     ↓                  ↓
         ┌──────┴──────┬──────────┬───┴────┬────────────┴────────┐
         ↓             ↓          ↓        ↓                      ↓
      Preview    SourceMgr   AudioMixer Effects             EncodingSettings
      (real-     (add/        (volume   (blur,
       time)      remove)      levels)   transitions)
               
                    ↓ (all trigger API calls)
                    
              ┌──────────────────────┐
              │  API Routes Handler  │
              │ (Next.js /api/...)   │
              └──────────┬───────────┘
                         ↓
              ┌──────────────────────┐
              │  MongoDB Operations  │
              │  (CRUD)              │
              └──────────────────────┘
```

---

## 6. Encoding & Streaming Pipeline (Phase 3)

```
Browser (React Client)
    ↓
1. Canvas Composition
   - Konva.js mixes screen + webcam + overlays
   - canvas.captureStream(60fps) → MediaStream
    ↓
2. WebRTC to Encoding Service
   - Browser → WebRTC Offer
   - Encoding Service → WebRTC Answer
   - Real-time media stream transmitted
    ↓
3. FFmpeg Encoding Service
   - Receives WebRTC MediaStream
   - Decodes incoming stream
   - Applies encoding:
     * Codec: H.264 (libx264)
     * Resolution: 1920x1080 @ 60fps
     * Bitrate: 6000-12000 kbps
     * Preset: "veryfast" (speed optimized)
    ↓
4. RTMP Output to Nginx
   - Multiple output formats:
     * RTMP → Nginx RTMP Server
     * HLS → HTTP Live Streaming (CDN)
     * DASH → Dynamic Adaptive Streaming
    ↓
5. Multi-Platform Distribution
   - RTMP Push:
     * YouTube RTMP key → "rtmp://a.rtmp.youtube.com/..."
     * Twitch RTMP key → "rtmp://live-[region].twitch.tv/live/..."
   - API Push:
     * Facebook Graph API (HTTP POST)
   - Custom:
     * User-provided RTMP endpoint
    ↓
6. Live Viewers
   - YouTube: Viewers connect via youtube.com
   - Twitch: Viewers connect via twitch.tv
   - Facebook: Viewers connect via facebook.com
   - Custom Server: Viewers via your infrastructure
```

---

## Summary

This architecture enables:
- ✅ Secure user authentication with JWT
- ✅ Multi-scene setup with real-time preview
- ✅ Simultaneous streaming to multiple platforms
- ✅ Professional encoding quality (1080p 60fps)
- ✅ Scalable backend with job queue
- ✅ Real-time analytics and chat integration
- ✅ Cloud-based (no local installation required)

Next phases will add encoding infrastructure, effects, and auto-scaling capabilities.
