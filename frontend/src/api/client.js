import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

export async function runSimulation(payload) {
  const res = await axios.post(`${BASE}/api/simulate`, payload)
  return res.data
}

export async function runSensitivity(payload) {
  const res = await axios.post(`${BASE}/api/sensitivity`, payload)
  return res.data
}

export async function runComparison(payload) {
  const res = await axios.post(`${BASE}/api/compare`, payload)
  return res.data
}