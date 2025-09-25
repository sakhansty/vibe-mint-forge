import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const nftStorageKey = Deno.env.get('NFT_STORAGE_KEY')
    if (!nftStorageKey) {
      return new Response(
        JSON.stringify({ error: 'NFT Storage API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Upload file to NFT.Storage
    const fileBuffer = await file.arrayBuffer()
    const fileBlob = new Blob([fileBuffer], { type: file.type })

    // Upload image to NFT.Storage
    const imageFormData = new FormData()
    imageFormData.append('file', fileBlob, file.name)

    const imageResponse = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nftStorageKey}`,
      },
      body: imageFormData,
    })

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error('NFT.Storage image upload error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to upload image to IPFS' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const imageData = await imageResponse.json()
    const imageUrl = `ipfs://${imageData.value.cid}`

    // Create metadata
    const metadata = {
      name: name || file.name.split('.')[0],
      description: description || 'NFT created with Vibe NFT Minter',
      image: imageUrl,
      attributes: [
        {
          trait_type: 'Created with',
          value: 'Vibe NFT Minter'
        },
        {
          trait_type: 'Network',
          value: 'Base Sepolia'
        }
      ]
    }

    // Upload metadata to NFT.Storage
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    const metadataFormData = new FormData()
    metadataFormData.append('file', metadataBlob, 'metadata.json')

    const metadataResponse = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nftStorageKey}`,
      },
      body: metadataFormData,
    })

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text()
      console.error('NFT.Storage metadata upload error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to upload metadata to IPFS' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const metadataData = await metadataResponse.json()
    const tokenURI = `ipfs://${metadataData.value.cid}`

    return new Response(
      JSON.stringify({ 
        tokenURI,
        imageUrl,
        metadata 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})