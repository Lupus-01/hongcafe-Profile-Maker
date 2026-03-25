document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('pb-app');
    const canvas = document.getElementById('pb-canvas');
    const tools = document.querySelectorAll('.pb-tool');
    const themeButtons = document.querySelectorAll('.pb-theme-btn');
    const imageUploader = document.getElementById('pb-image-uploader');

    const aiTemplate = document.getElementById('pb-ai-template');
    const aiName = document.getElementById('pb-ai-name');
    const aiSpecialty = document.getElementById('pb-ai-specialty');
    const aiTone = document.getElementById('pb-ai-tone');
    const aiCareer = document.getElementById('pb-ai-career');
    const aiImageStyle = document.getElementById('pb-ai-image-style');
    const aiGenerateImage = document.getElementById('pb-ai-generate-image');
    const aiGenerateButton = document.getElementById('pb-ai-generate-btn');
    const aiStatus = document.getElementById('pb-ai-status');

    const previewModal = document.getElementById('pb-modal');
    const previewArea = document.getElementById('pb-preview-area');
    const codeModal = document.getElementById('pb-code-modal');
    const codeOutput = document.getElementById('pb-code-output');
    const copyButton = document.getElementById('pb-copy-btn');

    let currentUploadTargetImg = null;
    let currentUploadPlaceholder = null;
    let currentBrandColor = '#C21129';
    let currentBrandBg = '#fdf0f1';
    let currentBrandLight = '#fbe6e8';

    const templates = {
        'tarot-ppt': {
            theme: 'pb-theme-tarot',
            variant: 'tarot',
            eyebrow: 'Tarot Profile',
            headline: 'AI가 작성할 타로 메인 카피',
            intro: '상담사의 성향과 강점을 기준으로 소개 문구가 자동으로 들어갑니다.',
            sectionTitle: '타로 상담의 매력을 정리하는 섹션',
            sectionBody: '속마음, 재회, 관계 흐름처럼 상담의 강점을 설명하는 본문 슬롯입니다.',
            points: ['AI 포인트 1', 'AI 포인트 2', 'AI 포인트 3'],
            cardTitle: 'AI가 정리한 타로 상담 포인트',
            cardBody: '전화 상담의 장점, 접근 방식, 추천 대상 등을 이 카드에 담습니다.',
            closingTitle: 'AI가 마무리 문구를 작성하는 영역',
            closingBody: '짧은 안내나 CTA 문구가 마지막 문단에 들어갑니다.',
            portraitPlaceholder: '타로 상담사 프로필 이미지',
            moodPlaceholder: '타로 분위기 이미지'
        },
        'saju-ppt': {
            theme: 'pb-theme-saju',
            variant: 'saju',
            eyebrow: 'Saju Profile',
            headline: 'AI가 작성할 사주 메인 카피',
            intro: '사주 상담사의 해석 스타일과 장점을 바탕으로 소개 문구를 자동 생성합니다.',
            sectionTitle: '사주 상담의 강점을 보여주는 섹션',
            sectionBody: '성향, 시기, 흐름에 강한 상담인지 설명하는 본문 슬롯입니다.',
            points: ['AI 포인트 1', 'AI 포인트 2', 'AI 포인트 3'],
            cardTitle: 'AI가 정리한 사주 상담 포인트',
            cardBody: '직업, 연애, 대인관계, 운 흐름 같은 보조 설명을 이 카드에 담습니다.',
            closingTitle: 'AI가 마무리 메시지를 작성하는 영역',
            closingBody: '부담 없는 권유 문구와 상담의 핵심 가치가 마지막에 들어갑니다.',
            portraitPlaceholder: '사주 상담사 프로필 이미지',
            moodPlaceholder: '사주 분위기 이미지'
        },
        'sinjeom-ppt': {
            theme: 'pb-theme-sinjeom',
            variant: 'sinjeom',
            eyebrow: 'Sinjeom Profile',
            headline: 'AI가 작성할 신점 메인 카피',
            intro: '전달 방식과 분위기에 맞춘 신점 소개 문구가 자동 생성됩니다.',
            sectionTitle: '신점 상담의 인상을 보여주는 섹션',
            sectionBody: '답답한 문제, 방향성, 속시원한 전달감 같은 특징을 정리하는 슬롯입니다.',
            points: ['AI 포인트 1', 'AI 포인트 2', 'AI 포인트 3'],
            cardTitle: 'AI가 정리한 신점 상담 포인트',
            cardBody: '내담자가 기대할 수 있는 상담 흐름과 메시지 톤을 이 카드에 담습니다.',
            closingTitle: 'AI가 마무리 문구를 작성하는 영역',
            closingBody: '짧은 권유 문장이나 상담 핵심 메시지가 마지막에 들어갑니다.',
            portraitPlaceholder: '신점 상담사 프로필 이미지',
            moodPlaceholder: '신점 분위기 이미지'
        }
    };

    function setStatus(message, type = 'idle') {
        aiStatus.textContent = message;
        aiStatus.dataset.state = type;
    }

    function applyTheme(themeName) {
        appContainer.classList.remove('pb-theme-tarot', 'pb-theme-saju', 'pb-theme-sinjeom');
        appContainer.classList.add(themeName);

        const button = [...themeButtons].find((item) => item.dataset.theme === themeName);
        if (!button) return;

        themeButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        currentBrandColor = button.dataset.color;
        currentBrandBg = button.dataset.bg;
        if (currentBrandColor === '#6335B4') currentBrandLight = '#ece5f7';
        else if (currentBrandColor === '#D67A00') currentBrandLight = '#faecd6';
        else currentBrandLight = '#fbe6e8';
    }

    function buildPresentationMarkup(type) {
        const template = templates[type];
        if (!template) return '';

        return `
            <section class="pb-presentation pb-presentation--${template.variant}" data-template-type="${type}">
                <div class="pb-presentation-hero">
                    <div class="pb-presentation-copy">
                        <div class="pb-presentation-eyebrow" contenteditable="true" data-slot="eyebrow">${template.eyebrow}</div>
                        <h2 class="pb-presentation-title" contenteditable="true" data-slot="headline">${template.headline}</h2>
                        <p class="pb-presentation-intro" contenteditable="true" data-slot="intro">${template.intro}</p>
                    </div>
                    <div class="pb-presentation-portrait pb-image-uploadable">
                        <div class="pb-upload-placeholder">${template.portraitPlaceholder}</div>
                        <img class="pb-uploaded-img" src="" alt="${template.portraitPlaceholder}">
                    </div>
                </div>
                <div class="pb-presentation-section">
                    <div class="pb-presentation-chip" contenteditable="true" data-slot="sectionTitle">${template.sectionTitle}</div>
                    <p class="pb-presentation-body" contenteditable="true" data-slot="sectionBody">${template.sectionBody}</p>
                </div>
                <div class="pb-presentation-grid">
                    <div class="pb-presentation-photo pb-image-uploadable">
                        <div class="pb-upload-placeholder">${template.moodPlaceholder}</div>
                        <img class="pb-uploaded-img" src="" alt="${template.moodPlaceholder}">
                    </div>
                    <div class="pb-presentation-side">
                        <ul class="pb-presentation-points" data-slot="bulletPoints">
                            ${template.points.map((point) => `<li contenteditable="true">${point}</li>`).join('')}
                        </ul>
                        <div class="pb-presentation-card">
                            <h3 contenteditable="true" data-slot="cardTitle">${template.cardTitle}</h3>
                            <p contenteditable="true" data-slot="cardBody">${template.cardBody}</p>
                        </div>
                    </div>
                </div>
                <div class="pb-presentation-closing">
                    <h3 contenteditable="true" data-slot="closingTitle">${template.closingTitle}</h3>
                    <p contenteditable="true" data-slot="closingBody">${template.closingBody}</p>
                </div>
            </section>`;
    }

    function buildElementMarkup(type) {
        switch (type) {
            case 'hero':
                return `
                    <div class="profile_header" style="width:100%; padding:40px 0; background:${currentBrandBg}; text-align:center; border-radius:16px; margin-bottom:24px;">
                        <div class="pb-image-uploadable" style="display:inline-block; position:relative; cursor:pointer;">
                            <div class="pb-upload-placeholder" style="width:100px; height:100px; border-radius:50%; background:#eaeaea; border:3px solid ${currentBrandLight}; display:flex; align-items:center; justify-content:center; font-size:12px; color:#888;">사진 등록</div>
                            <img class="pb-uploaded-img" src="" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid ${currentBrandLight}; display:none;">
                        </div>
                        <div class="profile_name" style="margin-top:12px; font-size:28px; font-weight:800; color:#111;" contenteditable="true">상담사 이름</div>
                        <div class="profile_text" style="margin-top:8px; font-size:15px; font-weight:600; color:${currentBrandColor};" contenteditable="true">대표 전문 분야와 한 줄 소개</div>
                    </div>`;
            case 'stats':
                return `
                    <div style="display:flex; justify-content:space-around; background:#fff; padding:24px 10px; border-radius:16px; border:1px solid #eaeaea; margin-bottom:24px; text-align:center;">
                        <div style="flex:1"><span style="display:block; font-size:22px; font-weight:800; color:${currentBrandColor}; margin-bottom:4px;" contenteditable="true">12년</span><span style="font-size:12px; color:#666; font-weight:500;" contenteditable="true">상담 경력</span></div>
                        <div style="flex:1"><span style="display:block; font-size:22px; font-weight:800; color:${currentBrandColor}; margin-bottom:4px;" contenteditable="true">3만+</span><span style="font-size:12px; color:#666; font-weight:500;" contenteditable="true">누적 상담</span></div>
                        <div style="flex:1"><span style="display:block; font-size:22px; font-weight:800; color:${currentBrandColor}; margin-bottom:4px;" contenteditable="true">98%</span><span style="font-size:12px; color:#666; font-weight:500;" contenteditable="true">재상담율</span></div>
                    </div>`;
            case 'specialty':
                return `
                    <div style="background:#fff; border:1px solid ${currentBrandLight}; border-radius:16px; padding:24px; margin-bottom:24px;">
                        <h4 style="margin:0 0 16px 0; color:${currentBrandColor}; font-size:16px; text-align:center; font-weight:800;" contenteditable="true">주요 전문 분야</h4>
                        <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px;">
                            <li style="font-size:15px; color:#222; display:flex; gap:8px;" contenteditable="true"><span style="color:${currentBrandColor}; font-weight:bold;">•</span> 관계와 속마음</li>
                            <li style="font-size:15px; color:#222; display:flex; gap:8px;" contenteditable="true"><span style="color:${currentBrandColor}; font-weight:bold;">•</span> 재회와 흐름 분석</li>
                        </ul>
                    </div>`;
            case 'highlight':
                return `
                    <div style="background:${currentBrandLight}; padding:24px; border-radius:12px; text-align:center; margin-bottom:24px;">
                        <div style="font-weight:800; font-size:18px; color:${currentBrandColor}; margin-bottom:10px;" contenteditable="true">이런 분께 추천합니다</div>
                        <div style="font-size:14px; color:#333; line-height:1.5;" contenteditable="true">답답한 관계를 정리하고 지금 필요한 방향을 또렷하게 알고 싶은 분.</div>
                    </div>`;
            case 'letter':
                return `
                    <div style="background:${currentBrandLight}; border-radius:16px; padding:32px 24px; margin-bottom:24px; text-align:center;">
                        <div style="font-size:28px; margin-bottom:12px;">💌</div>
                        <div style="font-size:18px; font-weight:800; color:${currentBrandColor}; margin-bottom:16px;" contenteditable="true">상담사 한마디</div>
                        <div style="font-size:15px; line-height:1.8; color:#333;" contenteditable="true">지금 가장 답답한 한 지점부터 차분하게 함께 정리해드릴게요.</div>
                    </div>`;
            case 'catchphrase':
                return `<div style="text-align:center; color:${currentBrandColor}; font-size:24px; font-weight:800; margin:40px 0; line-height:1.4; word-break:keep-all;" contenteditable="true">복잡한 마음의 흐름을<br>한 번에 읽어드립니다</div>`;
            case 'qa':
                return `
                    <div class="profile-section" style="margin-bottom:24px;">
                        <div class="subject" style="margin-top:32px;">
                            <div class="number" style="width:32px; height:32px; background:${currentBrandColor}; color:#fff; font-size:14px; font-weight:600; line-height:32px; border-radius:16px 16px 16px 0; text-align:center; margin-bottom:10px;">Q</div>
                            <div class="subject_text" style="margin-top:6px; font-size:20px; font-weight:bold; line-height:1.4; color:#111;" contenteditable="true">어떤 고민 상담에 특히 강한가요?</div>
                            <p class="content_text" style="margin-top:16px; margin-bottom:24px; padding:0 10px; text-align:left; line-height:1.6; font-size:15px; color:#444;" contenteditable="true">상대방의 마음, 관계 흐름, 재회 가능성처럼 감정의 결이 중요한 상담에 강합니다.</p>
                        </div>
                    </div>`;
            case 'review':
                return `
                    <div style="background:#fff; padding:24px; border-radius:16px; border:1px solid #eaeaea; position:relative; margin-bottom:24px; text-align:left;">
                        <div style="font-size:12px; color:#666; background:#f5f5f5; padding:4px 10px; border-radius:20px; display:inline-block; font-weight:600; margin-bottom:12px;" contenteditable="true">30대 여성 / 연애 상담</div>
                        <div style="color:${currentBrandColor}; font-size:14px; margin-bottom:8px; letter-spacing:2px;">★★★★★</div>
                        <div style="font-weight:800; font-size:17px; margin-bottom:8px; color:#111; line-height:1.4;" contenteditable="true">답답했던 흐름이 한 번에 정리됐어요.</div>
                        <div style="font-size:14.5px; color:#444; line-height:1.6;" contenteditable="true">상대방 마음을 너무 단정하지 않게 풀어주셔서 오히려 더 현실적으로 받아들일 수 있었습니다.</div>
                    </div>`;
            case 'text':
                return `<div style="font-size:15px; padding:0 10px; margin-bottom:24px; color:#333; line-height:1.7;" contenteditable="true">본문 텍스트를 입력하는 영역입니다.</div>`;
            case 'quote':
                return `<blockquote style="margin:24px 0; padding:16px 20px; border-left:4px solid ${currentBrandColor}; background:${currentBrandLight}; border-radius:0 12px 12px 0; font-style:italic; font-weight:500; font-size:15px; color:#222;" contenteditable="true">마음의 답은 이미 흐르고 있고, 상담은 그 흐름을 읽는 과정입니다.</blockquote>`;
            case 'hashtag':
                return `<div class="pb-el-hashtags"><span contenteditable="true">#속마음상담</span><span contenteditable="true">#재회상담</span><span contenteditable="true">#관계흐름</span></div>`;
            case 'image':
                return `
                    <div class="pb-image-uploadable" style="width:100%; text-align:center; margin-bottom:24px; cursor:pointer;">
                        <div class="pb-upload-placeholder" style="width:100%; height:200px; background:#eaeaea; border:1px dashed #ccc; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#888;">클릭해서 이미지 첨부</div>
                        <img class="pb-uploaded-img" src="" style="width:100%; max-width:600px; border-radius:12px; display:none; margin:0 auto;">
                    </div>`;
            case 'title-divider':
                return `<div style="display:flex; align-items:center; text-align:center; color:${currentBrandColor}; font-weight:800; font-size:16px; margin:40px 0;"><hr style="flex:1; border:none; border-bottom:1px solid ${currentBrandColor}; opacity:0.3; margin:0 15px;"><span contenteditable="true">상담 안내</span><hr style="flex:1; border:none; border-bottom:1px solid ${currentBrandColor}; opacity:0.3; margin:0 15px;"></div>`;
            case 'icon-divider':
                return `<div class="pb-el-icon-divider">✦ ✦ ✦</div>`;
            case 'divider':
                return `<hr style="border:none; border-top:1px solid #eaeaea; margin:40px auto; width:60%;">`;
            case 'spacer':
                return `<div class="pb-el-spacer" style="height:50px; width:100%; border:1px dashed #ccc; text-align:center; line-height:50px; color:#999; font-size:12px;">투명 여백</div>`;
            case 'tarot-ppt':
            case 'saju-ppt':
            case 'sinjeom-ppt':
                return buildPresentationMarkup(type);
            default:
                return '';
        }
    }

    function bindUploadables(root) {
        root.querySelectorAll('.pb-image-uploadable').forEach((uploadableArea) => {
            uploadableArea.addEventListener('click', function () {
                currentUploadTargetImg = this.querySelector('.pb-uploaded-img');
                currentUploadPlaceholder = this.querySelector('.pb-upload-placeholder');
                imageUploader.click();
            });
        });
    }

    function makeCanvasElement(type) {
        const markup = buildElementMarkup(type);
        if (!markup) return null;

        const element = document.createElement('div');
        element.className = 'pb-element';
        element.dataset.type = type;
        element.innerHTML = markup;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'pb-delete-btn';
        deleteButton.innerHTML = '×';
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', () => element.remove());
        element.appendChild(deleteButton);

        bindUploadables(element);
        return element;
    }

    function clearEmptyState() {
        const emptyState = canvas.querySelector('.pb-empty-state');
        if (emptyState) emptyState.remove();
    }

    function appendElement(type) {
        clearEmptyState();
        const element = makeCanvasElement(type);
        if (element) canvas.appendChild(element);
        return element;
    }

    function replaceCanvasWithElement(type) {
        canvas.innerHTML = '';
        const element = makeCanvasElement(type);
        if (element) canvas.appendChild(element);
        return element;
    }

    function fillPresentation(element, payload) {
        if (!element || !payload) return;

        const slotMap = {
            eyebrow: payload.eyebrow,
            headline: payload.headline,
            intro: payload.intro,
            sectionTitle: payload.sectionTitle,
            sectionBody: payload.sectionBody,
            cardTitle: payload.cardTitle,
            cardBody: payload.cardBody,
            closingTitle: payload.closingTitle,
            closingBody: payload.closingBody
        };

        Object.entries(slotMap).forEach(([slot, value]) => {
            if (!value) return;
            const node = element.querySelector(`[data-slot="${slot}"]`);
            if (node) node.innerHTML = value.replace(/\n/g, '<br>');
        });

        if (Array.isArray(payload.bulletPoints)) {
            const list = element.querySelector('[data-slot="bulletPoints"]');
            if (list) {
                list.innerHTML = payload.bulletPoints.map((item) => `<li contenteditable="true">${item}</li>`).join('');
            }
        }

        if (payload.profileImage) {
            const portrait = element.querySelector('.pb-presentation-portrait');
            const img = portrait?.querySelector('.pb-uploaded-img');
            const placeholder = portrait?.querySelector('.pb-upload-placeholder');
            if (img && placeholder) {
                img.src = payload.profileImage;
                img.style.display = 'block';
                placeholder.style.display = 'none';
            }
        }

        if (payload.moodImage) {
            const mood = element.querySelector('.pb-presentation-photo');
            const img = mood?.querySelector('.pb-uploaded-img');
            const placeholder = mood?.querySelector('.pb-upload-placeholder');
            if (img && placeholder) {
                img.src = payload.moodImage;
                img.style.display = 'block';
                placeholder.style.display = 'none';
            }
        }
    }

    function getCleanCanvasClone() {
        const clone = canvas.cloneNode(true);
        const empty = clone.querySelector('.pb-empty-state');
        if (empty) empty.remove();
        clone.querySelectorAll('.pb-delete-btn').forEach((button) => button.remove());
        clone.querySelectorAll('[contenteditable]').forEach((node) => node.removeAttribute('contenteditable'));

        clone.querySelectorAll('.pb-image-uploadable').forEach((uploadable) => {
            const img = uploadable.querySelector('.pb-uploaded-img');
            const placeholder = uploadable.querySelector('.pb-upload-placeholder');
            if (!img || !img.src || img.src === window.location.href) {
                if (placeholder) placeholder.remove();
            } else if (placeholder) {
                placeholder.remove();
            }
        });

        const wrappers = clone.querySelectorAll('.pb-element');
        wrappers.forEach((wrapper) => {
            while (wrapper.firstChild) {
                wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            }
            wrapper.parentNode.removeChild(wrapper);
        });

        return clone;
    }

    async function requestAiProfile() {
        const templateType = aiTemplate.value;
        const templateConfig = templates[templateType];
        const name = aiName.value.trim();
        const specialty = aiSpecialty.value.trim();
        const tone = aiTone.value.trim();
        const career = aiCareer.value.trim();
        const imageStyle = aiImageStyle.value.trim();

        if (!name || !specialty || !tone || !career) {
            setStatus('상담사명, 전문분야, 상담 톤, 경력/강점을 먼저 입력해주세요.', 'error');
            return;
        }

        aiGenerateButton.disabled = true;
        setStatus('AI가 프로필 문구와 이미지를 생성하는 중입니다...', 'loading');

        try {
            const response = await fetch('/api/generate-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateType,
                    name,
                    specialty,
                    tone,
                    career,
                    imageStyle,
                    generateImage: aiGenerateImage.checked
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || '생성 요청에 실패했습니다.');
            }

            applyTheme(templateConfig.theme);
            const element = replaceCanvasWithElement(templateType);
            fillPresentation(element, data.profile);

            if (data.usage) {
                setStatus(`생성이 완료되었습니다. 오늘 사용량 ${data.usage.used}/${data.usage.limit}`, 'success');
            } else {
                setStatus('생성이 완료되었습니다.', 'success');
            }
        } catch (error) {
            setStatus(error.message || 'AI 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            aiGenerateButton.disabled = false;
        }
    }

    themeButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            applyTheme(event.currentTarget.dataset.theme);
        });
    });

    tools.forEach((tool) => {
        tool.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('type', tool.dataset.type);
        });
    });

    canvas.addEventListener('dragover', (event) => event.preventDefault());
    canvas.addEventListener('drop', (event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('type');
        if (type) appendElement(type);
    });

    imageUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file || !currentUploadTargetImg || !currentUploadPlaceholder) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            currentUploadTargetImg.src = loadEvent.target.result;
            currentUploadTargetImg.style.display = 'block';
            currentUploadPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    });

    document.getElementById('pb-preview-btn').addEventListener('click', () => {
        previewArea.innerHTML = '';
        previewArea.style.backgroundColor = currentBrandBg;
        previewArea.appendChild(getCleanCanvasClone());
        previewModal.classList.add('active');
    });

    document.getElementById('pb-close-modal').addEventListener('click', () => previewModal.classList.remove('active'));

    document.getElementById('pb-clear-btn').addEventListener('click', () => {
        if (!window.confirm('캔버스에 추가한 모든 블록을 지울까요?')) return;
        canvas.innerHTML = `
            <div class="pb-empty-state">
                <div class="pb-empty-icon">드래그</div>
                <p>왼쪽 블록을 끌어와 프로필을 만들거나, AI 프로필 생성 버튼으로 바로 시작하세요.</p>
            </div>`;
    });

    document.getElementById('pb-export-btn').addEventListener('click', () => {
        const cleanCanvas = getCleanCanvasClone();
        cleanCanvas.querySelectorAll('.pb-el-spacer').forEach((node) => {
            node.innerHTML = '';
            node.style.border = 'none';
        });

        codeOutput.value = `
<center>
<div class="profile_v02" style="font-family:'Noto Sans KR', sans-serif; margin-top:0; max-width:600px; text-align:left; line-height:1.6; color:#111;">
${cleanCanvas.innerHTML}
</div>
</center>`.trim();
        codeModal.classList.add('active');
    });

    document.getElementById('pb-close-code-modal').addEventListener('click', () => codeModal.classList.remove('active'));

    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(codeOutput.value);
            copyButton.innerText = '복사 완료';
            copyButton.style.background = '#28a745';
            setTimeout(() => {
                copyButton.innerText = '복사하기';
                copyButton.style.background = '#007acc';
            }, 2000);
        } catch (error) {
            codeOutput.select();
            document.execCommand('copy');
        }
    });

    aiGenerateButton.addEventListener('click', requestAiProfile);
    applyTheme('pb-theme-sinjeom');
});
