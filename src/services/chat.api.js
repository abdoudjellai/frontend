import axios from 'axios'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const MOCK_RESPONSE = {
  reply:
    "Salam ! J'ai bien noté : une paire de chaussures noires, taille 42, livraison à domicile à Blida. Pouvez-vous m'envoyer votre nom, votre numéro de téléphone et votre adresse exacte ?",
  order: {
    product: 'Shoes', color: 'Black', size: '42', quantity: '1', wilaya: 'Blida',
    customerName: null, phone: null, address: null, price: null,
  },
  missing: ['customerName', 'phone', 'address', 'price'],
  risk: { band: 'insufficient', reason: 'No history for this customer yet.' },
  courier: { recommended: 'Yalidine', reason: '500 DA, 1–2 days and 92% delivered for this destination.' },
}

export async function sendMessage(message) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 900))
    return MOCK_RESPONSE
  }
  try {
    const { data } = await axios.post(`${API}/api/chat`, { message })
    return data
  } catch (err) {
    throw new Error(err.response?.data?.error ?? 'Chat service is unreachable')
  }
}