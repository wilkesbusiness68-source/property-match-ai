// n8n Webhook Integration Service
// These functions are dormant until n8n workflows are built.
// In-app Claude API scoring handles scoring in the meantime.

// WEBHOOK: Triggered when a new client brief is created
// n8n workflow: receives brief → starts Domain API polling for this client
export const triggerBriefCreated = async (clientId) => {
  const url = import.meta.env.VITE_N8N_BRIEF_WEBHOOK
  if (!url) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  })
}

// WEBHOOK: Triggered to score a single property against a client
// n8n workflow: fetches brief + property → calls Claude API → saves score to Supabase
export const triggerPropertyScore = async (clientId, propertyId) => {
  const url = import.meta.env.VITE_N8N_SCORE_WEBHOOK
  if (!url) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, propertyId }),
  })
}

// WEBHOOK: Triggered when inspection is submitted
// n8n workflow: compiles report → generates PDF via PDFShift → stores URL → notifies agent
export const triggerInspectionComplete = async (inspectionId) => {
  const url = import.meta.env.VITE_N8N_INSPECTION_WEBHOOK
  if (!url) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionId }),
  })
}

// WEBHOOK: Triggered when a property hits 80%+ match score
// n8n workflow: sends SMS via MobileMessage + email via Gmail to agent
export const triggerHighMatchAlert = async (matchId, score) => {
  const url = import.meta.env.VITE_N8N_ALERT_WEBHOOK
  if (!url) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, score }),
  })
}
