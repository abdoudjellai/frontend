import { api } from './api'

/**
 * Business Owner AI Assistant (backend: /api/v1/owner-assistant).
 * Always calls the real backend — there is no mock mode, because this assistant must never show
 * invented business figures.
 */

// One answer can take several model calls (data retrieval + analysis); the default 15 s is too short.
const CHAT_TIMEOUT_MS = 120_000

const unwrap = (response) => response.data.data

export const assistantApi = {
  /** Send a message. Without conversationId a new conversation is created for `storeId`. */
  chat: ({ message, conversationId, storeId }) =>
    api
      .post(
        '/owner-assistant/chat',
        { message, ...(conversationId ? { conversationId } : { storeId }) },
        { timeout: CHAT_TIMEOUT_MS },
      )
      .then(unwrap),

  conversations: (storeId) =>
    api.get('/owner-assistant/conversations', { params: storeId ? { storeId } : {} }).then(unwrap),

  conversation: (conversationId) =>
    api.get(`/owner-assistant/conversations/${encodeURIComponent(conversationId)}`).then(unwrap),

  deleteConversation: (conversationId) =>
    api.delete(`/owner-assistant/conversations/${encodeURIComponent(conversationId)}`).then(unwrap),
}
