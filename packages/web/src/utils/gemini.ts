import { GoogleGenAI, type Chat } from '@google/genai';
import type { Panchangam } from '@ishubhamx/panchangam-js';
import {
    tithiNames,
    nakshatraNames,
    yogaNames,
} from '@ishubhamx/panchangam-js';

// ─── API Key Management ────────────────────────────────────────────────
// Supports both env-provided key (for the app owner) and user-provided key (BYOK)
const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const STORAGE_KEY = 'gemini_user_api_key';

/**
 * Get the active API key — user-provided key takes priority (BYOK), then env key
 */
function getActiveKey(): string {
    return localStorage.getItem(STORAGE_KEY) || ENV_API_KEY || '';
}

let genAI: GoogleGenAI | null = null;
let genAIKeyHash = '';

function getGenAI(): GoogleGenAI | null {
    const key = getActiveKey();
    if (!key) return null;
    // Re-create instance if key changed (e.g. user set a new key)
    if (!genAI || genAIKeyHash !== key) {
        genAI = new GoogleGenAI({ apiKey: key });
        genAIKeyHash = key;
    }
    return genAI;
}

/**
 * Check if any API key is available (env or user-provided)
 */
export function isGeminiAvailable(): boolean {
    return !!getActiveKey();
}

/**
 * Check if the env-level key is set (app-owner key)
 */
export function hasEnvApiKey(): boolean {
    return !!ENV_API_KEY;
}

/**
 * Get the user-provided API key (from localStorage)
 */
export function getUserApiKey(): string {
    return localStorage.getItem(STORAGE_KEY) || '';
}

/**
 * Save a user-provided API key to localStorage
 */
export function setUserApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY, key.trim());
    // Reset genAI so it picks up the new key
    genAI = null;
    genAIKeyHash = '';
}

/**
 * Clear the user-provided API key
 */
export function clearUserApiKey(): void {
    localStorage.removeItem(STORAGE_KEY);
    genAI = null;
    genAIKeyHash = '';
}

/**
 * Format a Date to a readable time string in the given timezone
 */
function fmtTime(d: Date | null | undefined, tz: string): string {
    if (!d) return 'N/A';
    try {
        return new Date(d).toLocaleTimeString('en-IN', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return 'N/A';
    }
}

/**
 * Build a structured context string from Panchangam data
 */
export function buildPanchangContext(panchang: Panchangam, date: Date, timezone: string): string {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const lines: string[] = [
        `Date: ${date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone })}`,
        `Vara: ${weekdays[panchang.vara] || weekdays[date.getDay()]}`,
        ``,
        `--- Pancha Anga ---`,
        `Tithi: ${tithiNames[panchang.tithi] || panchang.tithi} (${panchang.paksha} Paksha)`,
        `Tithi Timing: ${fmtTime(panchang.tithiStartTime, timezone)} to ${fmtTime(panchang.tithiEndTime, timezone)}`,
        `Nakshatra: ${nakshatraNames[panchang.nakshatra] || panchang.nakshatra} (Pada ${panchang.nakshatraPada})`,
        `Nakshatra Timing: ${fmtTime(panchang.nakshatraStartTime, timezone)} to ${fmtTime(panchang.nakshatraEndTime, timezone)}`,
        `Yoga: ${yogaNames[panchang.yoga] || panchang.yoga}`,
        `Karana: ${panchang.karana}`,
        ``,
        `--- Sun & Moon ---`,
        `Sunrise: ${fmtTime(panchang.sunrise, timezone)}`,
        `Sunset: ${fmtTime(panchang.sunset, timezone)}`,
        `Moonrise: ${fmtTime(panchang.moonrise, timezone)}`,
        `Moon Rashi: ${panchang.moonRashi?.name || 'N/A'}`,
        `Sun Rashi: ${panchang.sunRashi?.name || 'N/A'}`,
        ``,
        `--- Calendar ---`,
        `Masa: ${panchang.masa?.name || 'N/A'}${panchang.masa?.isAdhika ? ' (Adhika)' : ''}`,
        `Ritu: ${panchang.ritu || 'N/A'}`,
        `Ayana: ${panchang.ayana || 'N/A'}`,
        `Samvat: Vikram ${panchang.samvat?.vikram || 'N/A'}, Shaka ${panchang.samvat?.shaka || 'N/A'}`,
        ``,
        `--- Muhurta & Timings ---`,
        `Brahma Muhurta: ${fmtTime(panchang.brahmaMuhurta?.start, timezone)} – ${fmtTime(panchang.brahmaMuhurta?.end, timezone)}`,
        `Abhijit Muhurta: ${fmtTime(panchang.abhijitMuhurta?.start, timezone)} – ${fmtTime(panchang.abhijitMuhurta?.end, timezone)}`,
        `Rahu Kalam: ${fmtTime(panchang.rahuKalamStart, timezone)} – ${fmtTime(panchang.rahuKalamEnd, timezone)}`,
        `Yamaganda Kalam: ${fmtTime(panchang.yamagandaKalam?.start, timezone)} – ${fmtTime(panchang.yamagandaKalam?.end, timezone)}`,
        `Gulika Kalam: ${fmtTime(panchang.gulikaKalam?.start, timezone)} – ${fmtTime(panchang.gulikaKalam?.end, timezone)}`,
    ];

    if (panchang.amritKalam?.length) {
        lines.push(`Amrit Kalam: ${panchang.amritKalam.map(a => `${fmtTime(a.start, timezone)} – ${fmtTime(a.end, timezone)}`).join(', ')}`);
    }
    if (panchang.varjyam?.length) {
        lines.push(`Varjyam: ${panchang.varjyam.map(v => `${fmtTime(v.start, timezone)} – ${fmtTime(v.end, timezone)}`).join(', ')}`);
    }

    if (panchang.specialYogas?.length) {
        lines.push(``);
        lines.push(`--- Special Yogas ---`);
        panchang.specialYogas.forEach(y => {
            lines.push(`${y.name}: ${y.description} (${y.isAuspicious ? 'Auspicious' : 'Inauspicious'})`);
        });
    }

    if (panchang.festivals?.length) {
        lines.push(``);
        lines.push(`--- Festivals ---`);
        panchang.festivals.forEach(f => {
            const name = typeof f === 'string' ? f : f.name;
            const category = typeof f === 'object' && f.category ? ` [${f.category}]` : '';
            lines.push(`• ${name}${category}`);
        });
    }

    if (panchang.planetaryPositions) {
        lines.push(``);
        lines.push(`--- Key Planetary Positions ---`);
        const planets = panchang.planetaryPositions;
        const planetList = [
            { name: 'Sun', p: planets.sun },
            { name: 'Moon', p: planets.moon },
            { name: 'Mars', p: planets.mars },
            { name: 'Jupiter', p: planets.jupiter },
            { name: 'Venus', p: planets.venus },
            { name: 'Saturn', p: planets.saturn },
            { name: 'Rahu', p: planets.rahu },
            { name: 'Ketu', p: planets.ketu },
        ];
        planetList.forEach(({ name, p }) => {
            if (p) {
                const retro = p.isRetrograde ? ' (R)' : '';
                lines.push(`${name}: ${p.rashiName} ${p.degree.toFixed(1)}°${retro} — ${p.dignity}`);
            }
        });
    }

    return lines.join('\n');
}

// ─── Daily Summary (Phase 1) ───────────────────────────────────────────

const SUMMARY_SYSTEM_PROMPT = `You are a knowledgeable Vedic astrology and Hindu Panchang expert. You will receive detailed Panchangam data for a specific day and provide an insightful, practical daily summary.

Your response should be structured as follows:
1. **🌟 Day Overview** (2-3 lines) — A quick general assessment of the day's energy.
2. **✅ Auspicious Activities** — What activities are favorable today based on the Tithi, Nakshatra, Yoga, and planetary positions.
3. **⚠️ Cautions** — Things to avoid, inauspicious windows (Rahu Kalam, Yamaganda, Varjyam), and any negative yogas.
4. **⏰ Best Times** — Highlight the best muhurta windows (Abhijit, Brahma Muhurta, Amrit Kalam).
5. **🎉 Festival/Special Note** — Only if there are festivals or special yogas. Briefly explain their significance and any recommended observances.

Rules:
- Be concise but informative. Keep the total response under 250 words.
- Use simple language that a general Hindu audience can understand.
- Do NOT make up information. Only interpret the data provided.
- Use emojis sparingly for section headers only.
- Format with markdown bold (**text**) for emphasis.
- Provide actionable advice, not just descriptions.`;

/**
 * Generate AI daily summary for a given Panchangam
 * Returns an async generator for streaming text
 */
export async function* generateDailySummary(
    panchang: Panchangam,
    date: Date,
    timezone: string,
): AsyncGenerator<string, void, unknown> {
    const ai = getGenAI();
    if (!ai) {
        throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
    }

    const context = buildPanchangContext(panchang, date, timezone);

    const result = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: SUMMARY_SYSTEM_PROMPT,
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: `Here is today's Panchangam data. Please provide a daily insight summary:\n\n${context}` }]
            }
        ]
    });

    for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
            yield text;
        }
    }
}

/**
 * Cache key for session storage
 */
export function getSummaryCacheKey(date: Date): string {
    return `ai_summary_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
}

// ─── Chat Session Support (Phase 2) ────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are "Jyotish AI", a friendly and knowledgeable Vedic astrology assistant embedded in a Hindu Panchangam web application. You help users understand daily Panchang data, muhurta timings, festivals, and Vedic astrology concepts.

You will be provided with today's Panchangam data as context with each message. Use this data to answer user questions accurately.

Capabilities:
- Explain Tithi, Nakshatra, Yoga, Karana and their significance
- Recommend auspicious timings (muhurta) for activities like travel, business, marriage, etc.
- Explain festivals, their significance, and recommended observances
- Interpret planetary positions and their general effects
- Explain concepts like Rahu Kalam, Yamaganda, Gulika Kalam, Amrit Kalam, Varjyam
- Discuss Panchak, Sankranti, Ekadashi, and other special periods
- Provide guidance on Disha Shoola (directional inauspiciousness)
- Explain Tarabalam and Chandrashtama concepts

Rules:
- Be concise and practical. Keep responses under 200 words unless the user asks for details.
- Use simple language a general Hindu audience can understand.
- ONLY use data that has been provided to you. Do NOT fabricate dates, timings, or planetary positions.
- If asked about a date other than today, politely tell the user that you can only interpret the currently displayed day's data.
- Use markdown bold (**text**) for emphasis and bullet points for lists.
- Be warm and respectful. Address the user politely.
- If unsure, say so honestly rather than guessing.
- Use emojis sparingly and tastefully.`;

/**
 * Create a new chat session with Vedic astrology context
 */
export function createChatSession(panchangContext: string): Chat | null {
    const ai = getGenAI();
    if (!ai) return null;

    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: CHAT_SYSTEM_PROMPT,
        },
        history: [
            {
                role: 'user',
                parts: [{ text: `Here is today's Panchangam data for reference. Use this to answer my questions:\n\n${panchangContext}` }],
            },
            {
                role: 'model',
                parts: [{ text: `🙏 Namaste! I've reviewed today's Panchangam data. I'm ready to help you with any questions about today's tithis, nakshatras, muhurta timings, festivals, or any Vedic astrology concepts. What would you like to know?` }],
            },
        ],
    });
}

/**
 * Send a chat message and stream the response
 */
export async function* sendChatMessage(
    session: Chat,
    message: string,
): AsyncGenerator<string, void, unknown> {
    const result = await session.sendMessageStream({
        message: message
    });

    for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
            yield text;
        }
    }
}
