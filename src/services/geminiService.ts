import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type AnalysisType = 'summary' | 'key-points' | 'sentiment' | 'tone' | 'critique';

export async function analyzeText(text: string, type: AnalysisType) {
  const prompts: Record<AnalysisType, string> = {
    'summary': 'Bu metni özlü ve anlaşılır bir şekilde özetle. Önemli bilgileri vurgula.',
    'key-points': 'Bu metinden en önemli 5-7 kilit noktayı liste halinde çıkar.',
    'sentiment': 'Bu metnin duygu durumunu analiz et. Pozitif, negatif veya nötr olduğunu belirt ve nedenlerini açıkla.',
    'tone': 'Bu metnin yazım dilini ve tonunu (akademik, dostane, saldırgan, profesyonel vb.) analiz et.',
    'critique': 'Bu metni yapıcı bir şekilde eleştir. Güçlü ve zayıf yönlerini belirt, geliştirme önerileri sun.'
  };

  const systemInstruction = `
    Sen "Synapse" adında premium bir metin analizi asistanısın. 
    Kullanıcılara yüksek kaliteli, derinlemesine ve profesyonel geri bildirimler sağlarsın. 
    Cevaplarını her zaman Markdown formatında ver. 
    Daima Türkçe yanıt ver.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `${prompts[type]}\n\nMetin: ${text}` }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || 'Maalesef bir sonuç üretilemedi.';
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    throw new Error('Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.');
  }
}
