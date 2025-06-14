'use client'

import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import ResponseActions from './ResponseActions'

interface ChatMessage {
  id: string
  role: 'user' | 'napoleon'
  content: string
  timestamp: Date
}

export default function NapoleonChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'napoleon',
      content: `Bonjour, mes amis! Ik ben Napoleon Bonaparte, Keizer van de Fransen en Koning van Italië. 

Ik heb Europa veroverd, wetten geschreven die nog steeds bestaan, en veldslagen gewonnen die nog altijd bestudeerd worden op militaire academies wereldwijd.

**Wat wilt u van mij weten?** Vraag mij over:
- 🏛️ Mijn politieke hervormingen en de Code Napoleon
- ⚔️ Mijn militaire campagnes en strategieën  
- 👑 Het leven aan het keizerlijke hof
- 🌍 Mijn visie op Europa en de wereld
- 🏝️ Mijn ballingschap op Elba en Sint-Helena

*Spreek vrijuit - een keizer heeft tijd voor zijn onderdanen!*`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  const generateNapoleonPrompt = (userMessage: string) => {
    return `Je bent Napoleon Bonaparte, de Franse keizer (1769-1821). Reageer op de volgende vraag vanuit Napoleon's perspectief, in zijn karakteristieke stijl:

KARAKTER RICHTLIJNEN:
- Spreek in de eerste persoon als Napoleon zelf
- Gebruik zijn zelfverzekerde, soms arrogante toon
- Verwijs naar je prestaties en veldslagen
- Toon je intelligentie en strategische denken
- Gebruik af en toe Franse uitdrukkingen
- Wees educatief maar blijf in karakter
- Geef historisch accurate informatie
- Toon zowel je grootsheid als je menselijke kant

HISTORISCHE CONTEXT:
- Geboren op Corsica in 1769
- Militaire carrière tijdens de Franse Revolutie
- Consul en later Keizer van Frankrijk (1804-1814, 1815)
- Beroemde veldslagen: Austerlitz, Jena, Wagram
- Code Napoleon (burgerlijk wetboek)
- Continentaal Stelsel tegen Engeland
- Russische campagne (1812) - grote nederlaag
- Ballingschap op Elba en Sint-Helena
- Overleden in 1821

TOON:
- Zelfverzekerd en charismatisch
- Soms nostalgisch over je gloriedagen
- Trots op je prestaties
- Kritisch over je vijanden (vooral Engeland)
- Respectvol naar je soldaten en het Franse volk

Vraag van de leerling: "${userMessage}"

Antwoord als Napoleon Bonaparte (in het Nederlands, maar met Franse accenten waar passend):`;
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading || isStreaming) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)
    setStreamingContent('')

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const napoleonPrompt = generateNapoleonPrompt(userMessage.content)

      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: napoleonPrompt,
          aiModel: 'smart', // Use Gemini 2.5 Flash for good balance
          useGrounding: false // Keep it historical, not current events
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setIsLoading(false)
      setIsStreaming(true)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      if (!reader) {
        throw new Error('No readable stream available')
      }

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                throw new Error(data.message || 'Streaming error')
              }
              
              if (data.done) {
                // Stream completed
                const napoleonMessage: ChatMessage = {
                  id: `napoleon-${Date.now()}`,
                  role: 'napoleon',
                  content: accumulatedContent,
                  timestamp: new Date()
                }
                setMessages(prev => [...prev, napoleonMessage])
                setStreamingContent('')
                setIsStreaming(false)
                return
              }
              
              if (data.token) {
                accumulatedContent += data.token
                setStreamingContent(accumulatedContent)
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError)
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error)
      
      if (error.name === 'AbortError') {
        // Request was aborted
        if (streamingContent) {
          const napoleonMessage: ChatMessage = {
            id: `napoleon-${Date.now()}`,
            role: 'napoleon',
            content: streamingContent,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, napoleonMessage])
        }
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'napoleon',
          content: `Pardonnez-moi, mes amis... Er lijkt een probleem te zijn met onze communicatie. Probeer het nog eens. *adjusts bicorne hat with frustration*`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent('')
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  // Suggested questions for students
  const suggestedQuestions = [
    "Waarom besloot u om keizer te worden?",
    "Wat was uw grootste militaire overwinning?",
    "Hoe zag een dag in uw leven eruit als keizer?",
    "Wat denkt u van de Franse Revolutie?",
    "Waarom mislukte de Russische campagne?",
    "Wat is uw belangrijkste erfenis voor Europa?"
  ]

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-2xl border-4 border-yellow-300">
            👑
          </div>
          <div>
            <h2 className="text-2xl font-bold">Napoleon Bonaparte</h2>
            <p className="text-blue-100">Empereur des Français • 1769-1821</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-blue-200">Beschikbaar voor vragen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-blue-50/50 to-white/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              {msg.role === 'napoleon' && (
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-sm mr-3">
                    👑
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Napoleon Bonaparte</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              <div className={`rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white ml-12' 
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-white">{msg.content}</p>
                ) : (
                  <div>
                    <MarkdownRenderer content={msg.content} className="text-gray-800" />
                    <ResponseActions 
                      content={msg.content}
                      isMarkdown={true}
                      isStreaming={false}
                      className="mt-3"
                    />
                  </div>
                )}
              </div>
              
              {msg.role === 'user' && (
                <div className="flex items-center justify-end mt-2">
                  <span className="text-xs text-gray-500 mr-2">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">Jij</span>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm ml-3 text-white">
                    👤
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming Message */}
        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-3xl">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-sm mr-3">
                  👑
                </div>
                <span className="text-sm font-semibold text-gray-700">Napoleon Bonaparte</span>
                <div className="flex items-center ml-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-600 ml-1">spreekt...</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4">
                <MarkdownRenderer content={streamingContent} className="text-gray-800" />
                <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1 align-text-bottom"></span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-3xl">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-sm mr-3">
                  👑
                </div>
                <span className="text-sm font-semibold text-gray-700">Napoleon Bonaparte</span>
              </div>
              
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-600 text-sm italic">Napoleon denkt na over uw vraag...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Voorgestelde vragen:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setMessage(question)}
                className="text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              >
                "{question}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Stel Napoleon een vraag over zijn leven, veldslagen, of tijd..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isLoading || isStreaming}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {(isLoading || isStreaming) && (
              <button
                onClick={stopGeneration}
                className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                title="Stop generatie"
              >
                ⏹️
              </button>
            )}
            
            <button
              onClick={sendMessage}
              disabled={(isLoading || isStreaming) || !message.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isLoading ? '⏳' : isStreaming ? '💭' : '🚀'} Verstuur
            </button>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          💡 Tip: Stel specifieke vragen over Napoleon's leven, veldslagen, of politieke beslissingen voor de beste antwoorden
        </div>
      </div>
    </div>
  )
}