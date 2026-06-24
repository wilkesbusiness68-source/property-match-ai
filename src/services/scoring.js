import { supabase } from '../lib/supabase'
import { triggerHighMatchAlert } from './n8n'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

export async function scorePropertyForClient(property, client) {
  const systemPrompt = `You are a property matching AI for a buyer's agent platform. You analyse properties against buyer briefs and return structured JSON scores.`

  const userPrompt = `Buyer Brief: ${JSON.stringify(client, null, 2)}

Property: ${JSON.stringify(property, null, 2)}

Return ONLY valid JSON with this exact structure:
{
  "match_score": <integer 0-100>,
  "score_breakdown": {
    "location": <0-100>,
    "budget": <0-100>,
    "bedrooms": <0-100>,
    "bathrooms": <0-100>,
    "land_size": <0-100>,
    "property_type": <0-100>,
    "features": <0-100>
  },
  "strengths": ["<string>", ...],
  "considerations": ["<string>", ...],
  "red_flags": ["<string>", ...],
  "ai_commentary": "<2-3 sentence paragraph>"
}`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-6',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content.trim()

  // Strip markdown code fences if present
  const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(jsonStr)
}

export async function runMatchingForClient(client, properties) {
  const results = []

  for (const property of properties) {
    try {
      // Upsert property into Supabase
      const { data: savedProperty } = await supabase
        .from('properties')
        .upsert(
          {
            domain_listing_id: property.domain_listing_id,
            address: property.address,
            suburb: property.suburb,
            state: property.state,
            postcode: property.postcode,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            car_spaces: property.car_spaces,
            land_size: property.land_size,
            property_type: property.property_type,
            description: property.description,
            images: property.images,
            listing_url: property.listing_url,
            days_on_market: property.days_on_market,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: 'domain_listing_id' }
        )
        .select()
        .single()

      const aiResult = await scorePropertyForClient(property, client)

      const { data: match } = await supabase
        .from('property_matches')
        .upsert(
          {
            client_id: client.id,
            property_id: savedProperty.id,
            match_score: aiResult.match_score,
            score_breakdown: aiResult.score_breakdown,
            strengths: aiResult.strengths,
            considerations: aiResult.considerations,
            red_flags: aiResult.red_flags,
            ai_commentary: aiResult.ai_commentary,
            status: 'New',
          },
          { onConflict: 'client_id,property_id' }
        )
        .select()
        .single()

      if (aiResult.match_score >= 80 && match) {
        await triggerHighMatchAlert(match.id, aiResult.match_score)
      }

      results.push({ property: savedProperty, match, aiResult })
    } catch (err) {
      console.error('Scoring error for property', property.domain_listing_id, err)
    }
  }

  return results
}
