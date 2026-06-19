"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
require("dotenv/config");
const prisma = new client_1.PrismaClient();
async function callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        throw new Error('GEMINI_API_KEY is not set in .env');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.3,
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
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
}
async function translateBreed(breed) {
    const prompt = `
You are a Vietnamese translator specializing in pet terminology.
Translate the following pet breed information from English to natural Vietnamese.
Return ONLY a valid JSON object, no markdown, no explanation.

Input:
${JSON.stringify({
        nameEn: breed.nameEn,
        descriptionEn: breed.descriptionEn,
        temperamentEn: breed.temperamentEn,
        originEn: breed.originEn,
    }, null, 2)}

Output format (all values in Vietnamese, use null if the input field was null):
{
  "nameVi": "...",
  "descriptionVi": "..." or null,
  "temperamentVi": "..." or null,
  "originVi": "..." or null
}

Rules:
- Keep breed names that are proper nouns (e.g. "Poodle", "Siamese") as-is or add a short Vietnamese label
- Translate descriptions to natural Vietnamese prose
- For temperament, translate each trait naturally (e.g. "Active, Playful" → "Năng động, Vui tươi")
- For origin, translate country/region names to Vietnamese
`.trim();
    const rawJson = await callGemini(prompt);
    try {
        const parsed = JSON.parse(rawJson);
        return {
            nameVi: parsed.nameVi ?? breed.nameEn,
            descriptionVi: parsed.descriptionVi ?? null,
            temperamentVi: parsed.temperamentVi ?? null,
            originVi: parsed.originVi ?? null,
        };
    }
    catch {
        console.warn(`  ⚠ Failed to parse JSON for breed "${breed.nameEn}", using fallback`);
        return {
            nameVi: breed.nameEn,
            descriptionVi: breed.descriptionEn,
            temperamentVi: breed.temperamentEn,
            originVi: breed.originEn,
        };
    }
}
async function main() {
    console.log('🚀 Starting breed translation script...\n');
    const untranslated = await prisma.breed.findMany({
        where: { isTranslated: false },
        orderBy: { nameEn: 'asc' },
    });
    if (untranslated.length === 0) {
        console.log('✅ All breeds are already translated!');
    }
    else {
        console.log(`📋 Found ${untranslated.length} breeds to translate\n`);
        let successCount = 0;
        let failCount = 0;
        for (let i = 0; i < untranslated.length; i++) {
            const breed = untranslated[i];
            const progress = `[${i + 1}/${untranslated.length}]`;
            try {
                process.stdout.write(`${progress} Translating "${breed.nameEn}"...`);
                const translation = await translateBreed(breed);
                await prisma.breed.update({
                    where: { id: breed.id },
                    data: {
                        nameVi: translation.nameVi,
                        descriptionVi: translation.descriptionVi,
                        temperamentVi: translation.temperamentVi,
                        originVi: translation.originVi,
                        isTranslated: true,
                    },
                });
                console.log(` → "${translation.nameVi}" ✓`);
                successCount++;
                if (i < untranslated.length - 1) {
                    await new Promise((r) => setTimeout(r, 300));
                }
            }
            catch (error) {
                console.log(` ✗ ERROR: ${error.message}`);
                failCount++;
            }
        }
        console.log(`\n📊 Translation complete: ${successCount} success, ${failCount} failed`);
    }
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
});
//# sourceMappingURL=translate-breeds.js.map