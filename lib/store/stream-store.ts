import { create } from 'zustand'

export interface User {
  id: string
  email: string
  username: string
  displayName: string
}

export interface Integrations {
  youtube?: {
    connected: boolean
    channelId?: string
    channelName?: string
  }
  twitch?: {
    connected: boolean
    channelId?: string
    username?: string
  }
  facebook?: {
    connected: boolean
    pageId?: string
    pageName?: string
  }
  customRtmp?: Array<{
    name: string
    url: string
  }>
}

export interface Scene {
  id: string
  name: string
  sources: Array<{
    id: string
    type: 'screen' | 'webcam' | 'image' | 'browser'
    position: { x: number; y: number; width: number; height: number }
    settings?: Record<string, any>
  }>
  isActive: boolean
}

export interface StreamState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  integrations: Integrations
  platformIntegrations: Array<{
    _id: string
    platform: 'youtube' | 'twitch' | 'facebook' | 'custom'
    isEnabled: boolean
    channelName?: string
    channelId?: string
    pageId?: string
  }>
  currentStreamSession: {
    id: string
    title: string
    description: string
    status: 'idle' | 'live' | 'ended' | 'recording'
    streamKey: string
  } | null
  scenes: Scene[]
  activeSceneId: string | null
  selectedSourceId: string | null
  screenStream: MediaStream | null
  webcamStream: MediaStream | null
  microphoneStream: MediaStream | null
  screenShareActive: boolean
  webcamActive: boolean
  encoding: {
    bitrate: number
    fps: number
    resolution: string
    codec: 'h264' | 'vp9'
  }
  destinations: {
    youtube: boolean
    twitch: boolean
    facebook: boolean
    customRtmp: string[]
  }
  isLive: boolean
  viewerCount: number
  error: string | null
  loading: boolean
  audioTracks: Array<{
    id: string
    name: string
    volume: number
    isMuted: boolean
  }>
  chatMessages: Array<{
    id: string
    platform: string
    username: string
    message: string
    timestamp: Date
  }>
  chatEnabled: boolean
  audioEnabled: boolean
  encodingActive: boolean
  encodingProfile: '1080p60' | '720p30' | '480p30'
  encodingMetrics: {
    fps: number
    bitrate: number
    framesDropped: number
    memory: number
    cpu: number
  } | null
  effects: Array<{
    id: string
    name: string
    intensity: number
    enabled: boolean
  }>
  filters: Array<{
    id: string
    type: string
    value: number
    enabled: boolean
  }>
  recordingActive: boolean
  recordingQuality: '1080p' | '720p' | '480p'
  recordingDuration: number
}

interface StreamStore extends StreamState {
  // Auth actions
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  logout: () => void

  // Integration actions
  setIntegrations: (integrations: Integrations) => void
  addIntegration: (platform: keyof Integrations, data: any) => void
  setPlatformIntegrations: (integrations: StreamState['platformIntegrations']) => void
  addPlatformIntegration: (integration: StreamState['platformIntegrations'][0]) => void
  removePlatformIntegration: (integrationId: string) => void

  // Stream session actions
  setCurrentStreamSession: (session: StreamState['currentStreamSession']) => void
  createNewStreamSession: (title: string, description: string) => void

  // Scene actions
  addScene: (scene: Scene) => void
  removeScene: (sceneId: string) => void
  setActiveScene: (sceneId: string) => void
  createScene: (name: string) => void
  deleteScene: (sceneId: string) => void
  duplicateScene: (sceneId: string) => void
  addSourceToScene: (ceneId: string, sourceType: 'screen' | 'webcam' | 'image' | 'browser') => void
  removeSourceFromScene: (sceneId: string, sourceId: string) => void
  updateSourcePosition: (
    sceneId: string,
    sourceId: string,
    position: { x: number; y: number; width: number; height: number }
  ) => void

  // Media stream actions
  setScreenStream: (stream: MediaStream | null) => void
  setWebcamStream: (stream: MediaStream | null) => void
  setMicrophoneStream: (stream: MediaStream | null) => void
  setScreenShareActive: (active: boolean) => void
  setWebcamActive: (active: boolean) => void

  // Encoding actions
  setEncoding: (encoding: StreamState['encoding']) => void
  updateStreamSettings: (settings: Partial<StreamState['encoding']>) => void

  // Broadcast actions
  setDestinations: (destinations: StreamState['destinations']) => void
  setIsLive: (live: boolean) => void
  setViewerCount: (count: number) => void
  toggleStream: () => void
  isStreaming: boolean

  // UI actions
  setSelectedSource: (sourceId: string | null) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void

  // Audio actions
  addAudioTrack: (track: StreamState['audioTracks'][0]) => void
  removeAudioTrack: (trackId: string) => void
  updateAudioTrack: (trackId: string, updates: Partial<StreamState['audioTracks'][0]>) => void
  setAudioEnabled: (enabled: boolean) => void

  // Chat actions
  addChatMessage: (message: StreamState['chatMessages'][0]) => void
  setChatMessages: (messages: StreamState['chatMessages']) => void
  setChatEnabled: (enabled: boolean) => void
  clearChat: () => void

  // Encoding actions
  setEncodingActive: (active: boolean) => void
  setEncodingProfile: (profile: StreamState['encodingProfile']) => void
  setEncodingMetrics: (metrics: StreamState['encodingMetrics']) => void

  // Effects actions
  addEffect: (effect: StreamState['effects'][0]) => void
  removeEffect: (effectId: string) => void
  updateEffect: (effectId: string, updates: Partial<StreamState['effects'][0]>) => void
  toggleEffect: (effectId: string) => void

  // Filters actions
  addFilter: (filter: StreamState['filters'][0]) => void
  removeFilter: (filterId: string) => void
  updateFilter: (filterId: string, value: number) => void
  toggleFilter: (filterId: string) => void

  // Recording actions
  setRecordingActive: (active: boolean) => void
  setRecordingQuality: (quality: StreamState['recordingQuality']) => void
  incrementRecordingDuration: () => void
  resetRecordingDuration: () => void
  streamSettings: StreamState['encoding']
  activeScene: string | null
}

const initialState: StreamState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  integrations: {},
  platformIntegrations: [],
  currentStreamSession: null,
  scenes: [],
  activeSceneId: null,
  selectedSourceId: null,
  screenStream: null,
  webcamStream: null,
  microphoneStream: null,
  screenShareActive: false,
  webcamActive: false,
  encoding: {
    bitrate: 6000,
    fps: 60,
    resolution: '1080p',
    codec: 'h264',
  },
  destinations: {
    youtube: false,
    twitch: false,
    facebook: false,
    customRtmp: [],
  },
  isLive: false,
  viewerCount: 0,
  error: null,
  loading: false,
  audioTracks: [],
  chatMessages: [],
  chatEnabled: false,
  audioEnabled: true,
  encodingActive: false,
  encodingProfile: '1080p60',
  encodingMetrics: null,
  effects: [],
  filters: [],
  recordingActive: false,
  recordingQuality: '720p',
  recordingDuration: 0,
}

export const useStreamStore = create<StreamStore>((set) => ({
  ...initialState,

  // Auth actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () =>
    set({
      ...initialState,
      isAuthenticated: false,
    }),

  // Integration actions
  setIntegrations: (integrations) => set({ integrations }),
  addIntegration: (platform, data) =>
    set((state) => ({
      integrations: {
        ...state.integrations,
        [platform]: { connected: true, ...data },
      },
    })),

  // Stream session actions
  setCurrentStreamSession: (session) => set({ currentStreamSession: session }),
  createNewStreamSession: (title, description) =>
    set((state) => ({
      currentStreamSession: {
        id: Date.now().toString(),
        title,
        description,
        status: 'idle',
        streamKey: Math.random().toString(36).substring(2, 15),
      },
    })),

  // Scene actions
  addScene: (scene) =>
    set((state) => ({
      scenes: [...state.scenes, scene],
      activeSceneId: state.activeSceneId || scene.id,
    })),
  removeScene: (sceneId) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== sceneId),
      activeSceneId: state.activeSceneId === sceneId ? null : state.activeSceneId,
    })),
  setActiveScene: (sceneId) => set({ activeSceneId: sceneId }),
  addSourceToScene: (sceneId, source) =>
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, sources: [...scene.sources, source] } : scene
      ),
    })),
  removeSourceFromScene: (sceneId, sourceId) =>
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId
          ? { ...scene, sources: scene.sources.filter((s) => s.id !== sourceId) }
          : scene
      ),
    })),
  updateSourcePosition: (sceneId, sourceId, position) =>
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              sources: scene.sources.map((s) =>
                s.id === sourceId ? { ...s, position } : s
              ),
            }
          : scene
      ),
    })),

  // Media stream actions
  setScreenStream: (stream) => set({ screenStream: stream }),
  setWebcamStream: (stream) => set({ webcamStream: stream }),
  setMicrophoneStream: (stream) => set({ microphoneStream: stream }),
  setScreenShareActive: (active) => set({ screenShareActive: active }),
  setWebcamActive: (active) => set({ webcamActive: active }),

  // Encoding actions
  setEncoding: (encoding) => set({ encoding }),

  // Broadcast actions
  setDestinations: (destinations) => set({ destinations }),
  setIsLive: (live) => set({ isLive: live }),
  setViewerCount: (count) => set({ viewerCount: count }),

  // UI actions
  setSelectedSource: (sourceId) => set({ selectedSourceId: sourceId }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  reset: () => set(initialState),

  // Helper computed properties
  isStreaming: false,
  streamSettings: { bitrate: 6000, fps: 60, resolution: '1920x1080', codec: 'h264' },
  activeScene: null,

  // Scene convenience methods
  createScene: (name: string) =>
    set((state) => {
      const newScene: Scene = {
        id: Date.now().toString(),
        name,
        sources: [],
        isActive: false,
      }
      return {
        scenes: [...state.scenes, newScene],
        activeSceneId: state.activeSceneId || newScene.id,
      }
    }),

  deleteScene: (sceneId: string) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== sceneId),
      activeSceneId: state.activeSceneId === sceneId ? null : state.activeSceneId,
    })),

  duplicateScene: (sceneId: string) =>
    set((state) => {
      const sceneToClone = state.scenes.find((s) => s.id === sceneId)
      if (!sceneToClone) return state

      const newScene: Scene = {
        ...sceneToClone,
        id: Date.now().toString(),
        name: `${sceneToClone.name} (Copy)`,
      }

      return {
        scenes: [...state.scenes, newScene],
      }
    }),

  addSourceToScene: (sceneId: string, sourceType: 'screen' | 'webcam' | 'image' | 'browser') =>
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              sources: [
                ...scene.sources,
                {
                  id: Date.now().toString(),
                  type: sourceType,
                  position: { x: 0, y: 0, width: 1920, height: 1080 },
                  settings: {},
                },
              ],
            }
          : scene
      ),
    })),

  updateStreamSettings: (settings: Partial<StreamState['encoding']>) =>
    set((state) => ({
      encoding: { ...state.encoding, ...settings },
    })),

  toggleStream: () =>
    set((state) => ({
      isLive: !state.isLive,
    })),

  // Platform integration actions
  setPlatformIntegrations: (integrations) => set({ platformIntegrations: integrations }),
  addPlatformIntegration: (integration) =>
    set((state) => ({
      platformIntegrations: [
        ...state.platformIntegrations.filter((i) => i._id !== integration._id),
        integration,
      ],
    })),
  removePlatformIntegration: (integrationId) =>
    set((state) => ({
      platformIntegrations: state.platformIntegrations.filter((i) => i._id !== integrationId),
    })),

  // Audio actions
  addAudioTrack: (track) =>
    set((state) => ({
      audioTracks: [...state.audioTracks, track],
    })),
  removeAudioTrack: (trackId) =>
    set((state) => ({
      audioTracks: state.audioTracks.filter((t) => t.id !== trackId),
    })),
  updateAudioTrack: (trackId, updates) =>
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId ? { ...t, ...updates } : t
      ),
    })),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),

  // Chat actions
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-99), message],
    })),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setChatEnabled: (enabled) => set({ chatEnabled: enabled }),
  clearChat: () => set({ chatMessages: [] }),

  // Encoding actions
  setEncodingActive: (active) => set({ encodingActive: active }),
  setEncodingProfile: (profile) => set({ encodingProfile: profile }),
  setEncodingMetrics: (metrics) => set({ encodingMetrics: metrics }),

  // Effects actions
  addEffect: (effect) =>
    set((state) => ({
      effects: [...state.effects, effect],
    })),
  removeEffect: (effectId) =>
    set((state) => ({
      effects: state.effects.filter((e) => e.id !== effectId),
    })),
  updateEffect: (effectId, updates) =>
    set((state) => ({
      effects: state.effects.map((e) =>
        e.id === effectId ? { ...e, ...updates } : e
      ),
    })),
  toggleEffect: (effectId) =>
    set((state) => ({
      effects: state.effects.map((e) =>
        e.id === effectId ? { ...e, enabled: !e.enabled } : e
      ),
    })),

  // Filters actions
  addFilter: (filter) =>
    set((state) => ({
      filters: [...state.filters, filter],
    })),
  removeFilter: (filterId) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.id !== filterId),
    })),
  updateFilter: (filterId, value) =>
    set((state) => ({
      filters: state.filters.map((f) =>
        f.id === filterId ? { ...f, value } : f
      ),
    })),
  toggleFilter: (filterId) =>
    set((state) => ({
      filters: state.filters.map((f) =>
        f.id === filterId ? { ...f, enabled: !f.enabled } : f
      ),
    })),

  // Recording actions
  setRecordingActive: (active) => set({ recordingActive: active }),
  setRecordingQuality: (quality) => set({ recordingQuality: quality }),
  incrementRecordingDuration: () =>
    set((state) => ({
      recordingDuration: state.recordingDuration + 1,
    })),
  resetRecordingDuration: () => set({ recordingDuration: 0 }),
}))

// Create computed selectors for easy access
export const useStreamingStatus = () =>
  useStreamStore((state) => ({
    isStreaming: state.isLive,
    activeScene: state.activeSceneId,
    scenes: state.scenes,
    streamSettings: state.encoding,
  }))

export const usePlatformIntegrations = () =>
  useStreamStore((state) => ({
    integrations: state.platformIntegrations,
    addPlatformIntegration: state.addPlatformIntegration,
    removePlatformIntegration: state.removePlatformIntegration,
  }))

export const useAudioChat = () =>
  useStreamStore((state) => ({
    audioTracks: state.audioTracks,
    chatMessages: state.chatMessages,
    audioEnabled: state.audioEnabled,
    chatEnabled: state.chatEnabled,
  }))

export const useEncoding = () =>
  useStreamStore((state) => ({
    encodingActive: state.encodingActive,
    encodingProfile: state.encodingProfile,
    encodingMetrics: state.encodingMetrics,
    setEncodingActive: state.setEncodingActive,
    setEncodingProfile: state.setEncodingProfile,
    setEncodingMetrics: state.setEncodingMetrics,
  }))

export const useEffectsFilters = () =>
  useStreamStore((state) => ({
    effects: state.effects,
    filters: state.filters,
    addEffect: state.addEffect,
    removeEffect: state.removeEffect,
    updateEffect: state.updateEffect,
    toggleEffect: state.toggleEffect,
    addFilter: state.addFilter,
    removeFilter: state.removeFilter,
    updateFilter: state.updateFilter,
    toggleFilter: state.toggleFilter,
  }))

export const useRecording = () =>
  useStreamStore((state) => ({
    recordingActive: state.recordingActive,
    recordingQuality: state.recordingQuality,
    recordingDuration: state.recordingDuration,
    setRecordingActive: state.setRecordingActive,
    setRecordingQuality: state.setRecordingQuality,
    incrementRecordingDuration: state.incrementRecordingDuration,
    resetRecordingDuration: state.resetRecordingDuration,
  }))
