import axios from 'axios';

let currentSessionId = sessionStorage.getItem('app_session_id') || null;
let heartbeatInterval = null;

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Sends a session heartbeat to backend to track active session duration.
 */
export async function sendHeartbeat() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await api.post('/telemetry/heartbeat', { sessionId: currentSessionId });
    if (res.data?.session?.sessionId) {
      currentSessionId = res.data.session.sessionId;
      sessionStorage.setItem('app_session_id', currentSessionId);
    }
  } catch (error) {
    console.warn('Telemetry heartbeat warning:', error.message);
  }
}

/**
 * Tracks a meaningful user application event (e.g., YouTube search, Trends opened).
 */
export async function trackAppEvent({ eventType, feature, platform, metadata = {} }) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    await api.post('/telemetry/event', {
      sessionId: currentSessionId,
      eventType,
      feature,
      platform,
      metadata
    });
  } catch (error) {
    console.warn('Telemetry event track warning:', error.message);
  }
}

/**
 * Starts automatic background heartbeat ping every 2 minutes while user is active.
 */
export function initTelemetryHeartbeat() {
  if (heartbeatInterval) return;

  // Initial heartbeat
  sendHeartbeat();

  // Heartbeat every 2 minutes (120,000 ms)
  heartbeatInterval = setInterval(() => {
    sendHeartbeat();
  }, 120000);
}

/**
 * Stops telemetry heartbeat on logout.
 */
export function stopTelemetryHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  currentSessionId = null;
  sessionStorage.removeItem('app_session_id');
}
