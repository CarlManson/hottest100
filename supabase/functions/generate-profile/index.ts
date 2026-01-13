import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface MemberData {
  memberId: string;
  memberName: string;
  picks: string;
  score?: number;
  rank?: number;
  totalMembers?: number;
  matchCount?: number;
  totalPicks?: number;
  currentMusicTaste?: string;
}

interface ProfileRequest {
  mode: 'music_taste' | 'label_and_taste' | 'running_commentary' | 'full_regeneration';
  // Single member (music_taste, label_and_taste, full_regeneration)
  memberId?: string;
  memberName?: string;
  picks?: string;
  score?: number;
  rank?: number;
  totalMembers?: number;
  matchCount?: number;
  totalPicks?: number;
  existingLabels?: string[];
  // Batch (running_commentary)
  members?: MemberData[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured in Supabase Edge Function secrets');
    }

    const requestData: ProfileRequest = await req.json();
    const { mode } = requestData;

    let result;

    switch (mode) {
      case 'music_taste':
        result = await generateMusicTaste(requestData);
        break;
      case 'label_and_taste':
        result = await generateLabelAndTaste(requestData);
        break;
      case 'running_commentary':
        result = await generateRunningCommentary(requestData);
        break;
      case 'full_regeneration':
        result = await generateFullProfile(requestData);
        break;
      default:
        throw new Error(`Invalid mode: ${mode}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

async function generateMusicTaste(data: ProfileRequest) {
  const { memberName, picks, totalPicks } = data;

  const prompt = `You're a cheeky Aussie music critic analyzing someone's Hottest 100 picks. Be funny, playful, and a bit cheeky - but never mean-spirited. Add some Aussie slang naturally (mate, reckon, ripper, bloody good, etc.) but don't overdo it.

**${memberName}'s Picks:**
${picks}

Write a music taste analysis (3-4 sentences) with personality. Comment on:
- Genre preferences and patterns
- Mainstream vs indie/alternative leanings
- Artist nationality/origin patterns (e.g., backing the Aussies, going international, etc.)
- Any notable themes or trends
- Give them a bit of a roast if their taste is predictable, or props if it's interesting

Be observant, funny, and engaging about their musical preferences. Keep it friendly and fun!

Return format:
MUSIC_TASTE: [Your 3-4 sentence analysis here]`;

  const response = await callClaudeAPI(prompt);
  const musicTasteMatch = response.match(/MUSIC_TASTE:\s*(.+)/is);

  if (!musicTasteMatch) {
    throw new Error('Failed to parse music taste response');
  }

  return {
    memberId: data.memberId,
    musicTasteDescription: musicTasteMatch[1].trim(),
  };
}

async function generateLabelAndTaste(data: ProfileRequest) {
  const { memberName, picks, totalPicks, existingLabels } = data;

  const existingLabelsText = existingLabels && existingLabels.length > 0
    ? `\n\n**IMPORTANT - Labels Already Used (DO NOT USE THESE):**\n${existingLabels.join(', ')}\nChoose a DIFFERENT label that hasn't been used.`
    : '';

  const prompt = `You're a cheeky Aussie music critic analyzing someone's Hottest 100 picks. Be funny, playful, and a bit cheeky - but never mean-spirited. Add some Aussie character naturally.

**${memberName}'s Picks:**
${picks}${existingLabelsText}

Write a response in this EXACT format:

LABEL: [2-3 word funny/cheeky description based on their music taste - like "Triple J Bingo Winner", "Indie Snob", "Pub Rock Tragic", "TikTok Merchant", "Hipster Handbook", "True Blue Aussie", "Spotify's Top 50", "Genre Chaos Agent", "Nostalgic Dad", etc. Make it playful and based on their actual picks. MUST be unique and different from any labels already used above.]

MUSIC_TASTE: [3-4 sentences with personality analyzing their picks - genre preferences, mainstream vs indie leanings, backing Aussies vs going international, any funny patterns. Give them a friendly roast if deserved or props if they've got interesting taste. Keep it fun and cheeky!]

Be funny, observant, and engaging. Never mean - just good-natured ribbing.`;

  const response = await callClaudeAPI(prompt);

  const labelMatch = response.match(/LABEL:\s*(.+?)(?:\n|$)/i);
  const musicTasteMatch = response.match(/MUSIC_TASTE:\s*(.+)/is);

  if (!labelMatch || !musicTasteMatch) {
    throw new Error('Failed to parse label and taste response');
  }

  return {
    memberId: data.memberId,
    label: labelMatch[1].trim(),
    musicTasteDescription: musicTasteMatch[1].trim(),
  };
}

async function generateRunningCommentary(data: ProfileRequest) {
  const { members } = data;

  if (!members || members.length === 0) {
    throw new Error('No members provided for running commentary');
  }

  const membersText = members.map(m => `
**${m.memberName}:**
- Score: ${m.score} points
- Rank: ${m.rank} of ${m.totalMembers}
- Matches: EXACTLY ${m.matchCount} out of ${m.totalPicks} picks made the countdown
- Picks detail:
${m.picks}
`).join('\n');

  const prompt = `You're an Aussie sports commentator covering the Triple J Hottest 100 predictions comp like it's the footy finals! Be funny, energetic, and add some Aussie character. Use natural Aussie expressions but don't overdo it.

${membersText}

IMPORTANT: Use the EXACT match counts provided above. Do NOT count or calculate them yourself from the picks list.

For EACH person, write a brief (2-3 sentences) performance commentary:
- How they're tracking (use exact scores and ranks)
- Comment on their match count (use EXACT number provided)
- Their chances, trajectory, what they need to do
- Friendly banter comparing them to others

Be engaging, funny, and make it feel like live sports commentary. Keep it friendly - roast them if they're doing poorly but in a good-natured way!

Return format (one line per member):
MEMBER_${members[0].memberId}: [Commentary here]
${members.slice(1).map(m => `MEMBER_${m.memberId}: [Commentary here]`).join('\n')}`;

  const response = await callClaudeAPI(prompt);

  const profiles = members.map(member => {
    const regex = new RegExp(`MEMBER_${member.memberId}:\\s*(.+?)(?=\\nMEMBER_|$)`, 'is');
    const match = response.match(regex);

    return {
      memberId: member.memberId,
      performanceCommentary: match ? match[1].trim() : 'Could not generate commentary for this member.',
    };
  });

  return { profiles };
}

async function generateFullProfile(data: ProfileRequest) {
  const { memberName, picks, score, rank, totalMembers, matchCount, totalPicks, existingLabels } = data;

  const existingLabelsText = existingLabels && existingLabels.length > 0
    ? `\n\n**IMPORTANT - Labels Already Used (DO NOT USE THESE):**\n${existingLabels.join(', ')}\nChoose a DIFFERENT label that hasn't been used.`
    : '';

  const prompt = `You're a cheeky Aussie music critic analyzing someone's Hottest 100 picks. Be funny, playful, and engaging - but never mean-spirited. Add some Aussie character naturally (mate, reckon, bloody, ripper, etc.) but don't force it.

**${memberName}'s Picks:**
${picks}${existingLabelsText}

**IMPORTANT:** Analyze ONLY their music taste based on the songs they picked. IGNORE any text like "Made #X" or "Didn't make it" - that's countdown info, not relevant. Focus purely on the artists, songs, and genres they chose.

Write a response in this EXACT format:

LABEL: [2-3 word funny/cheeky description of their music taste - like "Triple J Bingo Winner", "Indie Snob", "Pub Rock Tragic", "TikTok Merchant", "Spotify's Algorithm", "True Blue Aussie", "Genre Chaos Agent", "Dad Rock Enthusiast", "Mainstream Maven", etc. Make it playful and based on their picks! MUST be unique and different from any labels already used above.]

MUSIC_TASTE: [3-4 sentences with personality about their music choices - genre patterns, mainstream vs indie, backing the Aussies or going international, any funny observations about their taste. Give them a friendly roast if their taste is predictable, or props if it's interesting. Keep it cheeky and fun!]

PERFORMANCE: [2-3 sentences continuing the music taste analysis - maybe predict how they'd go at a pub quiz, what their Spotify Wrapped probably looks like, or roast them for being too safe/hipster/mainstream. Keep it about their music taste, NOT competition results!]

Be funny, observant, and engaging. Never mean - just good-natured Aussie banter about their music taste!`;

  const response = await callClaudeAPI(prompt);

  const labelMatch = response.match(/LABEL:\s*(.+?)(?:\n|$)/i);
  const musicTasteMatch = response.match(/MUSIC_TASTE:\s*(.+?)(?=\n\n|PERFORMANCE:|$)/is);
  const performanceMatch = response.match(/PERFORMANCE:\s*(.+?)$/is);

  if (!labelMatch || !musicTasteMatch || !performanceMatch) {
    throw new Error('Failed to parse full profile response');
  }

  return {
    memberId: data.memberId,
    label: labelMatch[1].trim(),
    musicTasteDescription: musicTasteMatch[1].trim(),
    performanceCommentary: performanceMatch[1].trim(),
  };
}

async function callClaudeAPI(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API request failed: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
