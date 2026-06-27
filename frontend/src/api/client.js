// frontend/src/api/client.js
// Every API call in the entire app goes through this file.
// Components never use fetch() or axios directly — they call these functions.
// This means if the API ever changes, you fix it in one place.

import axios from 'axios'

export async function runSimulation(payload) {
  const res = await axios.post('/api/simulate', payload)
  return res.data
}

export async function runSensitivity(payload) {
  const res = await axios.post('/api/sensitivity', payload)
  return res.data
}

export async function runComparison(payload) {
  const res = await axios.post('/api/compare', payload)
  return res.data
}