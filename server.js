import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3100);
const DAILY_PROFILE_LIMIT = Number(process.env.DAILY_PROFILE_LIMIT || 50);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const TEXT_MODEL = process.env.TEXT_MODEL || 'gemini-2.5-flash-lite';
const IMAGE_MODEL = process.env.IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
const usageFilePath = path.join(__dirname, '.profile-usage.json');

const app = express();
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }
});

app.use(cors(FRONTEND_ORIGIN ? { origin: FRONTEND_ORIGIN } : undefined));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

function getKstDateString() {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
}

function loadUsage() {
    try {
        return JSON.parse(fs.readFileSync(usageFilePath, 'utf8'));
    } catch {
        return {};
    }
}

function saveUsage(usage) {
    fs.writeFileSync(usageFilePath, JSON.stringify(usage, null, 2), 'utf8');
}

function getUsageState() {
    const usage = loadUsage();
    const today = getKstDateString();
    const count = Number(usage[today] || 0);
    return { usage, today, count };
}

function incrementUsage() {
    const { usage, today, count } = getUsageState();
    usage[today] = count + 1;
    saveUsage(usage);
    return { used: usage[today], limit: DAILY_PROFILE_LIMIT };
}

function parseJsonResponse(rawText) {
    const trimmed = String(rawText || '').trim();
    const withoutFence = trimmed
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '');
    return JSON.parse(withoutFence);
}

async function extractTextFromResponse(response) {
    if (!response) return '';
    if (typeof response.text === 'string') return response.text;
    if (typeof response.text === 'function') return await response.text();

    const candidates = response.candidates || [];
    const first = candidates[0];
    const parts = first?.content?.parts || [];
    return parts
        .filter((part) => typeof part.text === 'string')
        .map((part) => part.text)
        .join('');
}

function extractInlineImage(response) {
    const candidates = response?.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    const imagePart = parts.find((part) => part.inlineData?.data);
    if (!imagePart) return '';

    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}

function decodeXmlEntities(value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function extractSlideTexts(slideXml) {
    const matches = [...slideXml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
    return matches
        .map((match) => decodeXmlEntities(match[1]))
        .filter(Boolean);
}

function parsePptxBuffer(buffer) {
    const zip = new AdmZip(buffer);
    const slideEntries = zip
        .getEntries()
        .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/i.test(entry.entryName))
        .sort((a, b) => {
            const aNum = Number(a.entryName.match(/slide(\d+)\.xml/i)?.[1] || 0);
            const bNum = Number(b.entryName.match(/slide(\d+)\.xml/i)?.[1] || 0);
            return aNum - bNum;
        });

    const slides = slideEntries.map((entry, index) => {
        const xml = entry.getData().toString('utf8');
        const texts = extractSlideTexts(xml);
        return {
            index: index + 1,
            text: texts.join('\n')
        };
    }).filter((slide) => slide.text.trim());

    return {
        slides,
        combinedText: slides.map((slide) => `[슬라이드 ${slide.index}]\n${slide.text}`).join('\n\n')
    };
}

function getTemplateGuide(templateType) {
    const guides = {
        'tarot-ppt': {
            label: '타로',
            imageMood: 'soft tarot reader portrait, elegant Korean spiritual consultant, studio portrait, gentle lighting'
        },
        'saju-ppt': {
            label: '사주',
            imageMood: 'professional saju consultant portrait, refined Korean fortune consultant, calm warm lighting, editorial portrait'
        },
        'sinjeom-ppt': {
            label: '신점',
            imageMood: 'confident spiritual advisor portrait, Korean spiritual consultant style, warm light, premium studio portrait'
        }
    };

    return guides[templateType] || guides['sinjeom-ppt'];
}

async function generateProfileTextFromInput(payload) {
    const guide = getTemplateGuide(payload.templateType);
    const prompt = `
너는 한국어 상담사 프로필 카피라이터다.
반드시 한국어로만 작성하고, 과장된 단정 표현은 피하고 신뢰감 있는 톤으로 쓴다.
응답은 JSON만 반환한다. 코드블록 없이 반환한다.

입력 정보:
- 분야: ${guide.label}
- 상담사명: ${payload.name}
- 전문분야: ${payload.specialty}
- 상담 톤: ${payload.tone}
- 경력/강점: ${payload.career}

반환 스키마:
{
  "eyebrow": "짧은 브랜딩 문구",
  "headline": "메인 제목 1개",
  "intro": "소개 문단 2문장",
  "sectionTitle": "중간 섹션 제목 1개",
  "sectionBody": "중간 설명 본문 2문장",
  "bulletPoints": ["짧은 포인트 1", "짧은 포인트 2", "짧은 포인트 3"],
  "cardTitle": "보조 카드 제목",
  "cardBody": "보조 카드 설명 2문장",
  "closingTitle": "마무리 제목",
  "closingBody": "마무리 설명 2문장"
}
`.trim();

    const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt
    });

    return parseJsonResponse(await extractTextFromResponse(response));
}

async function generateProfileTextFromPpt(payload, pptInfo) {
    const guide = getTemplateGuide(payload.templateType);
    const prompt = `
너는 한국어 상담사 소개 페이지를 만드는 에디토리얼 카피라이터다.
사용자가 업로드한 PPT 슬라이드 내용을 바탕으로, 웹 소개 페이지용 문구로 재구성해야 한다.
톤은 신뢰감 있고 읽기 쉬워야 하며, 원문 내용을 요약하고 정리하되 맥락은 유지한다.
응답은 JSON만 반환하고 코드블록 없이 출력한다.

분야: ${guide.label}
슬라이드 수: ${pptInfo.slides.length}

PPT 원문:
${pptInfo.combinedText}

반환 스키마:
{
  "eyebrow": "짧은 브랜딩 문구",
  "headline": "예시 이미지 같은 큰 메인 카피 1개",
  "intro": "상단 소개 문단 2~3문장",
  "sectionTitle": "중간 섹션 제목 1개",
  "sectionBody": "중간 설명 본문 2~3문장",
  "bulletPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "cardTitle": "하단 우측 카드 제목",
  "cardBody": "하단 우측 카드 설명 2문장",
  "closingTitle": "마무리 큰 제목",
  "closingBody": "마무리 설명 2문장"
}

추가 지침:
- headline은 강하고 간결해야 한다.
- bulletPoints는 실제 상담 포인트처럼 짧고 읽기 쉽게 만든다.
- PPT의 문장을 그대로 붙이기보다 웹 소개용 문체로 매끄럽게 다시 쓴다.
- 슬라이드에 상담사 이름이 드러나면 intro 안에 자연스럽게 녹여 넣는다.
`.trim();

    const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt
    });

    return parseJsonResponse(await extractTextFromResponse(response));
}

async function generatePortraitImage(payload, extraPrompt = '') {
    const guide = getTemplateGuide(payload.templateType);
    const portraitPrompt = `
Create one premium portrait photo for a ${guide.label} consultant profile page.
Reference style: ${payload.imageStyle || 'clean Korean studio portrait, premium consultation brand look'}
Extra context from uploaded material: ${extraPrompt || 'Build a refined, calm, trustworthy profile portrait.'}

Requirements:
- realistic professional portrait
- one person only
- upper body framing
- calm confident expression
- premium website hero image quality
- no text
- no watermark
- ${guide.imageMood}
`.trim();

    const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: portraitPrompt,
        config: {
            responseModalities: ['TEXT', 'IMAGE']
        }
    });

    return extractInlineImage(response);
}

function validateUsage(res) {
    const { count } = getUsageState();
    if (count >= DAILY_PROFILE_LIMIT) {
        res.status(429).json({
            error: `오늘 생성 한도 ${DAILY_PROFILE_LIMIT}개를 모두 사용했습니다.`,
            usage: { used: count, limit: DAILY_PROFILE_LIMIT }
        });
        return false;
    }
    return true;
}

function validateApiKey(res) {
    if (!ai) {
        res.status(500).json({
            error: 'GEMINI_API_KEY가 설정되지 않았습니다. 서버 .env에 API 키를 넣어주세요.'
        });
        return false;
    }
    return true;
}

app.get('/api/health', (_req, res) => {
    const { count } = getUsageState();
    res.json({
        ok: true,
        dailyLimit: DAILY_PROFILE_LIMIT,
        usedToday: count,
        hasApiKey: Boolean(GEMINI_API_KEY)
    });
});

app.post('/api/generate-profile', async (req, res) => {
    const payload = req.body || {};
    const requiredFields = ['templateType', 'name', 'specialty', 'tone', 'career'];
    const missingField = requiredFields.find((field) => !payload[field] || !String(payload[field]).trim());

    if (missingField) {
        return res.status(400).json({ error: `${missingField} 값이 비어 있습니다.` });
    }

    if (!validateUsage(res) || !validateApiKey(res)) return;

    try {
        const profile = await generateProfileTextFromInput(payload);
        let profileImage = '';

        if (payload.generateImage) {
            try {
                profileImage = await generatePortraitImage(payload, `${payload.name} / ${payload.specialty}`);
            } catch (imageError) {
                console.error('Image generation failed:', imageError);
            }
        }

        const usage = incrementUsage();
        res.json({
            profile: {
                ...profile,
                profileImage
            },
            usage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'AI 생성 중 오류가 발생했습니다. 모델 설정 또는 API 키를 확인해주세요.'
        });
    }
});

app.post('/api/generate-from-ppt', upload.single('pptFile'), async (req, res) => {
    const payload = req.body || {};
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'PPT 파일이 업로드되지 않았습니다.' });
    }

    if (!file.originalname.toLowerCase().endsWith('.pptx')) {
        return res.status(400).json({ error: '현재는 .pptx 형식만 지원합니다.' });
    }

    if (!validateUsage(res) || !validateApiKey(res)) return;

    try {
        const pptInfo = parsePptxBuffer(file.buffer);
        if (!pptInfo.slides.length) {
            return res.status(400).json({ error: 'PPT에서 읽을 수 있는 텍스트를 찾지 못했습니다.' });
        }

        const profile = await generateProfileTextFromPpt(payload, pptInfo);
        let profileImage = '';

        if (String(payload.generateImage) === 'true') {
            try {
                profileImage = await generatePortraitImage(payload, pptInfo.combinedText.slice(0, 1500));
            } catch (imageError) {
                console.error('Image generation failed:', imageError);
            }
        }

        const usage = incrementUsage();
        res.json({
            profile: {
                ...profile,
                profileImage
            },
            usage,
            meta: {
                slidesCount: pptInfo.slides.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'PPT 분석 또는 AI 재구성 중 오류가 발생했습니다.'
        });
    }
});

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Profile builder server running on http://localhost:${PORT}`);
});
