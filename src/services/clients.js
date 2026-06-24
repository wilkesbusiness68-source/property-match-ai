import { supabase } from '../lib/supabase'

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getClient(id) {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createClient(clientData) {
  const { data, error } = await supabase.from('clients').insert(clientData).select().single()
  if (error) throw error
  return data
}

export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getClientMatches(clientId) {
  const { data, error } = await supabase
    .from('property_matches')
    .select(`*, properties(*)`)
    .eq('client_id', clientId)
    .order('match_score', { ascending: false })
  if (error) throw error
  return data
}

export async function updateMatchStatus(matchId, status) {
  const { data, error } = await supabase
    .from('property_matches')
    .update({ status })
    .eq('id', matchId)
    .select()
    .single()
  if (error) throw error
  return data
}
