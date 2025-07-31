let titleSettings = {
    gameTitle: '🐱 Saving Cats 🐱',
    titleImage: null,
    titleImageData: null,
    backgroundColor: '#2c3e50',
    startButtonText: '게임 시작'
};

function initTitleEditor() {
    setupEventListeners();
    updatePreview();
}

function setupEventListeners() {
    document.getElementById('gameTitle').addEventListener('input', (e) => {
        titleSettings.gameTitle = e.target.value;
        updatePreview();
    });
    
    document.getElementById('titleImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                titleSettings.titleImageData = e.target.result;
                titleSettings.titleImage = file.name;
                
                const preview = document.getElementById('titlePreview');
                preview.src = e.target.result;
                preview.style.display = 'block';
                
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('titleBgColor').addEventListener('change', (e) => {
        titleSettings.backgroundColor = e.target.value;
        updatePreview();
    });
    
    document.getElementById('startBtnText').addEventListener('input', (e) => {
        titleSettings.startButtonText = e.target.value;
        updatePreview();
    });
    
    document.getElementById('exportBtn').addEventListener('click', exportTitleCode);
    document.getElementById('previewGameBtn').addEventListener('click', previewInGame);
}

function updatePreview() {
    const preview = document.getElementById('titlePreview');
    const previewTitle = document.getElementById('previewTitle');
    const previewStartBtn = document.getElementById('previewStartBtn');
    const titleImageContainer = document.getElementById('titleImageContainer');
    const previewImage = document.getElementById('previewImage');
    
    preview.style.backgroundColor = titleSettings.backgroundColor;
    previewTitle.textContent = titleSettings.gameTitle;
    previewStartBtn.textContent = titleSettings.startButtonText;
    
    if (titleSettings.titleImageData) {
        previewImage.src = titleSettings.titleImageData;
        titleImageContainer.style.display = 'block';
    } else {
        titleImageContainer.style.display = 'none';
    }
}

function exportTitleCode() {
    const htmlCode = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleSettings.gameTitle}</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body {
            background-color: ${titleSettings.backgroundColor};
        }
        
        .title-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: ${titleSettings.backgroundColor};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .title-image {
            max-width: 500px;
            max-height: 350px;
            margin-bottom: 30px;
            border-radius: 15px;
        }
        
        .title-screen h1 {
            font-size: 3em;
            margin: 20px 0;
            color: #ecf0f1;
            text-align: center;
        }
        
        .title-screen p {
            color: #bdc3c7;
            font-size: 1.2em;
            margin: 20px 0;
            text-align: center;
        }
        
        .title-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 30px;
        }
        
        .title-btn {
            background-color: #27ae60;
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.2em;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
            min-width: 200px;
        }
        
        .title-btn:hover {
            background-color: #219a52;
        }
        
        .title-btn.secondary {
            background-color: #3498db;
        }
        
        .title-btn.secondary:hover {
            background-color: #2980b9;
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="title-screen" id="titleScreen">
        <div class="title-content">
            ${titleSettings.titleImageData ? `<img src="${titleSettings.titleImageData}" alt="게임 로고" class="title-image" style="max-width: 500px; max-height: 350px; border-radius: 15px;">` : ''}
            <h1>${titleSettings.gameTitle}</h1>
            <p>좌우 방향키로 고양이를 조작하여 친구들을 구하세요!</p>
            <div class="title-buttons">
                <button class="title-btn" onclick="startGame()">${titleSettings.startButtonText}</button>
                <button class="title-btn secondary" onclick="window.open('editor.html', '_blank')">맵 에디터</button>
                <button class="title-btn secondary" onclick="window.open('title.html', '_blank')">타이틀 설정</button>
            </div>
        </div>
    </div>
    
    <div class="game-container hidden" id="gameContainer">
        <h1>🐱 Saving Cats 🐱</h1>
        <div class="game-info">
            <div class="info-item">스테이지: <span id="stage">1</span></div>
            <div class="info-item">점수: <span id="score">0</span></div>
            <div class="info-item">생명: <span id="lives">❤️❤️❤️</span></div>
        </div>
        <canvas id="gameCanvas" width="1000" height="500"></canvas>
        <div class="controls">
            <p>좌우 방향키로 고양이를 조작하여 친구들을 구하세요!</p>
            <button id="startBtn">게임 시작</button>
        </div>
    </div>
    
    <script>
        function startGame() {
            document.getElementById('titleScreen').classList.add('hidden');
            document.getElementById('gameContainer').classList.remove('hidden');
        }
    </script>
    <script src="stages.js"></script>
    <script src="game.js"></script>
</body>
</html>`;

    // 클립보드에 복사
    navigator.clipboard.writeText(htmlCode).then(() => {
        alert('타이틀 화면 코드가 클립보드에 복사되었습니다!\\n\\nindex.html 파일을 이 코드로 교체하세요.');
    }).catch(() => {
        // 클립보드 실패 시 텍스트 영역에 표시
        const textarea = document.createElement('textarea');
        textarea.value = htmlCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('타이틀 화면 코드가 클립보드에 복사되었습니다!\\n\\nindex.html 파일을 이 코드로 교체하세요.');
    });
}

function previewInGame() {
    localStorage.setItem('titleSettings', JSON.stringify(titleSettings));
    window.open('index.html', '_blank');
}

initTitleEditor();