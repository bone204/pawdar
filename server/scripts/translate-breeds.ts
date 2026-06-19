/**
 * Breed Auto-Translation Script
 *
 * This script does two things:
 * 1. Translates all untranslated breeds in the DB using Gemini AI
 * 2. Exports all translated breeds to prisma/seeds/breeds.json
 *    so they can be re-seeded after a db:reset without calling APIs again
 *
 * Usage:
 *   npx ts-node scripts/translate-breeds.ts
 *
 * Requirements:
 *   - GEMINI_API_KEY in .env
 *   - Breeds already synced (run POST /breeds/sync first)
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ──────────────────────────────────────────────────────────────────────────────
// Local rule-based translation dictionary and functions
// ──────────────────────────────────────────────────────────────────────────────
const translationDictionary: Record<string, string> = {
  // Origins
  'Egypt': 'Ai Cập',
  'United States': 'Mỹ',
  'United Kingdom': 'Vương quốc Anh',
  'France': 'Pháp',
  'Germany': 'Đức',
  'Canada': 'Canada',
  'China': 'Trung Quốc',
  'Siberia': 'Siberi',
  'Mexico': 'Mexico',
  'Thailand': 'Thái Lan',
  'Iran (Persia)': 'Iran (Ba Tư)',
  'Japan': 'Nhật Bản',
  'Russia': 'Nga',
  'Turkey': 'Thổ Nhĩ Kỳ',
  'Isle of Man': 'Đảo Man',
  'Burma': 'Miến Điện',
  'Somalia': 'Somalia',
  'Singapore': 'Singapore',

  // Temperaments
  'Active': 'Năng động',
  'Energetic': 'Tràn đầy năng lượng',
  'Independent': 'Độc lập',
  'Intelligent': 'Thông minh',
  'Gentle': 'Hiền lành',
  'Curious': 'Tò mò',
  'Easy Going': 'Dễ gần',
  'Playful': 'Ham chơi',
  'Calm': 'Điềm tĩnh',
  'Alert': 'Cảnh giác',
  'Agile': 'Nhanh nhẹn',
  'Loving': 'Giàu tình cảm',
  'Loyal': 'Trung thành',
  'Quiet': 'Yên lặng',
  'Sweet': 'Ngọt ngào',
  'Friendly': 'Thân thiện',
  'Social': 'Thích xã giao',
  'Vocal': 'Hay kêu',
  'Devoted': 'Tận tụy',
  'Lively': 'Sinh động',
  'Quick': 'Nhanh nhẹn',
  'Courageous': 'Dũng cảm',
  'Clever': 'Khéo léo',
  'Stubborn': 'Bướng bỉnh',
  'Affectionate': 'Trìu mến',
  'Athletic': 'Khỏe khoắn',
  'Bright': 'Sáng dạ',
  'Obedient': 'Vâng lời',
  'Watchful': 'Chu đáo',
  'Kind': 'Tử tế',
  'Reliable': 'Đáng tin cậy',
  'Trustworthy': 'Đáng tin',
  'Docile': 'Dễ bảo',
  'Charming': 'Duyên dáng',
  'Sociable': 'Hòa đồng',
  'Attentive': 'Chăm chú',
  'Outgoing': 'Cởi mở',
  'Trusting': 'Tin cậy',
  'Even Tempered': 'Bình tĩnh',
  'Proud': 'Kiêu hãnh',
  'Very Smart': 'Rất thông minh',
};

function localTranslateTemperament(temperament: string | null): string | null {
  if (!temperament) return null;
  return temperament
    .split(',')
    .map(t => t.trim())
    .map(t => {
      const matched = Object.entries(translationDictionary).find(
        ([en]) => en.toLowerCase() === t.toLowerCase()
      );
      return matched ? matched[1] : t;
    })
    .join(', ');
}

function localTranslateOrigin(origin: string | null): string | null {
  if (!origin) return null;
  return origin
    .split(',')
    .map(o => o.trim())
    .map(o => {
      const matched = Object.entries(translationDictionary).find(
        ([en]) => en.toLowerCase() === o.toLowerCase()
      );
      return matched ? matched[1] : o;
    })
    .join(', ');
}

async function localTranslateDescription(
  description: string | null,
  nameVi: string,
  originVi: string | null,
  temperamentVi: string | null,
  petType: string
): Promise<string | null> {
  if (!description) return null;
  try {
    const encodedText = encodeURIComponent(description);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|vi`;
    const response = await fetch(url);
    if (response.ok) {
      const data: any = await response.json();
      const translated = data.responseData?.translatedText;
      if (translated && !translated.includes('MYMEMORY WARNING')) {
        return translated.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
      }
    }
  } catch {
    // Fallback to auto-generation
  }

  // Fallback: Auto-generate natural Vietnamese description
  const typeWord = petType === 'cat' ? 'mèo' : 'chó';
  let sentence = `${nameVi} là giống ${typeWord} tuyệt vời`;
  if (originVi) {
    sentence += ` có nguồn gốc từ ${originVi}`;
  }
  sentence += `.`;
  if (temperamentVi) {
    const lowerTemperament = temperamentVi.charAt(0).toLowerCase() + temperamentVi.slice(1);
    sentence += ` Chúng nổi tiếng với các đặc điểm tính cách như ${lowerTemperament}.`;
  }
  return sentence;
}

function localTranslateBreedName(nameEn: string, id: string): string {
  const isCat = id.startsWith('cat_');
  
  // Custom mapping for popular ones
  const popularMap: Record<string, string> = {
    'Abyssinian': 'Mèo Abyssinian',
    'American Shorthair': 'Mèo Mỹ lông ngắn',
    'Bengal': 'Mèo Bengal',
    'British Shorthair': 'Mèo Anh lông ngắn',
    'Maine Coon': 'Mèo Maine Coon',
    'Persian': 'Mèo Ba Tư',
    'Ragdoll': 'Mèo Ragdoll',
    'Siamese': 'Mèo Xiêm',
    'Sphynx': 'Mèo không lông Sphynx',
    'Chihuahua': 'Chó Chihuahua',
    'Dachshund': 'Chó Lạp Xưởng (Dachshund)',
    'French Bulldog': 'Chó Bulldog Pháp',
    'German Shepherd': 'Chó Béc-giê Đức (German Shepherd)',
    'Golden Retriever': 'Chó Golden Retriever',
    'Labrador Retriever': 'Chó Labrador Retriever',
    'Poodle': 'Chó Poodle',
    'Pug': 'Chó Pug',
    'Siberian Husky': 'Chó Husky Siberia',
  };

  if (popularMap[nameEn]) {
    return popularMap[nameEn];
  }

  // Fallback
  return isCat ? `Mèo ${nameEn}` : `Chó ${nameEn}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Gemini API call
// ──────────────────────────────────────────────────────────────────────────────
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in .env');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3, // Low temperature = more consistent translations
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data: any = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
}

// ──────────────────────────────────────────────────────────────────────────────
// Translate a single breed using Gemini
// ──────────────────────────────────────────────────────────────────────────────
interface BreedToTranslate {
  id: string;
  nameEn: string;
  descriptionEn: string | null;
  temperamentEn: string | null;
  originEn: string | null;
}

interface TranslatedBreed {
  id: string;
  nameVi: string;
  descriptionVi: string | null;
  temperamentVi: string | null;
  originVi: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Translate a batch of breeds using Gemini
// ──────────────────────────────────────────────────────────────────────────────
async function translateBreedBatch(breeds: BreedToTranslate[]): Promise<TranslatedBreed[]> {
  try {
    const prompt = `
You are a Vietnamese translator specializing in pet terminology.
Translate the following array of pet breeds from English to natural Vietnamese.
Return ONLY a valid JSON array of objects, no markdown, no explanation.

Input:
${JSON.stringify(
  breeds.map(b => ({
    id: b.id,
    nameEn: b.nameEn,
    descriptionEn: b.descriptionEn,
    temperamentEn: b.temperamentEn,
    originEn: b.originEn,
  })),
  null,
  2
)}

Output format:
[
  {
    "id": "...",
    "nameVi": "...",
    "descriptionVi": "..." or null,
    "temperamentVi": "..." or null,
    "originVi": "..." or null
  }
]

Rules:
- Keep breed names that are proper nouns (e.g. "Poodle", "Siamese", "Husky") as-is, but you can translate or adapt if there is a common Vietnamese name (e.g. "Poodle" can remain "Poodle", "Siberian Husky" can be "Husky Siberia" or "Siberian Husky").
- Translate descriptions to natural, fluent Vietnamese.
- For temperament, translate each trait naturally (e.g. "Active, Playful" → "Năng động, Vui tươi").
- For origin, translate country/region names to Vietnamese (e.g. "Egypt" → "Ai Cập", "United States" → "Mỹ", "United Kingdom" → "Vương quốc Anh").
`.trim();

    const rawJson = await callGemini(prompt);

    // Strip potential markdown wrapping if Gemini didn't obey responseMimeType perfectly
    let cleanJson = rawJson.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson) as TranslatedBreed[];
    
    // Map back to ensure we have all fields for each requested breed
    return breeds.map(original => {
      const match = parsed.find(p => p.id === original.id);
      return {
        id: original.id,
        nameVi: match?.nameVi ?? original.nameEn,
        descriptionVi: match?.descriptionVi ?? original.descriptionEn,
        temperamentVi: match?.temperamentVi ?? original.temperamentEn,
        originVi: match?.originVi ?? original.originEn,
      };
    });
  } catch (error: any) {
    // Reraise Gemini error to make sure we don't proceed with fallback
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting breed translation script...\n');

  console.log('🔄 Smart-resetting failed translations (where description fell back to English)...');
  const existingBreeds = await prisma.breed.findMany();
  let resetCount = 0;
  for (const b of existingBreeds) {
    if (b.descriptionEn && b.descriptionVi && b.descriptionEn === b.descriptionVi) {
      await prisma.breed.update({
        where: { id: b.id },
        data: {
          descriptionVi: null,
          isTranslated: false,
        },
      });
      resetCount++;
    }
  }
  console.log(`  ✓ Reset ${resetCount} breeds to translate again\n`);

  // Fetch all untranslated breeds
  const untranslated = await prisma.breed.findMany({
    where: { isTranslated: false },
    orderBy: { nameEn: 'asc' },
  });

  if (untranslated.length === 0) {
    console.log('✅ All breeds are already translated!');
  } else {
    console.log(`📋 Found ${untranslated.length} breeds to translate\n`);

    let successCount = 0;
    let failCount = 0;
    const batchSize = 10;

    for (let i = 0; i < untranslated.length; i += batchSize) {
      const batch = untranslated.slice(i, i + batchSize);
      const progress = `[Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(untranslated.length / batchSize)}]`;

      try {
        console.log(`${progress} Translating ${batch.length} breeds (${batch.map(b => b.nameEn).join(', ')})...`);

        const translations = await translateBreedBatch(batch);

        for (const translation of translations) {
          await prisma.breed.update({
            where: { id: translation.id },
            data: {
              nameVi: translation.nameVi,
              descriptionVi: translation.descriptionVi,
              temperamentVi: translation.temperamentVi,
              originVi: translation.originVi,
              isTranslated: true,
            },
          });
          successCount++;
        }

        console.log(`  ✓ Successfully translated and updated batch`);

        // Delay between batch requests to completely avoid rate limiting
        if (i + batchSize < untranslated.length) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (error: any) {
        if (error.message.includes('429')) {
          console.log(`  ⚠ Rate limit hit (429). Waiting 30 seconds before retrying batch...`);
          await new Promise((r) => setTimeout(r, 30000));
          i -= batchSize; // Retry the same batch
        } else {
          console.log(`  ✗ Batch Translation ERROR: ${error.message}`);
          failCount += batch.length;
        }
      }
    }

    console.log(`\n📊 Translation complete: ${successCount} success, ${failCount} failed`);
  }

  // ────────────────────────────────────────────────────────
  // Export ALL translated breeds to JSON seed file
  // This file is committed to git so db:reset can restore data
  // ────────────────────────────────────────────────────────
  console.log('\n💾 Exporting all breeds to seed file...');

  const allBreeds = await prisma.breed.findMany({
    orderBy: [{ petType: 'asc' }, { nameEn: 'asc' }],
  });

  const seedDir = path.join(__dirname, '..', 'prisma', 'seeds');
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
  }

  const seedFilePath = path.join(seedDir, 'breeds.json');
  fs.writeFileSync(seedFilePath, JSON.stringify(allBreeds, null, 2), 'utf-8');

  console.log(`✅ Exported ${allBreeds.length} breeds to: prisma/seeds/breeds.json`);
  console.log('\n🎉 Done! You can now commit prisma/seeds/breeds.json to your repository.');
  console.log('   After any db:reset, running "npm run db:seed" will restore all breed data.\n');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
