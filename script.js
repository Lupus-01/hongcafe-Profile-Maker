document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('pb-app');
    const canvas = document.getElementById('pb-canvas');
    const tools = document.querySelectorAll('.pb-tool');
    const themeButtons = document.querySelectorAll('.pb-theme-btn');
    const imageUploader = document.getElementById('pb-image-uploader');

    const pptTemplate = document.getElementById('pb-ppt-template');
    const pptFile = document.getElementById('pb-ppt-file');
    const pptImageStyle = document.getElementById('pb-ppt-image-style');
    const pptGenerateImage = document.getElementById('pb-ppt-generate-image');
    const pptGenerateButton = document.getElementById('pb-ppt-generate-btn');
    const pptStatus = document.getElementById('pb-ppt-status');

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
            eyebrow: 'Tarot Editorial',
            headline: '타로를 보면, 숨겨진 마음의 결이 보입니다',
            intro: '타로를 통해 관계와 감정의 흐름을 읽고, 지금 필요한 방향을 차분하게 정리합니다.',
            sectionTitle: '전화타로, 어떤 점이 매력적인가요?',
            sectionBody: '속마음과 관계 흐름처럼 말로 설명하기 어려운 감정의 결을 함께 정리하는 상담에 강점이 있습니다.',
            points: ['상대방의 속마음이 궁금할 때', '막막한 관계의 방향을 알고 싶을 때', '감정을 차분히 정리하고 싶을 때'],
            cardTitle: '전화로도 충분히 깊이 있는 타로 상담',
            cardBody: '편한 공간에서 부담 없이 이야기하며 핵심을 정리하고 방향을 함께 읽어드립니다.',
            closingTitle: '편하게 이야기 나누며 속마음을 읽어봅니다',
            closingBody: '자동 이미지가 비어 있으면 카드 영역을 눌러 직접 이미지를 넣을 수 있습니다.',
            portraitPlaceholder: '타로 상담사 프로필 이미지',
            moodPlaceholder: '타로 무드 이미지'
        },
        'saju-ppt': {
            theme: 'pb-theme-saju',
            variant: 'saju',
            eyebrow: 'Saju Editorial',
            headline: '사주의 흐름을 읽고, 지금의 방향을 정리합니다',
            intro: '사주의 기운과 흐름을 바탕으로 현재 고민을 구조적으로 정리하고 현실적인 방향을 제안합니다.',
            sectionTitle: '사주 상담이 필요한 순간을 짚어드립니다',
            sectionBody: '직업, 진로, 시기, 관계처럼 흐름을 보고 판단해야 하는 고민에 특히 잘 맞는 형식입니다.',
            points: ['올해 흐름이 궁금할 때', '진로와 직업 방향이 막힐 때', '관계와 시기를 함께 보고 싶을 때'],
            cardTitle: '사주를 통해 현재와 다음 흐름을 읽습니다',
            cardBody: '복잡한 고민도 큰 흐름과 세부 포인트를 나눠 이해하기 쉽게 풀어드립니다.',
            closingTitle: '지금의 흐름을 정리하고 다음 방향을 준비합니다',
            closingBody: '자동 이미지가 비어 있으면 상담사 이미지와 무드 이미지를 직접 업로드할 수 있습니다.',
            portraitPlaceholder: '사주 상담사 프로필 이미지',
            moodPlaceholder: '사주 무드 이미지'
        },
        'sinjeom-ppt': {
            theme: 'pb-theme-sinjeom',
            variant: 'sinjeom',
            eyebrow: 'Sinjeom Editorial',
            headline: '신점은 답답한 마음의 방향을 비춰줍니다',
            intro: '복잡한 상황에서 놓치기 쉬운 신호를 차분하게 짚고, 지금 필요한 선택의 방향을 정리합니다.',
            sectionTitle: '신점 상담이 특히 필요한 순간',
            sectionBody: '결정을 앞두고 있거나 답답한 흐름이 길어질 때, 마음의 중심을 다시 잡는 상담에 어울립니다.',
            points: ['답답한 상황의 방향이 궁금할 때', '결정을 앞두고 확신이 필요할 때', '현실적인 조언과 흐름을 함께 보고 싶을 때'],
            cardTitle: '신점 상담은 흐름과 메시지를 함께 정리합니다',
            cardBody: '막연한 불안보다 지금 필요한 포인트를 구체적으로 짚는 데 초점을 둡니다.',
            closingTitle: '필요한 답을 차분하게 정리해드립니다',
            closingBody: 'AI 이미지가 생성되지 않아도 이미지 영역을 눌러 직접 업로드할 수 있습니다.',
            portraitPlaceholder: '신점 상담사 프로필 이미지',
            moodPlaceholder: '신점 무드 이미지'
        }
    };

    function setStatus(target, message, type = 'idle') {
        if (!target) return;
        target.textContent = message;
        target.dataset.state = type;
    }

    function buildGenerationStatus(baseMessage, usage, imageMeta) {
        const usageMessage = usage ? ` 오늘 사용량 ${usage.used}/${usage.limit}` : '';

        if (imageMeta?.requested && !imageMeta?.hasAnyImage) {
            const imageMessage = imageMeta.message || '이미지는 프로필 빌더에서 직접 업로드할 수 있습니다.';
            return `${baseMessage}${usageMessage} 텍스트는 정상 생성되었고, 이미지는 자동 생성되지 않아 직접 업로드로 이어서 작업할 수 있습니다. ${imageMessage}`;
        }

        return `${baseMessage}${usageMessage}`;
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
                        <div class="profile_text" style="margin-top:8px; font-size:15px; font-weight:600; color:${currentBrandColor};" contenteditable="true">대표 소개 문구</div>
                    </div>`;
            case 'text':
                return `<div style="font-size:15px; padding:0 10px; margin-bottom:24px; color:#333; line-height:1.7;" contenteditable="true">본문 텍스트를 입력하세요.</div>`;
            case 'image':
                return `
                    <div class="pb-image-uploadable" style="width:100%; text-align:center; margin-bottom:24px; cursor:pointer;">
                        <div class="pb-upload-placeholder" style="width:100%; height:200px; background:#eaeaea; border:1px dashed #ccc; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#888;">클릭해서 이미지 업로드</div>
                        <img class="pb-uploaded-img" src="" style="width:100%; max-width:600px; border-radius:12px; display:none; margin:0 auto;">
                    </div>`;
            case 'divider':
                return `<hr style="border:none; border-top:1px solid #eaeaea; margin:40px auto; width:60%;">`;
            case 'spacer':
                return `<div style="height:40px;"></div>`;
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
            if (node) node.innerHTML = String(value).replace(/\n/g, '<br>');
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
            setStatus(aiStatus, '상담사명, 전문분야, 상담 톤, 경력/강점을 먼저 입력해주세요.', 'error');
            return;
        }

        aiGenerateButton.disabled = true;
        setStatus(aiStatus, 'AI가 입력한 정보를 바탕으로 소개 페이지를 생성하는 중입니다...', 'loading');

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

            setStatus(aiStatus, buildGenerationStatus('생성이 완료되었습니다.', data.usage, data.imageMeta), 'success');
        } catch (error) {
            setStatus(aiStatus, error.message || 'AI 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            aiGenerateButton.disabled = false;
        }
    }

    async function requestPptGeneration() {
        const file = pptFile.files[0];
        const templateType = pptTemplate.value;
        const templateConfig = templates[templateType];

        if (!file) {
            setStatus(pptStatus, '먼저 PPT 파일(.pptx)을 선택해주세요.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('pptFile', file);
        formData.append('templateType', templateType);
        formData.append('imageStyle', pptImageStyle.value.trim());
        formData.append('generateImage', String(pptGenerateImage.checked));

        pptGenerateButton.disabled = true;
        setStatus(pptStatus, 'PPT 내용을 분석하고 완성형 소개 페이지를 구성하는 중입니다...', 'loading');

        try {
            const response = await fetch('/api/generate-from-ppt', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'PPT 생성 요청에 실패했습니다.');
            }

            applyTheme(templateConfig.theme);
            const element = replaceCanvasWithElement(templateType);
            fillPresentation(element, data.profile);

            const slideMessage = data.meta?.slidesCount ? `슬라이드 ${data.meta.slidesCount}장 분석 완료.` : '';
            setStatus(
                pptStatus,
                buildGenerationStatus(`${slideMessage} 생성이 완료되었습니다.`.trim(), data.usage, data.imageMeta),
                'success'
            );
        } catch (error) {
            setStatus(pptStatus, error.message || 'PPT 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            pptGenerateButton.disabled = false;
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

    document.getElementById('pb-preview-btn')?.addEventListener('click', () => {
        previewArea.innerHTML = '';
        previewArea.style.backgroundColor = currentBrandBg;
        previewArea.appendChild(getCleanCanvasClone());
        previewModal.classList.add('active');
    });

    document.getElementById('pb-close-modal')?.addEventListener('click', () => previewModal.classList.remove('active'));

    document.getElementById('pb-clear-btn')?.addEventListener('click', () => {
        if (!window.confirm('캔버스의 모든 블록을 지울까요?')) return;
        canvas.innerHTML = `
            <div class="pb-empty-state">
                <div class="pb-empty-icon">PPT</div>
                <p>PPT 업로드 생성 버튼으로 시작하거나, 왼쪽 블록을 끌어와 직접 구성해보세요.</p>
            </div>`;
    });

    document.getElementById('pb-export-btn')?.addEventListener('click', () => {
        const clone = getCleanCanvasClone();
        const wrapper = document.createElement('div');
        wrapper.appendChild(clone);
        codeOutput.value = wrapper.innerHTML.trim();
        codeModal.classList.add('active');
    });

    document.getElementById('pb-close-code-modal')?.addEventListener('click', () => codeModal.classList.remove('active'));

    copyButton?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(codeOutput.value);
            copyButton.textContent = '복사됨';
            setTimeout(() => {
                copyButton.textContent = '복사하기';
            }, 1200);
        } catch {
            window.alert('복사에 실패했습니다.');
        }
    });

    aiGenerateButton?.addEventListener('click', requestAiProfile);
    pptGenerateButton?.addEventListener('click', requestPptGeneration);

    bindUploadables(document.body);
    applyTheme('pb-theme-sinjeom');
});
