import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type ToolType =
  | "hooks"
  | "titles"
  | "ctas"
  | "captions"
  | "hook_to_script"
  | "hook_analyzer"
  | "content_pack";

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function inferOutputLanguage(input: {
  niche: string;
  topic: string;
  style: string;
  platform: string;
}) {
  const combined = `${input.niche} ${input.topic} ${input.style} ${input.platform}`.toLowerCase();

  const hasDevanagari = /[\u0900-\u097F]/.test(combined);

  const hindiMarkers = [
    "kaise",
    "kya",
    "kyu",
    "kyun",
    "nahi",
    "nahin",
    "hai",
    "ho",
    "kar",
    "kare",
    "karna",
    "karne",
    "bina",
    "ka",
    "ki",
    "ke",
    "aur",
    "ya",
    "se",
    "par",
    "tak",
    "agar",
    "fir",
    "phir",
    "roz",
    "sahi",
    "galat",
    "views",
    "followers",
    "reels",
    "growth",
    "hindi",
    "hinglish"
  ];

  const hindiMarkerCount = hindiMarkers.reduce((count, marker) => {
    return combined.includes(marker) ? count + 1 : count;
  }, 0);

  if (hasDevanagari) return "Hindi";
  if (combined.includes("hinglish")) return "Hinglish";
  if (combined.includes("hindi")) return "Hindi";
  if (hindiMarkerCount >= 3) return "Hindi";

  return "English";
}

function buildPrompt({
  tool,
  niche,
  topic,
  style,
  platform,
  outputLanguage,
}: {
  tool: ToolType;
  niche: string;
  topic: string;
  style: string;
  platform: string;
  outputLanguage: "English" | "Hindi" | "Hinglish";
}) {
  const currentYear = new Date().getFullYear();

  const languageInstruction =
    outputLanguage === "Hindi"
      ? `Output language for this request: Hindi.
Write in natural Hindi for creators.
Simple creator-style Hinglish is allowed only where it feels natural, but Hindi must clearly dominate.
Do NOT output in English.
Avoid bookish, formal, translated Hindi.
Write like a smart Indian creator speaking to a real audience.`
      : outputLanguage === "Hinglish"
      ? `Output language for this request: Hinglish.
Write in natural creator-style Hinglish used by Indian creators.
Do NOT use awkward translation.
Do NOT switch into formal bookish Hindi.
Do NOT output fully in English.`
      : `Output language for this request: English.
Write only in English.
Do NOT switch into Hindi or Hinglish.`;

  const baseContext = `
You are an elite creator growth strategist, direct-response copywriter, and short-form content writing engine.

Your job is NOT to explain theory.
Your job is to produce creator-ready output that can be used immediately.

Write like a premium paid strategist who understands why content performs.
The output must feel like it came from someone who studies real attention patterns, not generic AI.

Everything must be:
- specific
- emotionally sharp
- creator-native
- platform-aware
- direct
- clear
- modern
- non-generic
- copy-paste ready
- believable
- performance-oriented

Hard rules:
- Do NOT give vague advice
- Do NOT use filler
- Do NOT sound motivational unless the topic demands it
- Do NOT repeat the same structure with small wording changes
- Do NOT invent platform policy changes, algorithm updates, statistics, or facts
- Do NOT mention years unless it naturally improves the content
- If a year is useful, use the current year: ${currentYear}
- Never reference older years unless the user topic explicitly asks for them
- If the topic implies current trends, speak in a current and relevant way without inventing platform updates, statistics, or news
- Avoid fake guru language
- Avoid weak hype words like "secret", "hack", "explode", "dominate", "massive growth" unless used very sparingly and only if they truly fit
- Avoid generic hooks that sound like recycled internet advice
- Avoid empty contrarian lines with no real tension
- Avoid making promises that feel unrealistic or scammy
- Prefer pain, diagnosis, contrast, consequence, tension, clarity, and realism
- The output should feel like something a sharp creator would actually post

STRICT LANGUAGE RULE:
${languageInstruction}
- Follow the output language instruction exactly
- Do NOT mix languages awkwardly
- Do NOT default to English unless the instruction says English
- Make the output feel native to the audience using that language

Content context:
- Niche: ${niche}
- Platform: ${platform}
- Style: ${style}
- Main topic / idea: ${topic}

Quality standard:
The output must feel usable, postable, and stronger than what an average creator would write on their own.

Priority hierarchy:
1. Specificity
2. Emotional tension
3. Clarity
4. Believability
5. Performance potential
`;

  if (tool === "hooks") {
    return `
${baseContext}

TASK:
Generate 10 high-retention hooks for this topic.

GOAL:
Make people stop scrolling and feel like the next line matters.

HOOK RULES:
- Every hook must feel materially different
- Prioritize pain, diagnosis, contrast, curiosity, consequence, tension, or unexpected framing
- Avoid vague motivational phrasing
- Avoid broad overpromises
- Do not repeat structures
- Do not number the hooks inside the text
- Avoid cliché formulas unless they are truly strong
- At least 4 hooks should feel diagnostic
- At least 2 hooks should feel contrarian
- At least 2 hooks should feel authority-driven
- At least 2 hooks should include believable specificity like low views, posting daily, weak retention, no traction, low reach, stuck growth, etc.
- Hooks should feel postable by a serious creator, not a random quote page
- If writing in Hindi or Hinglish, make it sound sharp and native, not translated

BAD EXAMPLES TO AVOID:
- "Instagram ka algorithm aapse kya chhupa raha hai?"
- "Yeh secret aapko koi nahi batayega"
- "Want to know how to grow fast?"
- "Here is the ultimate hack"
- "Sab galat kar rahe hain"

BETTER DIRECTION:
- "रोज पोस्ट कर रहे हो, फिर भी views नहीं आ रहे? Problem content नहीं, packaging है."
- "If your reels die after 1 second, growth was never the real problem."
- "Posting daily and still stuck under 2K views? This is usually why."
- "आपकी consistency fail नहीं हो रही. आपका पहला second fail हो रहा है."

Also choose the single strongest hook and make the recommendation the strongest raw hook only.

RETURN STRICT JSON ONLY:
{
  "type": "hooks",
  "generic": {
    "results": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5", "hook 6", "hook 7", "hook 8", "hook 9", "hook 10"],
    "recommendation": "best hook here"
  }
}
`;
  }

  if (tool === "titles") {
    return `
${baseContext}

TASK:
Generate 10 clickable titles for this content idea.

GOAL:
Make the title feel worth clicking immediately.

TITLE RULES:
- Strong curiosity + specificity
- Suitable for ${platform}
- Avoid bland generic titles
- No repetitive formulas
- Prefer titles that imply a clear payoff, mistake, tension, contrast, or useful outcome
- At least 3 titles should feel premium and authority-driven
- At least 2 should feel contrarian
- At least 2 should feel highly curiosity-based
- Keep them practical, believable, and creator-native
- Avoid titles that feel like generic clickbait with no depth

Also choose the strongest title and make the recommendation the strongest raw title only.

RETURN STRICT JSON ONLY:
{
  "type": "titles",
  "generic": {
    "results": ["title 1", "title 2", "title 3", "title 4", "title 5", "title 6", "title 7", "title 8", "title 9", "title 10"],
    "recommendation": "best title here"
  }
}
`;
  }

  if (tool === "ctas") {
    return `
${baseContext}

TASK:
Generate 10 strong CTA lines for this content idea.

GOAL:
Drive comments, follows, saves, shares, DMs, or profile visits.

CTA RULES:
- Short
- Clear
- Action-focused
- Creator-native
- No weak generic lines like "follow for more"
- Make each CTA feel intentional and usable
- Mix goals across the 10 outputs: comments, saves, follows, DMs, profile clicks, shares
- Some CTAs should feel direct, some soft, some sharp
- Avoid sounding desperate or needy
- Avoid generic “comment yes/no” filler

Also choose the strongest CTA and make the recommendation the strongest raw CTA only.

RETURN STRICT JSON ONLY:
{
  "type": "ctas",
  "generic": {
    "results": ["cta 1", "cta 2", "cta 3", "cta 4", "cta 5", "cta 6", "cta 7", "cta 8", "cta 9", "cta 10"],
    "recommendation": "best cta here"
  }
}
`;
  }

  if (tool === "captions") {
    return `
${baseContext}

TASK:
Generate 10 short-form social captions for this topic.

GOAL:
Write captions that feel natural, sharp, and post-ready.

CAPTION RULES:
- Platform-native for ${platform}
- Strong opening line
- No filler paragraphs
- No generic “in today’s world” phrasing
- Each caption should feel like it was written by a smart creator, not AI
- Mix styles across outputs: authority, curiosity, contrarian, minimal, emotional, diagnostic
- Keep them concise enough to be usable
- Avoid robotic formatting
- Avoid fake overhype
- Each caption should sound like it belongs under a real post

Also choose the strongest caption and make the recommendation the strongest raw caption only.

RETURN STRICT JSON ONLY:
{
  "type": "captions",
  "generic": {
    "results": ["caption 1", "caption 2", "caption 3", "caption 4", "caption 5", "caption 6", "caption 7", "caption 8", "caption 9", "caption 10"],
    "recommendation": "best caption here"
  }
}
`;
  }

  if (tool === "hook_to_script") {
    return `
${baseContext}

IMPORTANT:
The user wants short-form video scripts on THIS TOPIC for their own content.

This is NOT advice for creators.
This is NOT strategy explanation.
This is direct, recordable script output.

TASK:
Generate 10 different short-form video scripts on the topic.

SCRIPT RULES:
- Each script must sound like spoken language
- Each script must start strong in the first line
- Each script must be meaningfully different in angle and structure
- No filler intros
- No "Hey guys welcome back" garbage
- No explaining strategy unless the topic itself requires it
- Scripts should feel like reels, shorts, or talking-head videos
- Keep them concise but complete
- Make at least 4 scripts feel diagnostic and sharp
- Make at least 2 scripts authority-driven
- Make at least 2 scripts curiosity-driven
- Make the scripts believable and natural to speak
- Avoid sounding like a lecture or AI essay

Also choose the strongest script and make the recommendation the strongest raw script only.

RETURN STRICT JSON ONLY:
{
  "type": "hook_to_script",
  "generic": {
    "results": ["script 1", "script 2", "script 3", "script 4", "script 5", "script 6", "script 7", "script 8", "script 9", "script 10"],
    "recommendation": "best script here"
  }
}
`;
  }

  if (tool === "hook_analyzer") {
    return `
${baseContext}

IMPORTANT:
The "topic" field contains the hook to analyze.

TASK:
Analyze this hook like a world-class short-form strategist.

You must:
- score it out of 100
- explain why it works
- explain why it fails
- explain how to improve it
- rewrite it into 5 better versions

ANALYSIS RULES:
- Be honest, not polite
- Focus on attention, curiosity, specificity, emotional tension, clarity, novelty, and conversion potential
- Do not give vague feedback
- Explain failure points clearly
- Rewritten hooks must be materially stronger, not minor rewrites
- At least 2 rewrites should be sharper and more direct
- At least 1 should be more curiosity-driven
- At least 1 should be more contrarian
- At least 1 should be more authority-driven
- If analyzing Hindi/Hinglish text, keep rewritten versions native and sharp

RETURN STRICT JSON ONLY:
{
  "type": "hook_analyzer",
  "analyzer": {
    "score": 78,
    "verdict": "Strong curiosity but lacks specificity and sharper emotional consequence.",
    "whyWorks": [
      "reason 1",
      "reason 2",
      "reason 3"
    ],
    "whyFails": [
      "reason 1",
      "reason 2",
      "reason 3"
    ],
    "improvements": [
      "improvement 1",
      "improvement 2",
      "improvement 3"
    ],
    "rewrittenHooks": [
      "hook 1",
      "hook 2",
      "hook 3",
      "hook 4",
      "hook 5"
    ]
  }
}
`;
  }

  return `
${baseContext}

IMPORTANT:
The user wants 2 complete content packs for THIS TOPIC for their own content.

Each pack must contain only:
- angle
- title
- script
- caption
- cta

TASK:
Generate 2 high-quality content packs.

CONTENT PACK RULES:
- Make both packs meaningfully different
- Each pack should feel like a viable content direction
- Script must be direct creator-ready script, not outline
- Title must be clickable
- Caption must feel platform-native
- CTA must fit the angle
- No filler
- No teaching mode
- No generic repetitive outputs
- Make one pack safer and broadly usable
- Make one pack sharper, more aggressive, or more contrarian
- Both packs must feel like something someone would genuinely post

RETURN STRICT JSON ONLY:
{
  "type": "content_pack",
  "contentPacks": [
    {
      "angle": "angle 1",
      "title": "title 1",
      "script": "script 1",
      "caption": "caption 1",
      "cta": "cta 1"
    },
    {
      "angle": "angle 2",
      "title": "title 2",
      "script": "script 2",
      "caption": "caption 2",
      "cta": "cta 2"
    }
  ]
}
`;
}

function fallbackGeneric(tool: ToolType, text: string) {
  const chunks = text
    .split(/\n{2,}|\n-\s|\n\d+\.\s/)
    .map((x) => x.trim())
    .filter(Boolean);

  return {
    type: tool,
    generic: {
      results: chunks.length ? chunks.slice(0, 10) : [text || "No output generated."],
      recommendation: chunks[0] || text || "No recommendation available.",
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tool = safeString(body.tool) as ToolType;
    const niche = safeString(body.niche);
    const topic = safeString(body.topic);
    const style = safeString(body.style) || "Curiosity";
    const platform = safeString(body.platform) || "Instagram";

    if (!tool || !niche || !topic) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const outputLanguage = inferOutputLanguage({
      niche,
      topic,
      style,
      platform,
    });

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const creditCostMap: Record<ToolType, number> = {
      hooks: 1,
      titles: 1,
      ctas: 1,
      captions: 1,
      hook_to_script: 2,
      hook_analyzer: 1,
      content_pack: 3,
    };

    const cost = creditCostMap[tool] ?? 1;

    if ((profile.credits ?? 0) < cost) {
      return NextResponse.json({ error: "NO_CREDITS" }, { status: 402 });
    }

    const prompt = buildPrompt({
      tool,
      niche,
      topic,
      style,
      platform,
      outputLanguage,
    });

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.88,
            topP: 0.9,
            topK: 32,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("Gemini API Error:", data);
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Gemini API failed. Check model name / quota / billing.",
        },
        { status: 500 }
      );
    }

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!output) {
      return NextResponse.json(
        { error: "No output generated from AI." },
        { status: 500 }
      );
    }

    let parsed = extractJson(output);

    if (!parsed || typeof parsed !== "object") {
      parsed = fallbackGeneric(tool, output);
    }

    const preview =
      parsed?.analyzer?.verdict ||
      parsed?.generic?.results?.[0] ||
      parsed?.contentPacks?.[0]?.title ||
      output.slice(0, 180) ||
      "Generated output";

    await supabase
      .from("profiles")
      .update({ credits: (profile.credits ?? 0) - cost })
      .eq("id", user.id);

    await supabase.from("generations").insert({
      user_id: user.id,
      tool,
      niche,
      topic,
      style,
      platform,
      preview,
    });

    await supabase.from("credit_events").insert({
      user_id: user.id,
      change_amount: -cost,
      reason: `generation_${tool}`,
    });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Route Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}