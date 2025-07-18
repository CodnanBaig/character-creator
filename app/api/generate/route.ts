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
    const prompt = `Create a detailed character for a story with these details:

Name: ${formData.name}
Age: ${formData.age}
Occupation: ${formData.occupation}
Personality Type: ${formData.personalityType}
Goal: ${formData.goal}
Flaw: ${formData.flaw}
Setting: ${formData.setting}

Write a complete character profile with exactly these 4 sections:

1. BACKSTORY
Write 2-3 detailed paragraphs about ${formData.name}'s life story. Include their childhood, key events that shaped them, important relationships, and how they became who they are today. Make it specific to their age, occupation, and the ${formData.setting} setting.

2. PERSONALITY TRAITS
Describe ${formData.name}'s personality in detail. Include their strengths, weaknesses, quirks, habits, fears, and how they interact with others. Be specific about what makes them unique and memorable.

3. DIALOGUE STYLE
Explain how ${formData.name} speaks. Describe their vocabulary level, tone, speech patterns, favorite phrases, and communication style. Consider their occupation, age, and personality type.

4. SAMPLE DIALOGUE
Write 3-4 lines of dialogue that ${formData.name} would actually say. Show their personality and speaking style in a typical conversation or situation relevant to their goal or setting.

Make ${formData.name} feel like a real, three-dimensional person that readers will care about.`

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
              "You are a creative writing assistant. Generate detailed character profiles with substantial content for each section. Write in a natural, engaging style. Do not repeat instructions or return placeholder text.",
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

    // Debug: Log the raw response to see what we're getting
    console.log("Raw AI Response:", generatedText)

    // Parse the response into sections
    const sections = parseCharacterResponse(generatedText)

    return NextResponse.json(sections)
  } catch (error) {
    console.error("Error generating character:", error)
    return NextResponse.json({ error: "Failed to generate character. Please try again." }, { status: 500 })
  }
}

function parseCharacterResponse(text: string) {
  const sections = {
    backstory: "",
    personalityTraits: "",
    dialogueStyle: "",
    sampleDialogue: "",
  }

  // More robust regex patterns
  const backstoryMatch = text.match(/1\.\s*BACKSTORY\s*\n([\s\S]*?)(?=\n\s*2\.\s*PERSONALITY|$)/i)
  const personalityMatch = text.match(/2\.\s*PERSONALITY TRAITS\s*\n([\s\S]*?)(?=\n\s*3\.\s*DIALOGUE|$)/i)
  const dialogueStyleMatch = text.match(/3\.\s*DIALOGUE STYLE\s*\n([\s\S]*?)(?=\n\s*4\.\s*SAMPLE|$)/i)
  const sampleDialogueMatch = text.match(/4\.\s*SAMPLE DIALOGUE\s*\n([\s\S]*?)$/i)

  // Alternative patterns if the numbered ones don't work
  const backstoryAlt = text.match(/BACKSTORY\s*:?\s*\n([\s\S]*?)(?=\n\s*PERSONALITY|$)/i)
  const personalityAlt = text.match(/PERSONALITY TRAITS?\s*:?\s*\n([\s\S]*?)(?=\n\s*DIALOGUE|$)/i)
  const dialogueAlt = text.match(/DIALOGUE STYLE\s*:?\s*\n([\s\S]*?)(?=\n\s*SAMPLE|$)/i)
  const sampleAlt = text.match(/SAMPLE DIALOGUE\s*:?\s*\n([\s\S]*?)$/i)

  sections.backstory = (backstoryMatch?.[1] || backstoryAlt?.[1] || "").trim()
  sections.personalityTraits = (personalityMatch?.[1] || personalityAlt?.[1] || "").trim()
  sections.dialogueStyle = (dialogueStyleMatch?.[1] || dialogueAlt?.[1] || "").trim()
  sections.sampleDialogue = (sampleDialogueMatch?.[1] || sampleAlt?.[1] || "").trim()

  // If sections are still empty, try to extract meaningful content from the text
  if (!sections.backstory || sections.backstory.length < 50) {
    const lines = text.split('\n')
    const backstoryLines = []
    let inBackstory = false
    
    for (const line of lines) {
      if (line.toLowerCase().includes('backstory') || line.match(/^\d+\./)) {
        inBackstory = true
        continue
      }
      if (inBackstory && (line.toLowerCase().includes('personality') || line.match(/^\d+\./))) {
        break
      }
      if (inBackstory && line.trim()) {
        backstoryLines.push(line.trim())
      }
    }
    
    if (backstoryLines.length > 0) {
      sections.backstory = backstoryLines.join(' ')
    }
  }

  // Similar fallback for other sections
  if (!sections.personalityTraits || sections.personalityTraits.length < 30) {
    const personalityContent = extractSectionContent(text, 'personality')
    if (personalityContent) {
      sections.personalityTraits = personalityContent
    }
  }

  if (!sections.dialogueStyle || sections.dialogueStyle.length < 30) {
    const dialogueContent = extractSectionContent(text, 'dialogue style')
    if (dialogueContent) {
      sections.dialogueStyle = dialogueContent
    }
  }

  if (!sections.sampleDialogue || sections.sampleDialogue.length < 20) {
    const sampleContent = extractSectionContent(text, 'sample dialogue')
    if (sampleContent) {
      sections.sampleDialogue = sampleContent
    }
  }

  // Final fallbacks if still empty
  if (!sections.backstory) {
    sections.backstory = "Unable to generate backstory. Please try again with different character details."
  }
  if (!sections.personalityTraits) {
    sections.personalityTraits = "Unable to generate personality traits. Please try again with different character details."
  }
  if (!sections.dialogueStyle) {
    sections.dialogueStyle = "Unable to generate dialogue style. Please try again with different character details."
  }
  if (!sections.sampleDialogue) {
    sections.sampleDialogue = "Unable to generate sample dialogue. Please try again with different character details."
  }

  return sections
}

function extractSectionContent(text: string, sectionName: string): string {
  const lines = text.split('\n')
  const contentLines = []
  let inSection = false
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    if (lowerLine.includes(sectionName.toLowerCase()) || line.match(/^\d+\./)) {
      inSection = true
      continue
    }
    if (inSection && (line.match(/^\d+\./) || lowerLine.includes('backstory') || lowerLine.includes('personality') || lowerLine.includes('dialogue') || lowerLine.includes('sample'))) {
      break
    }
    if (inSection && line.trim()) {
      contentLines.push(line.trim())
    }
  }
  
  return contentLines.join(' ')
}
