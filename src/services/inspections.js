import { supabase } from '../lib/supabase'

export async function getInspections() {
  const { data, error } = await supabase
    .from('inspection_reports')
    .select(`*, property_matches(*, properties(*), clients(*))`)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getInspection(id) {
  const { data, error } = await supabase
    .from('inspection_reports')
    .select(`*, property_matches(*, properties(*))`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createInspection(matchId) {
  const { data, error } = await supabase
    .from('inspection_reports')
    .insert({ match_id: matchId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getInspectionByMatch(matchId) {
  const { data, error } = await supabase
    .from('inspection_reports')
    .select('*')
    .eq('match_id', matchId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function submitInspection(id, reportData) {
  const { data, error } = await supabase
    .from('inspection_reports')
    .update({ ...reportData, submitted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
