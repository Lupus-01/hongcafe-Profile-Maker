document.addEventListener('DOMContentLoaded', () => {
    const tools = document.querySelectorAll('.pb-tool');
    const canvas = document.getElementById('pb-canvas');
    const themeBtns = document.querySelectorAll('.pb-theme-btn');
    const appContainer = document.getElementById('pb-app');
    
    const imageUploader = document.getElementById('pb-image-uploader');
    let currentUploadTargetImg = null; 
    let currentUploadPlaceholder = null;

    let currentBrandColor = '#C21129';
    let currentBrandBg = '#fdf5f6';
    let currentBrandLight = '#fbe6e8';

    themeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            themeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            appContainer.classList.remove('pb-theme-tarot', 'pb-theme-saju', 'pb-theme-sinjeom');
            appContainer.classList.add(e.target.dataset.theme);
            
            currentBrandColor = e.target.dataset.color;
            currentBrandBg = e.target.dataset.bg;
            if(currentBrandColor === '#6335B4') currentBrandLight = '#ece5f7';
            else if(currentBrandColor === '#D67A00') currentBrandLight = '#faecd6';
            else currentBrandLight = '#fbe6e8';
        });
    });

    tools.forEach(tool => {
        tool.addEventListener('dragstart', (e) => e.dataTransfer.setData('type', tool.dataset.type));
    });

    canvas.addEventListener('dragover', (e) => e.preventDefault());

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        if(!type) return;

        const emptyState = canvas.querySelector('.pb-empty-state');
        if(emptyState) emptyState.remove();

        const element = document.createElement('div');
        element.className = 'pb-element';
        
        // --- 🚨 사내 시스템 호환을 위한 100% 인라인 스타일 적용 ---
        let innerHTML = '';
        switch(type) {
            case 'hero':
                innerHTML = `
                    <div class="profile_header" style="width:100%; padding:40px 0; background:${currentBrandBg}; text-align:center; border-radius:16px; margin-bottom:24px;">
                        <div class="pb-image-uploadable" style="display:inline-block; position:relative; cursor:pointer;">
                            <div class="pb-upload-placeholder" style="width:100px; height:100px; border-radius:50%; background:#eaeaea; border:3px solid ${currentBrandLight}; display:flex; align-items:center; justify-content:center; font-size:12px; color:#888;">사진 등록</div>
                            <img class="pb-uploaded-img" src="" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid ${currentBrandLight}; display:none;">
                        </div>
                        <div class="profile_name" style="margin-top:12px; font-size:28px; font-weight:800; color:#111;" contenteditable="true">상담사 이름</div>
                        <div class="profile_text" style="margin-top:8px; font-size:15px; font-weight:600; color:${currentBrandColor};" contenteditable="true">주력 분야 및 타이틀</div>
                    </div>`; break;
            
            case 'qa':
                // 사내 코드 클래스(profile-section, subject) 완벽 반영
                innerHTML = `
                    <div class="profile-section" style="margin-bottom:24px;">
                        <div class="subject" style="margin-top:32px;">
                            <div class="number" style="width:32px; height:32px; background:${currentBrandColor}; color:#fff; font-size:14px; font-weight:600; line-height:32px; border-radius:16px 16px 16px 0px; text-align:center; margin-bottom:10px;">Q</div>
                            <div class="subject_text" style="margin-top:6px; font-size:20px; font-weight:bold; line-height:1.4; color:#111;" contenteditable="true">질문을 입력하세요</div>
                            <p class="content_text" style="margin-top:16px; margin-bottom:24px; padding:0 10px; text-align:left; line-height:1.6; font-size:15px; color:#444;" contenteditable="true">여기에 구체적인 답변과 상담 철학을 작성해 주세요.</p>
                        </div>
                    </div>`; break;

            case 'review':
                innerHTML = `
                    <div style="background:#fff; padding:24px; border-radius:16px; border:1px solid #eaeaea; position:relative; margin-bottom:24px; text-align:left;">
                        <div style="font-size:12px; color:#666; background:#f5f5f5; padding:4px 10px; border-radius:20px; display:inline-block; font-weight:600; margin-bottom:12px;" contenteditable="true">30대 여성 / 이직상담</div>
                        <div style="color:${currentBrandColor}; font-size:14px; margin-bottom:8px; letter-spacing:2px;">★★★★★</div>
                        <div style="font-weight:800; font-size:17px; margin-bottom:8px; color:#111; line-height:1.4;" contenteditable="true">소름 돋을 정도로 명쾌한 해답을 얻었습니다.</div>
                        <div style="font-size:14.5px; color:#444; line-height:1.6;" contenteditable="true">상담 후기 본문을 여기에 적어주세요.</div>
                    </div>`; break;

            case 'catchphrase':
                innerHTML = `<div style="text-align:center; color:${currentBrandColor}; font-size:24px; font-weight:800; margin:40px 0; line-height:1.4; word-break:keep-all;" contenteditable="true">당신의 답답한 마음,<br>속 시원하게 뚫어드립니다</div>`; break;

            case 'text':
                innerHTML = `<div style="font-size:15px; padding:0 10px; margin-bottom:24px; color:#333; line-height:1.7;" contenteditable="true">본문 텍스트를 입력하는 공간입니다.</div>`; break;
            
            case 'stats':
                innerHTML = `<div style="display:flex; justify-content:space-around; background:#fff; padding:24px 10px; border-radius:16px; border:1px solid #eaeaea; margin-bottom:24px; text-align:center;"><div style="flex:1"><span style="display:block; font-size:22px; font-weight:800; color:${currentBrandColor}; margin-bottom:4px;" contenteditable="true">15년</span><span style="font-size:12px; color:#666; font-weight:500;" contenteditable="true">신점 경력</span></div><div style="flex:1"><span style="display:block; font-size:22px; font-weight:800; color:${currentBrandColor}; margin-bottom:4px;" contenteditable="true">5만+</span><span style="font-size:12px; color:#666; font-weight:500;" contenteditable="true">누적 상담</span></div><div style="flex:1"><span style="display:block; font-size:22px; font-weight:800; color:${currentBrandColor}; margin-bottom:4px;" contenteditable="true">99%</span><span style="font-size:12px; color:#666; font-weight:500;" contenteditable="true">재방문율</span></div></div>`; break;

            case 'specialty':
                innerHTML = `<div style="background:#fff; border:1px solid ${currentBrandLight}; border-radius:16px; padding:24px; margin-bottom:24px;"><h4 style="margin:0 0 16px 0; color:${currentBrandColor}; font-size:16px; text-align:center; font-weight:800;" contenteditable="true">주요 전문 분야</h4><ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px;"><li style="font-size:15px; color:#222; display:flex; gap:8px;" contenteditable="true"><span style="color:${currentBrandColor}; font-weight:bold;">✔</span> 재회 및 연애운 전문</li><li style="font-size:15px; color:#222; display:flex; gap:8px;" contenteditable="true"><span style="color:${currentBrandColor}; font-weight:bold;">✔</span> 직장, 이직, 금전 흐름</li></ul></div>`; break;

            case 'highlight':
                innerHTML = `<div style="background:${currentBrandLight}; padding:24px; border-radius:12px; text-align:center; margin-bottom:24px;"><div style="font-weight:800; font-size:18px; color:${currentBrandColor}; margin-bottom:10px;" contenteditable="true">이런 분들께 추천합니다</div><div style="font-size:14px; color:#333; line-height:1.5;" contenteditable="true">혼자 앓지 마시고 저에게 기대어 해답을 찾아가세요.</div></div>`; break;
            
            case 'letter':
                innerHTML = `<div style="background:${currentBrandLight}; border-radius:16px; padding:32px 24px; margin-bottom:24px; text-align:center;"><div style="font-size:28px; margin-bottom:12px;">💌</div><div style="font-size:18px; font-weight:800; color:${currentBrandColor}; margin-bottom:16px;" contenteditable="true">내담자님께 드리는 진심</div><div style="font-size:15px; line-height:1.8; color:#333;" contenteditable="true">어려운 고민이라도 속 시원한 상담으로 조언을 드리겠습니다.</div></div>`; break;
            
            case 'quote':
                innerHTML = `<blockquote style="margin:24px 0; padding:16px 20px; border-left:4px solid ${currentBrandColor}; background:${currentBrandLight}; border-radius:0 12px 12px 0; font-style:italic; font-weight:500; font-size:15px; color:#222;" contenteditable="true">과거는 바꿀 수 없지만, 미래는 당신의 선택에 달려있습니다.</blockquote>`; break;

            case 'image':
                innerHTML = `
                    <div class="pb-image-uploadable" style="width:100%; text-align:center; margin-bottom:24px; cursor:pointer;">
                        <div class="pb-upload-placeholder" style="width:100%; height:200px; background:#eaeaea; border:1px dashed #ccc; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#888;">클릭하여 이미지 첨부</div>
                        <img class="pb-uploaded-img" src="" style="width:100%; max-width:600px; border-radius:12px; display:none; margin:0 auto;">
                        <br style="clear:both;">
                    </div>`; break;

            case 'title-divider':
                innerHTML = `<div style="display:flex; align-items:center; text-align:center; color:${currentBrandColor}; font-weight:800; font-size:16px; margin:40px 0;"><hr style="flex:1; border:none; border-bottom:1px solid ${currentBrandColor}; opacity:0.3; margin:0 15px;"><span contenteditable="true">상담 안내</span><hr style="flex:1; border:none; border-bottom:1px solid ${currentBrandColor}; opacity:0.3; margin:0 15px;"></div>`; break;

            case 'divider':
                innerHTML = `<hr style="border:none; border-top:1px solid #eaeaea; margin:40px auto; width:60%;">`; break;
            
            case 'spacer':
                innerHTML = `<div class="pb-el-spacer" style="height:50px; width:100%; border:1px dashed #ccc; text-align:center; line-height:50px; color:#999; font-size:12px;">여백 (Export시 투명)</div>`; break;
        }

        element.innerHTML = innerHTML;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'pb-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = () => element.remove();
        element.appendChild(deleteBtn);
        canvas.appendChild(element);

        // 사진 첨부 이벤트 바인딩
        const uploadableArea = element.querySelector('.pb-image-uploadable');
        if(uploadableArea) {
            uploadableArea.addEventListener('click', function() {
                currentUploadTargetImg = this.querySelector('.pb-uploaded-img');
                currentUploadPlaceholder = this.querySelector('.pb-upload-placeholder');
                imageUploader.click();
            });
        }
    });

    imageUploader.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            if(currentUploadTargetImg && currentUploadPlaceholder) {
                currentUploadTargetImg.src = event.target.result;
                currentUploadTargetImg.style.display = 'block';
                currentUploadPlaceholder.style.display = 'none';
                currentUploadTargetImg.parentElement.style.border = 'none';
            }
        };
        reader.readAsDataURL(file);
        this.value = '';
    });

    // 전체 삭제 기능
    document.getElementById('pb-clear-btn').addEventListener('click', () => {
        if(confirm('작성 중인 모든 프로필 내용이 삭제됩니다.\n정말 초기화하시겠습니까?')) {
            canvas.innerHTML = `<div class="pb-empty-state"><div class="pb-empty-icon">🖱️</div><p>왼쪽 패널에서 블록을 끌어다 놓으세요.</p></div>`;
        }
    });

    // 미리보기 및 내보내기 공통 클론 함수
    function getCleanCanvasClone() {
        const clone = canvas.cloneNode(true);
        const empty = clone.querySelector('.pb-empty-state');
        if(empty) empty.remove();
        clone.querySelectorAll('.pb-delete-btn').forEach(btn => btn.remove());
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        
        clone.querySelectorAll('.pb-image-uploadable').forEach(el => {
            const img = el.querySelector('.pb-uploaded-img');
            if(!img.src || img.src === window.location.href) {
                el.parentElement.parentElement.classList.contains('pb-element') 
                    ? el.parentElement.parentElement.remove() : el.parentElement.remove();
            }
        });

        const wrappers = clone.querySelectorAll('.pb-element');
        wrappers.forEach(wrap => {
            while (wrap.firstChild) wrap.parentNode.insertBefore(wrap.firstChild, wrap);
            wrap.parentNode.removeChild(wrap);
        });
        return clone;
    }

    // 미리보기
    const previewModal = document.getElementById('pb-modal');
    document.getElementById('pb-preview-btn').addEventListener('click', () => {
        const previewArea = document.getElementById('pb-preview-area');
        previewArea.innerHTML = '';
        previewArea.style.backgroundColor = currentBrandBg; 
        previewArea.appendChild(getCleanCanvasClone());
        previewModal.classList.add('active');
    });
    document.getElementById('pb-close-modal').addEventListener('click', () => previewModal.classList.remove('active'));

    // 안전한 인라인 추출 (레거시 Wrapper 포함)
    const codeModal = document.getElementById('pb-code-modal');
    const codeOutput = document.getElementById('pb-code-output');
    
    document.getElementById('pb-export-btn').addEventListener('click', () => {
        const cleanCanvas = getCleanCanvasClone();
        
        cleanCanvas.querySelectorAll('.pb-el-spacer').forEach(el => {
            el.innerHTML = '';
            el.style.border = 'none';
        });

        // 🚨 사내 시스템 100% 호환 추출 템플릿 (센터 정렬 + profile_v02 클래스 적용)
        const exportTemplate = `
<center>
<div class="profile_v02" style="font-family:'Noto Sans KR', sans-serif; margin-top:0; max-width:600px; text-align:left; line-height:1.6; color:#111;">
${cleanCanvas.innerHTML}
</div>
</center>
        `.trim();

        codeOutput.value = exportTemplate;
        codeModal.classList.add('active');
    });

    document.getElementById('pb-close-code-modal').addEventListener('click', () => codeModal.classList.remove('active'));

    const copyBtn = document.getElementById('pb-copy-btn');
    copyBtn.addEventListener('click', () => {
        codeOutput.select();
        document.execCommand('copy');
        copyBtn.innerText = '복사 완료! ✔';
        copyBtn.style.background = '#28a745';
        setTimeout(() => { copyBtn.innerText = '복사하기'; copyBtn.style.background = '#007acc'; }, 2000);
    });
});