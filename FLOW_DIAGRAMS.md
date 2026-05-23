# CloudStream Studio - Complete Flow Diagrams & Visual Guides

## 1. User Journey - Complete Flow

```
FIRST-TIME USER JOURNEY
════════════════════════════════════════════════════════════════════════

[START] → User opens http://localhost:3000
           ↓
           [Is Authenticated?] ←─ No ─→ Redirect to /login
           ↓ Yes
           [Dashboard]

NEW USER SIGNUP FLOW:
─────────────────────────────────────────────────────────────────────────

1. User clicks "Sign Up" on login page
   ↓
2. Browser: /signup page loads
   ├─ Renders signup form (email, username, password, confirm password)
   ├─ Form validation on submit:
   │  ├─ Email valid? ✓
   │  ├─ Username provided? ✓
   │  ├─ Password 8+ chars? ✓
   │  └─ Passwords match? ✓
   ↓
3. POST /api/auth/signup
   ├─ Email exists? No ✓
   ├─ Username exists? No ✓
   ├─ Hash password (bcryptjs 10 rounds)
   ├─ Create User document in MongoDB
   ├─ Generate JWT tokens:
   │  ├─ accessToken (15m expiry) → response
   │  └─ refreshToken (7d expiry) → HTTP-only cookie
   └─ Return success response
   ↓
4. Frontend (React/Zustand):
   ├─ Store accessToken in memory
   ├─ Store refreshToken in browser cookie
   ├─ Update Zustand: setUser() + setAccessToken()
   ├─ Show toast: "Account created!"
   └─ Redirect to /dashboard
   ↓
5. [Authenticated User Session Begins]


RETURNING USER LOGIN FLOW:
─────────────────────────────────────────────────────────────────────────

1. User opens app → Redirected to /login
   ↓
2. Enters email + password
   ↓
3. POST /api/auth/login
   ├─ Find user by email in MongoDB
   ├─ Verify password (bcryptjs.compare)
   ├─ Generate tokens (same as signup)
   └─ Return user data + accessToken
   ↓
4. Frontend:
   ├─ Store tokens (accessToken in memory, refreshToken in cookie)
   ├─ Update Zustand store
   └─ Redirect to /dashboard
   ↓
5. [User Logged In - Ready to Stream]
```

---

## 2. Component Hierarchy & Data Flow

```
Root App Tree
════════════════════════════════════════════════════════════════════════

<RootLayout>
    ↓
    <Body>
        ↓
        ┌────────────────────────────────────────┐
        │  Route: /signup or /login              │
        └────────────────────────────────────────┘
            ↓
            ├─ <SignupPage> / <LoginPage>
            │   ├─ State: email, password, loading
            │   ├─ Call: /api/auth/signup or /api/auth/login
            │   └─ Zustand: setUser() → sets isAuthenticated = true
            │
            └─ Redirect to /dashboard
        
        ┌────────────────────────────────────────┐
        │  Route: /dashboard (Coming)            │
        └────────────────────────────────────────┘
            ↓
            <DashboardLayout>
                ↓
                ├─ <Sidebar>
                │   ├─ List scenes
                │   ├─ Add/remove scene buttons
                │   └─ Source manager
                │
                ├─ <MainCanvas>
                │   ├─ <SceneEditor> (Konva.js)
                │   │   └─ Reads from Zustand: scenes, activeScene
                │   │
                │   └─ <Preview>
                │       └─ Real-time preview rendering
                │
                └─ <RightPanel>
                    ├─ <EncodingSettings>
                    │   └─ Bitrate, FPS, Resolution
                    │
                    ├─ <AudioMixer>
                    │   ├─ Master volume
                    │   └─ Per-source volume
                    │
                    ├─ <PlatformSelector>
                    │   ├─ YouTube toggle
                    │   ├─ Twitch toggle
                    │   └─ Facebook toggle
                    │
                    └─ <GoLiveButton>
                        └─ POST /api/streams/[id]/start


Data Flow Through Zustand:
────────────────────────────────────────────────────────────────────────

useStreamStore() (Global State)
    ↓
    Contains:
    ├─ user: { id, email, username, displayName }
    ├─ accessToken: string
    ├─ isAuthenticated: boolean
    ├─ scenes: [ { id, name, sources[], isActive } ]
    ├─ activeSceneId: string
    ├─ selectedSourceId: string
    ├─ screenStream: MediaStream | null
    ├─ webcamStream: MediaStream | null
    ├─ encoding: { bitrate, fps, resolution, codec }
    ├─ destinations: { youtube, twitch, facebook, customRtmp }
    ├─ isLive: boolean
    ├─ viewerCount: number
    ├─ error: string | null
    └─ loading: boolean
    
    ↓ Consumed by:
    
    ├─ <SceneEditor>
        └─ useStreamStore() → scenes, activeScene, selectedSource
        
    ├─ <Preview>
        └─ useStreamStore() → screenStream, webcamStream, activeScene
        
    ├─ <EncodingSettings>
        └─ useStreamStore() → encoding (setEncoding)
        
    ├─ <PlatformSelector>
        └─ useStreamStore() → destinations (setDestinations)
        
    └─ <GoLiveButton>
        └─ useStreamStore() → isLive (setIsLive)
```

---

## 3. Database Operations Flow

```
Data Persistence Pipeline
════════════════════════════════════════════════════════════════════════

CREATE USER (Signup)
─────────────────────────────────────────────────────────────────────────

React Component                Backend Handler             MongoDB
────────────────────────────────────────────────────────────────────────

User fills form
    ↓
POST /api/auth/signup ─────→  Extract: email, username, password
(with credentials)             ↓
                               Validate input
                               ├─ Email not duplicate
                               ├─ Username not duplicate
                               └─ Password 8+ chars
                               ↓
                               Hash password:
                               bcryptjs.hash(password, 10)
                               ↓
                               Create document:
                               {
                                 email: "user@example.com",
                                 username: "newuser",
                                 password: "$2a$10$...",
                                 profile: { displayName: "newuser" },
                                 integrations: {},
                                 subscription: { plan: "free" }
                               }
                               ↓
                               db.users.insert() ────────→ Inserted
                                                           ↓
                                                           MongoDB
                                                           creates _id
                                                           (ObjectId)
                               ↓
                               Generate JWT tokens
                               ↓
                               Return: user, accessToken ←─ Client receives
                               ↓
Store tokens in                Update Zustand
memory & cookies                setUser() + setAccessToken()
    ↓
Redirect to /dashboard


READ USER (Login)
─────────────────────────────────────────────────────────────────────────

POST /api/auth/login
    ↓
db.users.findOne({ email }) ────→ MongoDB searches users collection
                                  ↓
                                  Finds matching document
                                  or returns null
    ↓ Document found
Check password match
bcryptjs.compare(inputPassword, storedHash)
    ↓
Generate tokens
    ↓
Return user + accessToken


UPDATE USER (Add Integration)
─────────────────────────────────────────────────────────────────────────

User connects YouTube account
    ↓
Zustand: addIntegration('youtube', { channelId, ... })
    ↓
PUT /api/integrations/youtube/callback
    ↓
db.users.updateOne(
  { _id: userId },
  { 
    $set: {
      'integrations.youtube': {
        accessToken: 'new_token',
        refreshToken: 'new_refresh',
        channelId: 'channel_id'
      }
    }
  }
) ────→ MongoDB updates document in-place
    ↓
Frontend updates Zustand
    ↓
UI reflects new integration


CREATE STREAM SESSION
─────────────────────────────────────────────────────────────────────────

User clicks "New Stream"
    ↓
Dialog: Enter title, description
    ↓
POST /api/streams/create
{
  title: "My First Stream",
  description: "Gaming session"
}
    ↓
Backend:
├─ Verify user is authenticated (JWT check)
├─ Generate unique streamKey (UUID)
├─ Create StreamSession:
│  {
│    userId: user._id,
│    title: "My First Stream",
│    status: "idle",
│    streamKey: "abc123-xyz789",
│    scenes: [],
│    destinations: {},
│    encoding: {
│      bitrate: 6000,
│      fps: 60,
│      resolution: "1080p",
│      codec: "h264"
│    }
│  }
└─ db.streamSessions.insert()
    ↓
Return stream session ID
    ↓
Zustand: setCurrentStreamSession()
    ↓
Display in UI: "Session Ready"
```

---

## 4. Authentication State Lifecycle

```
AUTHENTICATION STATE TRANSITIONS
════════════════════════════════════════════════════════════════════════

[UNAUTHENTICATED]
├─ user: null
├─ accessToken: null
├─ isAuthenticated: false
└─ All protected routes redirect to /login
    ↓
    User submits signup/login
    ↓
[LOADING]
├─ loading: true
└─ Form disabled, show spinner
    ↓
    API response received
    ↓
[AUTHENTICATED]
├─ user: { id, email, username, displayName }
├─ accessToken: "eyJhbGciOiJIUzI1NiIs..."
├─ isAuthenticated: true
├─ refreshToken: stored in HTTP-only cookie
└─ Redirect to /dashboard
    ↓
User browses dashboard, creates stream
    ├─ accessToken used for all API requests
    │  Header: "Authorization: Bearer <token>"
    │
    └─ If API returns 401 Unauthorized:
        ↓ (Token expired)
        [REFRESHING TOKEN]
        ├─ POST /api/auth/refresh
        ├─ refreshToken sent via cookie
        └─ New accessToken received
        ↓
        [AUTHENTICATED] (token refreshed)
        └─ Retry original request
    
    ↓
    User clicks "Logout"
    ↓
    [LOGGING OUT]
    ├─ Clear accessToken from memory
    ├─ Clear refreshToken from cookie
    └─ reset() store
    ↓
[UNAUTHENTICATED] (back to start)
```

---

## 5. API Request-Response Cycle

```
SECURED API REQUEST FLOW
════════════════════════════════════════════════════════════════════════

1. Client prepares request
   ────────────────────────────────────────────────
   
   const response = await fetch('/api/streams/create', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${accessToken}`  ← Include token
     },
     body: JSON.stringify({ title, description })
   })


2. Request travels to Backend
   ────────────────────────────────────────────────
   
   Backend receives request
   ├─ Extract Authorization header
   ├─ Remove "Bearer " prefix
   └─ Token: "eyJhbGciOiJIUzI1NiIs..."


3. Backend authenticates
   ────────────────────────────────────────────────
   
   try {
     const payload = jwtVerify(token, JWT_SECRET)
     // payload = { userId, email, username }
     req.user = payload
     next()
   } catch (err) {
     return res.status(401).json({ error: 'Unauthorized' })
   }


4. Request handler executes
   ────────────────────────────────────────────────
   
   export async function POST(request) {
     // Token verified at this point
     const user = req.user  // { userId, email, username }
     const { title, description } = await request.json()
     
     // Database operation
     const streamSession = await StreamSession.create({
       userId: user.userId,
       title,
       description,
       ...
     })
     
     return NextResponse.json(streamSession)
   }


5. Response sent to client
   ────────────────────────────────────────────────
   
   {
     "_id": "507f1f77bcf86cd799439011",
     "userId": "507f...",
     "title": "My Stream",
     "status": "idle",
     "streamKey": "abc123-xyz789",
     ...
   }


6. Client processes response
   ────────────────────────────────────────────────
   
   if (response.ok) {
     const data = await response.json()
     setCurrentStreamSession(data)
     toast.success('Stream created!')
   } else if (response.status === 401) {
     // Token expired, refresh and retry
     refreshToken()
   } else {
     toast.error('Error creating stream')
   }


FAILURE SCENARIOS:
───────────────────────────────────────────────────

Scenario 1: No Authorization Header
└─ Backend: 401 Unauthorized
   Client: Show login page

Scenario 2: Invalid Token
└─ Backend: 401 Unauthorized
   Client: Attempt refresh or logout

Scenario 3: Expired Token
└─ Backend: 401 Unauthorized
   Client: POST /api/auth/refresh
         ├─ Browser auto-sends refreshToken cookie
         ├─ Backend verifies refreshToken
         ├─ Issues new accessToken
         └─ Retry original request

Scenario 4: Invalid JWT Signature
└─ Backend: 401 Unauthorized
   Client: Force logout (token corrupted)

Scenario 5: Database Error
└─ Backend: 500 Internal Server Error
   Client: Retry or contact support
```

---

## 6. Real-Time Data Flow (Coming in Phase 2)

```
SOCKET.IO REAL-TIME EVENTS
════════════════════════════════════════════════════════════════════════

Connection Established:
──────────────────────────────────────────────────────────────────────────

Client (Browser)          WebSocket          Server
─────────────────────────────────────────────────────────────────

socket.on('connect')  ← Connected
    ↓
socket.emit('join:stream', { streamId })  ──→  
    ↓                                        socket.join('stream:' + streamId)
                                            broadcast() to all in room


Streaming Begins:
──────────────────────────────────────────────────────────────────────────

Server                          Event                    Clients
────────────────────────────────────────────────────────────────────

Update viewer count     →  stream:viewer-count  →  { count: 1234 }
New chat message        →  chat:message         →  { user, text, platform }
Encoding stats update   →  encoding:stats       →  { bitrate, fps, dropped }
Scene switch event      →  scene:changed        →  { sceneId: "scene2" }
Error notification      →  stream:error         →  { error: "..." }


Client-to-Server Events:
──────────────────────────────────────────────────────────────────────────

Client                        Event               Server Handles
────────────────────────────────────────────────────────────────────

socket.emit('scene:switch', 
  { sceneId: 'scene2' })  →  Change active scene
                           →  Update all viewers
                           →  Log analytics

socket.emit('volume:update',
  { sourceId, volume: 0.8 }) → Update audio levels
                            → Notify encoding service

socket.emit('chat:moderate',
  { msgId, action: 'delete' }) → Delete message
                              → Notify all clients
                              → Log moderation


Real-Time Loop (During Live Stream):
──────────────────────────────────────────────────────────────────────────

[Every 100ms]
├─ Encoding Service → Server: bitrate, fps, dropped frames
├─ Server → Clients: encoding:stats event
└─ Update UI: "Bitrate: 5998 kbps"

[Every 500ms]
├─ YouTube API → Server: current viewer count
├─ Twitch API → Server: current viewer count
├─ Server → Clients: stream:viewer-count event
└─ Update UI: "Viewers: 1,523"

[On each message]
├─ YouTube → Server: chat message
├─ Twitch → Server: chat message
├─ Facebook → Server: chat comment
├─ Server → Clients: chat:message event
└─ Display in chat panel


Connection Loss & Reconnection:
──────────────────────────────────────────────────────────────────────────

Client loses connection
    ↓
socket.on('disconnect')
    ↓
Show: "Connection lost"
    ↓
Auto-reconnect (10s)
    ↓
socket.on('reconnect')
    ↓
Re-join stream room
    ↓
Request missed events from server
    ↓
Resume normal operations
```

---

## 7. Complete Request Timeline Example

```
FULL EXAMPLE: CREATE AND START STREAM
════════════════════════════════════════════════════════════════════════

T+0ms: User clicks "Create Stream"
────────────────────────────────────────────────────────────────────────
React Component → State Update
├─ showCreateDialog = true
└─ Show modal with form

T+100ms: User enters title & clicks Create
────────────────────────────────────────────────────────────────────────
POST /api/streams/create
Headers: {
  Authorization: Bearer <accessToken>,
  Content-Type: application/json
}
Body: { title: "Gaming Session" }

T+150ms: Backend validates request
────────────────────────────────────────────────────────────────────────
├─ Verify JWT token
├─ Extract userId from token
├─ Validate input data
└─ Check user subscription plan

T+200ms: Backend creates StreamSession
────────────────────────────────────────────────────────────────────────
MongoDB operation:
db.streamSessions.insertOne({
  userId: ObjectId("507f..."),
  title: "Gaming Session",
  status: "idle",
  streamKey: "unique-key-123",
  scenes: [],
  encoding: { bitrate: 6000, ... },
  timestamps...
})
Returns: _id = ObjectId("507g...")

T+250ms: Response sent to client
────────────────────────────────────────────────────────────────────────
{
  _id: "507g...",
  title: "Gaming Session",
  streamKey: "unique-key-123",
  status: "idle"
}

T+300ms: Client updates state
────────────────────────────────────────────────────────────────────────
Zustand:
setCurrentStreamSession({
  id: "507g...",
  title: "Gaming Session",
  streamKey: "unique-key-123",
  status: "idle"
})

T+350ms: UI updates
────────────────────────────────────────────────────────────────────────
├─ Close create dialog
├─ Show dashboard with new stream
├─ Enable "Edit Scenes" button
└─ Show toast: "Stream created!"


[User now adds scenes and sources]
[Configuration complete, user clicks "Go Live"]


T+500ms: User clicks "Go Live"
────────────────────────────────────────────────────────────────────────
POST /api/streams/507g.../start
Headers: { Authorization: Bearer <token> }
Body: {
  activeScene: "scene1",
  destinations: { youtube: true, twitch: false }
}

T+550ms: Backend initiates broadcast
────────────────────────────────────────────────────────────────────────

For YouTube:
├─ Fetch stored YouTube refreshToken from DB
├─ Refresh access token (if needed)
├─ Call: youtube.liveBroadcasts.insert({
│   title: "Gaming Session",
│   description: ""
│ })
└─ Get: broadcastId, rtmpIngestionUrl

Update StreamSession:
├─ status: "live"
├─ destinations.youtube.broadcastId = "..."
├─ startTime: new Date()
└─ Save to MongoDB

T+600ms: Response sent to client
────────────────────────────────────────────────────────────────────────
{
  status: "live",
  destinations: {
    youtube: {
      broadcastId: "xyz...",
      status: "live"
    }
  }
}

T+650ms: Client updates state
────────────────────────────────────────────────────────────────────────
Zustand:
├─ setIsLive(true)
├─ setStreamStatus("live")
└─ updateDestinations(...)

T+700ms: UI reflects live status
────────────────────────────────────────────────────────────────────────
├─ "Go Live" button → "Stop Stream"
├─ Show live indicator
├─ Start polling viewer count
├─ Connect to Socket.io for real-time updates
├─ Display preview with encoding stats
└─ Show live chat

[STREAM IS NOW LIVE FOR 2+ HOURS]

T+7200000ms (2+ hours): User clicks "Stop Stream"
────────────────────────────────────────────────────────────────────────
POST /api/streams/507g.../stop
Headers: { Authorization: Bearer <token> }

Backend:
├─ End YouTube broadcast
├─ Save stream statistics
├─ Update status: "ended"
├─ endTime: new Date()
└─ Save to MongoDB

Response: { status: "ended", stats: { ... } }

Client:
├─ setIsLive(false)
├─ Disconnect from Socket.io
├─ Show summary page
└─ Display statistics

USER STREAM COMPLETE ✓
```

---

This comprehensive guide covers every possible flow in the CloudStream Studio system. Refer to specific sections when implementing features or debugging issues.

