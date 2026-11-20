

export const kpis = [
  { label: 'Orders today', value: '48', delta: '+12%', note: 'vs yesterday', border: 'border-brand' },
  { label: 'Confirmation rate', value: '76.4%', delta: '+4.2%', note: 'vs previous 30 days', border: 'border-accent' },
  { label: 'Delivery success', value: '87.2%', delta: '+2.1%', note: 'delivered / final outcomes', border: 'border-gold' },
  { label: 'Refusal / RTO', value: '8.3%', delta: '-1.4%', note: 'lower is better', border: 'border-danger' },
]

export const courierPerformance = [
  { name: 'Yalidine', value: 92, color: '#2794b3' },
  { name: 'ZR Express', value: 86, color: '#115c9e' },
  { name: 'Maystro', value: 78, color: '#ffb000' },
]



// price: null means unknown, so the courier is not ranked
export const quotes = {
  Blida: [
    { name: 'Yalidine', price: 500, days: [1, 2], success: 92 },
    { name: 'ZR Express', price: 450, days: [2, 3], success: 85 },
    { name: 'Maystro', price: null, days: null, success: null },
  ],
  Algiers: [
    { name: 'Yalidine', price: 400, days: [1, 1], success: 94 },
    { name: 'ZR Express', price: 380, days: [1, 2], success: 88 },
    { name: 'Maystro', price: 350, days: [2, 3], success: 80 },
  ],
  Oran: [
    { name: 'Yalidine', price: 700, days: [2, 3], success: 90 },
    { name: 'ZR Express', price: 650, days: [2, 4], success: 83 },
    { name: 'Maystro', price: 600, days: [3, 4], success: 76 },
  ],
  Constantine: [
    { name: 'Yalidine', price: 650, days: [2, 3], success: 89 },
    { name: 'ZR Express', price: 600, days: [2, 3], success: 84 },
    { name: 'Maystro', price: 550, days: [3, 5], success: 74 },
  ],
}

export const orders = [
  {
    id: 'LM-1048', customerName: 'سارة بن يوسف', phone: '0550123456', wilaya: 'Blida',
    address: '', amount: 6800, status: 'needs_confirmation', source: 'WhatsApp', time: '10:42',
    riskBand: 'high', recommended: 'Yalidine',
    items: [{ name: 'Shoes, black, size 42', qty: 1, price: 6800 }],
    message: 'Salam, nheb commander paire chaussures noire taille 42. Ana f Blida, livraison à domicile.',
    risk: {
      band: 'high',
      factors: ['1 refused out of 4 past orders', 'Exact address is still missing'],
      sample: 4,
      suggestion: 'Get the exact address, then confirm by phone before dispatch.',
    },
  },
  {
    id: 'LM-1047', customerName: 'Lina Boudiaf', phone: '0661234567', wilaya: 'Algiers',
    address: 'Rue Didouche Mourad, n°12, Alger-Centre', amount: 4200, status: 'confirmed', source: 'Instagram', time: '10:18',
    riskBand: 'low', recommended: 'Yalidine',
    items: [{ name: 'Handbag, beige', qty: 1, price: 4200 }], message: '',
    risk: { band: 'low', factors: ['5 past orders, none refused'], sample: 5, suggestion: 'Safe to dispatch.' },
  },
  {
    id: 'LM-1046', customerName: 'محمد أمين', phone: '0770987654', wilaya: 'Oran',
    address: 'Cité 200 logements, bloc B, Es Senia', amount: 9350, status: 'confirmed', source: 'Messenger', time: '09:54',
    riskBand: 'insufficient', recommended: 'Yalidine',
    items: [{ name: 'Jacket, navy, size L', qty: 1, price: 9350 }], message: '',
    risk: { band: 'insufficient', factors: [], sample: 0, suggestion: 'No history for this customer. Confirm by phone before dispatch.' },
  },
  {
    id: 'LM-1045', customerName: 'Amel Khelifi', phone: '0555987123', wilaya: 'Constantine',
    address: 'Rue Abane Ramdane, n°5', amount: 5600, status: 'cancelled', source: 'WhatsApp', time: '09:20',
    riskBand: 'high', recommended: 'Yalidine',
    items: [{ name: 'Sneakers, white, size 39', qty: 1, price: 5600 }], message: '',
    risk: { band: 'high', factors: ['2 refused out of 3 past orders'], sample: 3, suggestion: 'Confirm by phone before dispatch.' },
  },
]

export const customers = [
  { name: 'سارة بن يوسف', phone: '0550123456', wilaya: 'Blida', delivered: 3, refused: 1, reliability: 'medium' },
  { name: 'Lina Boudiaf', phone: '0661234567', wilaya: 'Algiers', delivered: 5, refused: 0, reliability: 'low' },
  { name: 'محمد أمين', phone: '0770987654', wilaya: 'Oran', delivered: 0, refused: 0, reliability: 'insufficient' },
  { name: 'Amel Khelifi', phone: '0555987123', wilaya: 'Constantine', delivered: 1, refused: 2, reliability: 'high' },
]

export const shipments = [
  { tracking: 'YL-928174', customer: 'سارة بن يوسف', courier: 'Yalidine', wilaya: 'Blida', cod: 6800, status: 'created', time: 'Now', next: 'Courier pickup expected today, 14:00 to 18:00' },
  { tracking: 'ZR-670982', customer: 'Lina Boudiaf', courier: 'ZR Express', wilaya: 'Algiers', cod: 4200, status: 'in_transit', time: '22m', next: 'Arrival at Algiers hub expected this afternoon' },
  { tracking: 'YL-928101', customer: 'محمد أمين', courier: 'Yalidine', wilaya: 'Oran', cod: 9350, status: 'out_for_delivery', time: '1h', next: 'Delivery attempt today before 18:00' },
  { tracking: 'MY-410882', customer: 'Amel Khelifi', courier: 'Maystro', wilaya: 'Constantine', cod: 5600, status: 'failed', time: '2h', next: 'Contact the customer and reschedule' },
]

export const timelineSteps = ['Shipment created', 'Picked up', 'In transit', 'Out for delivery', 'Delivered']
export const statusStep = { created: 0, picked_up: 1, in_transit: 2, out_for_delivery: 3, failed: 3, delivered: 4 }

export const couriers = [
  { name: 'Yalidine', short: 'YA', status: 'connected', credential: 'YL-•••• 7F2A', lastSync: '4 minutes ago', success: 92, avgCost: 540, avgDays: '1–3', border: 'border-brand' },
  { name: 'ZR Express', short: 'ZR', status: 'connected', credential: 'ZR-•••• 3C91', lastSync: '4 minutes ago', success: 86, avgCost: 470, avgDays: '2–4', border: 'border-violet' },
  { name: 'Maystro Delivery', short: 'MA', status: 'sync_issue', credential: 'MY-•••• B0D4', lastSync: '2 days ago', success: 78, avgCost: 430, avgDays: '3–5', border: 'border-gold' },
]

export const successTrend = [
  { label: 'W1', value: 84 }, { label: 'W2', value: 85 }, { label: 'W3', value: 83 },
  { label: 'W4', value: 86 }, { label: 'W5', value: 88 }, { label: 'W6', value: 87 },
]

export const refusalReasons = [
  { reason: 'Customer unreachable', count: 14, share: '34%' },
  { reason: 'Changed mind / refused at door', count: 11, share: '27%' },
  { reason: 'Incomplete address', count: 9, share: '22%' },
  { reason: 'Price disagreement (COD)', count: 7, share: '17%' },
]

export const riskyWilayas = [
  { wilaya: 'Constantine', rate: '14.1%', orders: 52 },
  { wilaya: 'Blida', rate: '11.6%', orders: 43 },
  { wilaya: 'Oran', rate: '8.2%', orders: 61 },
]

export const suggestedQuestions = [
  'Which courier performs best?',
  'Why do customers refuse orders?',
  'Which shipments failed today?',
  'Which wilaya has the highest refusal rate?',
]