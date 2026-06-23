import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;

  async moderateContent(
    title: string,
    content: string,
    lang = 'vi',
  ): Promise<{
    isApproved: boolean;
    label: string;
    reason?: string;
  }> {
    if (!this.apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not defined, skipping moderation (defaulting to approved).',
      );
      return { isApproved: true, label: 'clean' };
    }

    try {
      const languageText = lang === 'en' ? 'English' : 'Vietnamese';
      const prompt = `You are an AI content moderation assistant for the pet community app Pawdar.
Analyze the following post title and content to check if it contains severe profanity, swear words, harassment, hate speech, explicit adult content, or malicious spam.

Title: "${title}"
Content: "${content}"

CRITICAL INSTRUCTIONS:
- Do NOT be overly strict. Common pet terms, harmless slang, and standard descriptions (such as "đực húi", "chó đực", "mèo hoang", "phối giống") are completely CLEAN and MUST be approved. Only reject genuinely offensive, toxic, or vulgar language.
- The feedback "reason" MUST be written in ${languageText}.

Return the result as a raw JSON object only (no markdown code blocks):
{
  "isApproved": true or false,
  "label": "clean" | "profanity" | "offensive" | "spam",
  "reason": "Detailed rejection reason in ${languageText} explaining which specific words or parts violated the policy (set to null if isApproved is true)"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Gemini API Error: ${response.status} - ${errorText}`,
        );
        return { isApproved: true, label: 'clean' };
      }

      const data: any = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini API');
      }

      const result = JSON.parse(rawText.trim());
      return {
        isApproved: !!result.isApproved,
        label: result.label || 'clean',
        reason: result.reason || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to moderate content via Gemini', error);
      return { isApproved: true, label: 'clean' };
    }
  }
}
