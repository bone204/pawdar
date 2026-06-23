import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;

  async moderateContent(
    title: string,
    content: string,
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
      const prompt = `Bạn là một hệ thống kiểm duyệt bài viết tự động bằng tiếng Việt cho ứng dụng thú cưng Pawdar.
Nhiệm vụ của bạn là kiểm duyệt tiêu đề và nội dung bài viết sau xem có từ ngữ thô tục, xúc phạm, chửi thề, nội dung không lành mạnh, quấy rối hoặc spam hay không.

Tiêu đề: "${title}"
Nội dung: "${content}"

Yêu cầu kết quả trả về dưới dạng JSON với cấu trúc sau:
{
  "isApproved": true hoặc false,
  "label": "clean" | "profanity" | "offensive" | "spam",
  "reason": "Lý do từ chối cụ thể bằng tiếng Việt (nếu isApproved = false, ghi rõ các từ ngữ thô tục/không phù hợp vi phạm, nếu isApproved = true để null)"
}

Chỉ trả về chuỗi JSON thô, không định dạng markdown.`;

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
