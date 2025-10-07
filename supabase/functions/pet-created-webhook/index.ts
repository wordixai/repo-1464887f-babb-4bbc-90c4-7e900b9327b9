import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PetData {
  id: string
  user_id: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
  color: string
  gender: string
  image_url?: string
  notes?: string
  created_at: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get pet data from request
    const petData: PetData = await req.json()

    console.log('Pet created webhook triggered:', {
      petId: petData.id,
      petName: petData.name,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    // Perform webhook actions
    const webhookPayload = {
      event: 'pet.created',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email
      },
      pet: {
        id: petData.id,
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        weight: petData.weight,
        color: petData.color,
        gender: petData.gender,
        image_url: petData.image_url,
        notes: petData.notes,
        created_at: petData.created_at
      }
    }

    // Example: Send notification, log to analytics, etc.
    // You can integrate with third-party services here
    console.log('Webhook payload:', JSON.stringify(webhookPayload, null, 2))

    // Example: Send to external webhook URL (optional)
    // const externalWebhookUrl = Deno.env.get('EXTERNAL_WEBHOOK_URL')
    // if (externalWebhookUrl) {
    //   await fetch(externalWebhookUrl, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(webhookPayload)
    //   })
    // }

    // Store webhook log in database
    const { error: logError } = await supabaseClient
      .from('webhook_logs')
      .insert({
        event_type: 'pet.created',
        user_id: user.id,
        payload: webhookPayload,
        status: 'success'
      })

    if (logError) {
      console.error('Error logging webhook:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Pet created webhook processed successfully',
        data: webhookPayload
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})