/**
 * @fileoverview GenAI chat engine with streaming responses, language detection,
 * and a comprehensive FIFA World Cup 2026 knowledge base.
 * @module components/Chat/ChatEngine
 */

import { sanitizeInput, sanitizeHTML } from '../../core/security.js';
import { detectLanguage } from '../../core/i18n.js';
import store from '../../core/store.js';

/**
 * Knowledge base organized by topic for contextual AI responses.
 * @type {Object<string, Object<string, string>>}
 */
const knowledgeBase = {
  en: {
    schedule: "The FIFA World Cup 2026 runs from June 11 to July 19, 2026. The tournament features 48 teams across 16 venues in the US, Mexico, and Canada. Group stage matches run through June 28, with knockout rounds beginning June 29. The Final will be held at MetLife Stadium in New Jersey on July 19.",
    venues: "The 2026 World Cup features 16 stadiums: 11 in the US (MetLife Stadium, SoFi Stadium, AT&T Stadium, Hard Rock Stadium, NRG Stadium, Mercedes-Benz Stadium, Gillette Stadium, Lincoln Financial Field, Arrowhead Stadium, Levi's Stadium, Lumen Field), 3 in Mexico (Estadio Azteca, Estadio Akron, Estadio BBVA), and 2 in Canada (BMO Field, BC Place).",
    transit: "Shuttle buses run every 10–15 minutes from designated transit hubs to each venue. Metro/subway connections are available at most US venues. Rideshare drop-off zones are located at Parking Lots A and C. For real-time transit updates, check the Smart Navigation tab.",
    accessibility: "All venues offer wheelchair-accessible seating, ramps, elevators, and accessible restrooms. Hearing loops are available at most US and Canadian venues. Service animals are welcome. For accessible pathways, use our Smart Navigation feature which highlights ramps, elevators, and accessible routes.",
    tickets: "All tickets are digital-only for FIFA 2026 — no paper tickets are issued. Tickets are linked to your FIFA account and can be accessed via the FIFA app or email confirmation. Transfer and resale are managed through the official FIFA Ticket Portal.",
    prohibited: "Prohibited items include: outside food/beverages (water bottles under 500ml allowed), weapons, fireworks, drones, professional cameras (lens > 200mm), flags on poles, laser pointers, large bags (>35cm x 25cm), and any discriminatory materials.",
    weather: "Weather varies significantly across venues. Southern US venues (Miami, Houston, Dallas) can reach 35°C+ in summer. Northern venues (Seattle, Boston) are typically 20–28°C. Mexican venues vary by altitude. Always check the weather widget on your match day page. Sunscreen and hydration stations are available at all venues.",
    food: "Each venue features diverse food options including local specialties, international cuisine, vegetarian/vegan options, and halal/kosher choices. Refillable water stations are available throughout all venues. We encourage using refillable bottles — earn 25 Green Points each time!",
    safety: "Your safety is our priority. Each venue has 24/7 security, medical stations, and emergency response teams. In case of emergency, contact the nearest steward or call the emergency hotline displayed on your ticket. Emergency exits are clearly marked throughout all venues.",
    volunteer: "FIFA 2026 volunteers assist with wayfinding, accessibility support, language translation, and fan engagement. Look for volunteers in teal FIFA vests. They speak multiple languages and can help with directions, information, and accessibility needs."
  },
  es: {
    schedule: "La Copa Mundial FIFA 2026 se celebra del 11 de junio al 19 de julio de 2026. El torneo cuenta con 48 equipos en 16 sedes en EE.UU., México y Canadá. La Final será en el MetLife Stadium de Nueva Jersey el 19 de julio.",
    venues: "16 estadios en tres países: 11 en EE.UU., 3 en México (Estadio Azteca, Estadio Akron, Estadio BBVA) y 2 en Canadá.",
    transit: "Autobuses lanzadera cada 10–15 minutos desde los centros de tránsito designados. Consulte la pestaña de Navegación Inteligente para actualizaciones en tiempo real.",
    accessibility: "Todos los estadios ofrecen asientos accesibles, rampas, ascensores y baños accesibles. Los animales de servicio son bienvenidos.",
    tickets: "Todos los boletos son digitales — no se emiten boletos de papel. Están vinculados a su cuenta FIFA.",
    food: "Cada sede ofrece opciones diversas de comida incluyendo especialidades locales, cocina internacional, opciones vegetarianas/veganas y opciones halal/kosher.",
    safety: "Su seguridad es nuestra prioridad. Cada sede cuenta con seguridad 24/7 y equipos de respuesta médica."
  },
  fr: {
    schedule: "La Coupe du Monde FIFA 2026 se déroule du 11 juin au 19 juillet 2026. Le tournoi comprend 48 équipes dans 16 stades aux États-Unis, au Mexique et au Canada.",
    venues: "16 stades dans trois pays: 11 aux États-Unis, 3 au Mexique et 2 au Canada.",
    transit: "Navettes toutes les 10–15 minutes depuis les pôles de transit désignés.",
    accessibility: "Tous les stades offrent des places accessibles, des rampes, des ascenseurs et des toilettes accessibles.",
    tickets: "Tous les billets sont numériques — pas de billets papier. Liés à votre compte FIFA.",
    food: "Chaque stade propose des options alimentaires variées, y compris des spécialités locales et des options végétariennes.",
    safety: "Votre sécurité est notre priorité. Chaque stade dispose d'une sécurité 24h/24 et d'équipes médicales."
  },
  ar: {
    schedule: "تقام كأس العالم فيفا 2026 من 11 يونيو إلى 19 يوليو 2026. تضم البطولة 48 فريقاً في 16 ملعباً في الولايات المتحدة والمكسيك وكندا.",
    venues: "16 ملعباً في ثلاث دول: 11 في الولايات المتحدة، 3 في المكسيك، و2 في كندا.",
    transit: "حافلات مكوكية كل 10-15 دقيقة من مراكز النقل المخصصة.",
    accessibility: "جميع الملاعب توفر مقاعد لذوي الاحتياجات الخاصة ومنحدرات ومصاعد.",
    tickets: "جميع التذاكر رقمية — لا توجد تذاكر ورقية.",
    food: "يقدم كل ملعب خيارات طعام متنوعة بما في ذلك خيارات حلال.",
    safety: "سلامتكم أولويتنا. كل ملعب يضم أمن على مدار الساعة وفرق طبية."
  }
};

/** @type {Object<string, RegExp[]>} Topic detection patterns */
const topicPatterns = {
  schedule: [/schedule|match|game|when|time|date|fixture|kick\s?off|group|knockout|final|horario|calendario|programme|مباراة|試合|경기/i],
  venues: [/venue|stadium|stad|where|location|capacity|seat|stade|estadio|ملعب|スタジアム|경기장|会场/i],
  transit: [/transit|transport|bus|shuttle|train|metro|subway|uber|lyft|taxi|parking|ride|how.*get|autobús|navette|باص|シャトル|셔틀/i],
  accessibility: [/accessible|wheelchair|disabled|ramp|elevator|hearing|blind|disability|handicap|special needs|accesible|accessible|silla de ruedas|ذوي الاحتياجات|バリアフリー|접근/i],
  tickets: [/ticket|entry|pass|admission|digital|transfer|resale|boleto|billet|تذكرة|チケット|티켓/i],
  prohibited: [/prohibit|banned|not allowed|cannot bring|restrict|item|bag|camera|drone|flag|weapon|prohibid|interdit|محظور|禁止|금지/i],
  weather: [/weather|rain|temperature|hot|cold|sun|forecast|umbrella|clima|météo|طقس|天気|날씨|天气/i],
  food: [/food|eat|drink|restaurant|halal|kosher|vegan|vegetarian|water|concession|comida|nourriture|طعام|食事|음식|食物/i],
  safety: [/safe|security|emergency|medical|help|danger|lost|found|police|seguridad|sécurité|أمان|安全|안전/i],
  volunteer: [/volunteer|help|assist|staff|information|desk|volunt|bénévole|متطوع|ボランティア|자원/i]
};

/**
 * Detects the topic from user input text.
 * @param {string} text - User message
 * @returns {string} Detected topic key
 */
function detectTopic(text) {
  const lowerText = text.toLowerCase();

  for (const [topic, patterns] of Object.entries(topicPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        return topic;
      }
    }
  }
  return 'general';
}

/**
 * Gets the AI response for a detected topic and language.
 * @param {string} topic - Topic key
 * @param {string} language - Language code
 * @returns {string} Response text
 */
function getResponse(topic, language) {
  const langKB = knowledgeBase[language] || knowledgeBase['en'];
  const response = langKB[topic];

  if (response) return response;

  const enKB = knowledgeBase['en'];
  if (enKB[topic]) return enKB[topic];

  const generalResponses = {
    en: "Thank you for your question! I'm here to help with anything related to FIFA World Cup 2026 — match schedules, venue information, transit, accessibility, food options, safety, and more. Could you please tell me more about what you'd like to know?",
    es: "¡Gracias por tu pregunta! Estoy aquí para ayudarte con todo lo relacionado con la Copa del Mundo FIFA 2026. ¿Podrías decirme más sobre lo que deseas saber?",
    fr: "Merci pour votre question ! Je suis là pour vous aider avec tout ce qui concerne la Coupe du Monde FIFA 2026. Pourriez-vous me dire ce que vous souhaitez savoir ?",
    ar: "شكراً على سؤالك! أنا هنا لمساعدتك في كل ما يتعلق بكأس العالم فيفا 2026. هل يمكنك إخباري بالمزيد عما تود معرفته؟",
    de: "Vielen Dank für Ihre Frage! Ich bin hier, um Ihnen bei allem rund um die FIFA WM 2026 zu helfen. Was möchten Sie wissen?",
    pt: "Obrigado pela sua pergunta! Estou aqui para ajudar com tudo sobre a Copa do Mundo FIFA 2026. O que gostaria de saber?",
    ja: "ご質問ありがとうございます！FIFA ワールドカップ 2026に関するあらゆることでお手伝いします。何について知りたいですか？",
    ko: "질문해 주셔서 감사합니다! FIFA 월드컵 2026과 관련된 모든 것을 도와드리겠습니다. 무엇을 알고 싶으신가요?",
    zh: "感谢您的提问！我可以帮助您了解2026年FIFA世界杯的一切信息。您想了解什么？",
    hi: "आपके सवाल के लिए धन्यवाद! मैं FIFA विश्व कप 2026 से संबंधित हर चीज़ में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?",
    it: "Grazie per la tua domanda! Sono qui per aiutarti con tutto ciò che riguarda la Coppa del Mondo FIFA 2026. Cosa vorresti sapere?",
    nl: "Bedankt voor je vraag! Ik ben hier om te helpen met alles over het FIFA WK 2026. Wat wil je weten?"
  };

  return generalResponses[language] || generalResponses['en'];
}

/**
 * Streams a response character by character, calling onChunk with accumulated text.
 * @param {string} fullText - Full response text
 * @param {Function} onChunk - Callback receiving accumulated text
 * @param {Object} [options] - Streaming options
 * @param {number} [options.charDelay=18] - Delay between characters in ms
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<string>} Full response text
 */
async function streamResponse(fullText, onChunk, options = {}) {
  const { charDelay = 18, signal = null } = options;
  let accumulated = '';

  for (let i = 0; i < fullText.length; i++) {
    if (signal && signal.aborted) {
      throw new DOMException('Stream aborted', 'AbortError');
    }

    accumulated += fullText[i];

    if (i % 2 === 0 || i === fullText.length - 1) {
      onChunk(accumulated);
    }

    await new Promise((resolve) => {
      const timer = setTimeout(resolve, charDelay + Math.random() * 10);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      }
    });
  }

  return accumulated;
}

/**
 * Processes a user message and generates a streamed AI response.
 * @param {string} userMessage - Raw user message
 * @param {Function} onChunk - Callback for streaming chunks
 * @param {Object} [options] - Processing options
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<{response: string, detectedLang: string, topic: string}>}
 */
async function processMessage(userMessage, onChunk, options = {}) {
  const sanitized = sanitizeInput(userMessage, { maxLength: 2000 });

  if (sanitized.trim().length === 0) {
    const errorMsg = 'Please enter a valid message.';
    onChunk(errorMsg);
    return { response: errorMsg, detectedLang: 'en', topic: 'error' };
  }

  const detectedLang = detectLanguage(sanitized);
  const topic = detectTopic(sanitized);
  const responseText = getResponse(topic, detectedLang);

  store.dispatch('chat.setTyping', true);

  try {
    const apiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : undefined;
    let fullResponse = '';

    if (apiKey) {
      if (apiKey.startsWith('gsk_')) {
        // Groq API (non-streaming to avoid proxy SSE issues)
        const systemInstruction = `You are the official AI Assistant for the FIFA World Cup 2026. 
Respond in the language of the user's prompt (Detected: ${detectedLang}).
Use this knowledge base:
${Object.entries(knowledgeBase.en).map(([k, v]) => `- ${k.toUpperCase()}: ${v}`).join('\n')}
If a question is outside this scope, politely state you only answer questions related to the FIFA World Cup 2026.`;

        const payload = {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage }
          ],
          stream: false,
          max_tokens: 1024
        };

        const response = await fetch('/api/groq/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload),
          signal: options.signal
        });

        if (!response.ok) {
          const errText = await response.text();

          throw new Error(`Groq API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || 'No response received.';

        // Simulate streaming on client side for typewriter effect
        fullResponse = await streamResponse(aiText, onChunk, { ...options, charDelay: 8 });
      } else {
        // Call Real Gemini API
        const systemInstruction = `You are the official AI Assistant for the FIFA World Cup 2026. 
Respond in the language of the user's prompt (Detected: ${detectedLang}).
Use this knowledge base:
${Object.entries(knowledgeBase.en).map(([k, v]) => `- ${k.toUpperCase()}: ${v}`).join('\n')}
If a question is outside this scope, politely state you only answer questions related to the FIFA World Cup 2026.`;

        const payload = {
          system_instruction: { parts: { text: systemInstruction } },
          contents: [{ role: "user", parts: [{ text: userMessage }] }]
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: options.signal
        });

        if (!response.ok) {
          throw new Error(`Gemini API Error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split('\n');
          buffer = lines.pop();
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.substring(6));
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  fullResponse += text;
                  onChunk(fullResponse);
                }
              } catch (e) {

              }
            }
          }
        }
      }
    } else {
      // Fallback to Mock Response
      fullResponse = await streamResponse(responseText, onChunk, options);
    }

    store.dispatch('chat.setTyping', false);

    return {
      response: fullResponse,
      detectedLang,
      topic
    };
  } catch (err) {

    store.dispatch('chat.setTyping', false);

    if (err.name === 'AbortError') throw err;

    const errorResponse = 'I apologize, but I encountered an error connecting to the AI service. Please check your API key or try again.';
    onChunk(errorResponse);
    return { response: errorResponse, detectedLang: 'en', topic: 'error' };
  }
}

export { processMessage, streamResponse, detectTopic, getResponse, knowledgeBase };
