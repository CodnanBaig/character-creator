"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Loader2, User, MessageSquare, Heart, Target } from "lucide-react"

interface FormData {
  name: string
  age: string
  occupation: string
  personalityType: string
  goal: string
  flaw: string
  setting: string
}

interface GeneratedCharacter {
  backstory: string
  personalityTraits: string
  dialogueStyle: string
  sampleDialogue: string
}

const personalityTypes = [
  "INTJ - The Architect",
  "INTP - The Thinker",
  "ENTJ - The Commander",
  "ENTP - The Debater",
  "INFJ - The Advocate",
  "INFP - The Mediator",
  "ENFJ - The Protagonist",
  "ENFP - The Campaigner",
  "ISTJ - The Logistician",
  "ISFJ - The Protector",
  "ESTJ - The Executive",
  "ESFJ - The Consul",
  "ISTP - The Virtuoso",
  "ISFP - The Adventurer",
  "ESTP - The Entrepreneur",
  "ESFP - The Entertainer",
]

const settings = [
  "Modern",
  "Fantasy",
  "Sci-Fi",
  "Historical",
  "Cyberpunk",
  "Post-Apocalyptic",
  "Victorian",
  "Wild West",
]

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    occupation: "",
    personalityType: "",
    goal: "",
    flaw: "",
    setting: "",
  })

  const [generatedCharacter, setGeneratedCharacter] = useState<GeneratedCharacter | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate character")
      }

      const result = await response.json()
      setGeneratedCharacter(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    formData.name &&
    formData.age &&
    formData.occupation &&
    formData.personalityType &&
    formData.goal &&
    formData.flaw &&
    formData.setting

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Character Persona Generator</h1>
          <p className="text-lg text-gray-600">Create unique backstories and personalities with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Character Details
              </CardTitle>
              <CardDescription>Fill in the details below to generate your character</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter character name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="25"
                      min="1"
                      max="200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    placeholder="Detective, Wizard, Engineer..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Personality Type</Label>
                    <Select
                      value={formData.personalityType}
                      onValueChange={(value) => handleInputChange("personalityType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select personality type" />
                      </SelectTrigger>
                      <SelectContent>
                        {personalityTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Setting</Label>
                    <Select value={formData.setting} onValueChange={(value) => handleInputChange("setting", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select setting" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.map((setting) => (
                          <SelectItem key={setting} value={setting}>
                            {setting}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="goal">Character Goal</Label>
                  <Textarea
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => handleInputChange("goal", e.target.value)}
                    placeholder="What does this character want to achieve?"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="flaw">Character Flaw</Label>
                  <Textarea
                    id="flaw"
                    value={formData.flaw}
                    onChange={(e) => handleInputChange("flaw", e.target.value)}
                    placeholder="What weakness or flaw makes this character interesting?"
                    rows={3}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!isFormValid || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Character...
                    </>
                  ) : (
                    "Generate Character"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-4">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {generatedCharacter && (
              <div className="space-y-4">
                <Collapsible defaultOpen>
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Backstory
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Card className="mt-2">
                      <CardContent className="pt-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {generatedCharacter.backstory}
                        </p>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible defaultOpen>
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            Personality Traits
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Card className="mt-2">
                      <CardContent className="pt-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {generatedCharacter.personalityTraits}
                        </p>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-500" />
                            Dialogue Style
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Card className="mt-2">
                      <CardContent className="pt-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {generatedCharacter.dialogueStyle}
                        </p>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-purple-500" />
                            Sample Dialogue
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Card className="mt-2">
                      <CardContent className="pt-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                            {generatedCharacter.sampleDialogue}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {!generatedCharacter && !isLoading && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Fill out the form and click "Generate Character" to create your persona</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
