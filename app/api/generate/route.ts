import { type NextRequest, NextResponse } from "next/server"

interface FormData {
  name: string
  age: string
  occupation: string
  personalityType: string
  goal: string
  flaw: string
  setting: string
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json()

    // Construct the prompt for character generation
    const prompt = `Create a detailed character persona based on the following information:

Name: ${formData.name}
Age: ${formData.age}
Occupation: ${formData.occupation}
Personality Type: ${formData.personalityType}
Goal: ${formData.goal}
Flaw: ${formData.flaw}
Setting: ${formData.setting}

Please provide a comprehensive character profile with the following sections:

1. BACKSTORY: A rich 2-3 paragraph backstory that explains how this character became who they are today. Include key life events, relationships, and experiences that shaped them.

2. PERSONALITY TRAITS: A detailed description of their personality, including strengths, weaknesses, quirks, habits, and how they interact with others. Be specific and vivid.

3. DIALOGUE STYLE: Describe how this character speaks - their vocabulary, tone, speech patterns, favorite phrases, and communication style. Include any accents or unique speaking habits.

4. SAMPLE DIALOGUE: Provide 3-4 lines of sample dialogue that demonstrates this character's voice and personality. Show them in a typical conversation or situation.

Make the character feel authentic, three-dimensional, and suitable for the ${formData.setting} setting. Focus on making them memorable and engaging for storytelling purposes.`

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Character Persona Generator",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v3-base:free",
        messages: [
          {
            role: "system",
            content:
              "You are a creative writing assistant specializing in character development. Create vivid, detailed character personas that writers can use in their stories. Always provide complete, detailed content for each section. Never return just section headers - always include substantial content.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.choices[0]?.message?.content || ""

    // Parse the response into sections
    const sections = parseCharacterResponse(generatedText)

    return NextResponse.json(sections)
  } catch (error) {
    console.error("Error generating character:", error)
    return NextResponse.json({ error: "Failed to generate character. Please try again." }, { status: 500 })
  }
}

function parseCharacterResponse(text: string) {
  // Split the response into sections based on numbered headers or keywords
  const sections = {
    backstory: "",
    personalityTraits: "",
    dialogueStyle: "",
    sampleDialogue: "",
  }

  // Try to extract sections using various patterns
  // Remove unsupported 's' flag from regexes for compatibility with ES2017 and earlier
  const backstoryMatch = text.match(/(?:1\.|BACKSTORY:?)([\s\S]*?)(?=(?:2\.|PERSONALITY|$))/i)
  const personalityMatch = text.match(/(?:2\.|PERSONALITY TRAITS?:?)([\s\S]*?)(?=(?:3\.|DIALOGUE STYLE|$))/i)
  const dialogueStyleMatch = text.match(/(?:3\.|DIALOGUE STYLE:?)([\s\S]*?)(?=(?:4\.|SAMPLE DIALOGUE|$))/i)
  const sampleDialogueMatch = text.match(/(?:4\.|SAMPLE DIALOGUE:?)([\s\S]*?)$/i)

  sections.backstory = backstoryMatch ? backstoryMatch[1].trim() : extractFallbackSection(text, "backstory")
  sections.personalityTraits = personalityMatch
    ? personalityMatch[1].trim()
    : extractFallbackSection(text, "personality")
  sections.dialogueStyle = dialogueStyleMatch
    ? dialogueStyleMatch[1].trim()
    : extractFallbackSection(text, "dialogue style")
  sections.sampleDialogue = sampleDialogueMatch
    ? sampleDialogueMatch[1].trim()
    : extractFallbackSection(text, "sample dialogue")

  // If sections are empty, provide fallback content
  if (!sections.backstory) {
    sections.backstory = text.substring(0, Math.min(500, text.length)) + "..."
  }
  if (!sections.personalityTraits) {
    sections.personalityTraits =
      "A complex individual with unique traits and characteristics that make them memorable and engaging. Their personality reflects their background and experiences, showing both strengths and vulnerabilities that create depth and relatability."
  }
  if (!sections.dialogueStyle) {
    sections.dialogueStyle = "Speaks in a distinctive manner that reflects their background and personality."
  }
  if (!sections.sampleDialogue || sections.sampleDialogue.length < 20) {
    sections.sampleDialogue = '"This is how I would speak," they said with conviction, their words carrying the weight of their experiences.'
  }

  return sections
}

function extractFallbackSection(text: string, sectionType: string): string {
  // Simple fallback extraction based on keywords
  const lines = text.split("\n")
  const relevantLines = lines.filter((line) => line.toLowerCase().includes(sectionType.toLowerCase()))

  if (relevantLines.length > 0) {
    return relevantLines.join("\n").trim()
  }

  return ""
}
