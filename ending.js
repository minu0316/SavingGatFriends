let endingSettings = {
    congratsMessage: '🎉 축하합니다! 🎉',
    completeMessage: '모든 고양이 친구들을 구하셨습니다!',
    endingImage: null,
    endingImageData: null,
    backgroundColor: '#2c3e50',
    initialsTitle: '이름을 입력하세요 (3글자):'
};

let highScores = JSON.parse(localStorage.getItem('savingCatsHighScores')) || [];

function initEndingEditor() {
    setupEventListeners();
    updatePreview();
    loadHighScores();
}

function setupEventListeners() {
    document.getElementById('congratsMessage').addEventListener('input', (e) => {
        endingSettings.congratsMessage = e.target.value;
        updatePreview();
    });
    
    document.getElementById('completeMessage').addEventListener('input', (e) => {
        endingSettings.completeMessage = e.target.value;
        updatePreview();
    });
    
    document.getElementById('endingImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                endingSettings.endingImageData = e.target.result;
                endingSettings.endingImage = file.name;
                
                const preview = document.getElementById('endingPreview');
                preview.src = e.target.result;
                preview.style.display = 'block';
                
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('endingBgColor').addEventListener('change', (e) => {
        endingSettings.backgroundColor = e.target.value;
        updatePreview();
    });
    
    document.getElementById('initialsTitle').addEventListener('input', (e) => {
        endingSettings.initialsTitle = e.target.value;
        updatePreview();
    });
    
    document.getElementById('exportBtn').addEventListener('click', exportEndingCode);
    document.getElementById('previewGameBtn').addEventListener('click', previewInGame);
    
    // Initial boxes auto-focus management
    const initialBoxes = document.querySelectorAll('.initial-box');
    initialBoxes.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            if (e.target.value && index < initialBoxes.length - 1) {
                initialBoxes[index + 1].focus();
            }
        });
        
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                initialBoxes[index - 1].focus();
            }
        });
    });
}

function updatePreview() {
    const preview = document.getElementById('endingPreview');
    const previewCongrats = document.getElementById('previewCongrats');
    const previewComplete = document.getElementById('previewComplete');
    const previewInitialsTitle = document.getElementById('previewInitialsTitle');
    const endingImageContainer = document.getElementById('endingImageContainer');
    const previewImage = document.getElementById('previewImage');
    
    preview.style.backgroundColor = endingSettings.backgroundColor;
    previewCongrats.textContent = endingSettings.congratsMessage;
    previewComplete.textContent = endingSettings.completeMessage;
    previewInitialsTitle.textContent = endingSettings.initialsTitle;
    
    if (endingSettings.endingImageData) {
        previewImage.src = endingSettings.endingImageData;
        endingImageContainer.style.display = 'block';
    } else {
        endingImageContainer.style.display = 'none';
    }
}

function loadHighScores() {
    // Display current high scores if any
    console.log('Current High Scores:', highScores);
}

function exportEndingCode() {
    const endingScreenCode = `
// 엔딩 화면 관련 함수들 - game.js에 추가하세요

function showEndingScreen(finalScore) {
    gameRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = '다시 시작';
    
    // 엔딩 화면 HTML 생성
    const endingHTML = \`
        <div class="ending-screen" id="endingScreen" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: ${endingSettings.backgroundColor};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            color: white;
            text-align: center;
            font-family: Arial, sans-serif;
        ">
            <div class="ending-content" style="max-width: 600px; padding: 40px;">
                ${endingSettings.endingImageData ? \`<img src="${endingSettings.endingImageData}" alt="엔딩 이미지" style="max-width: 300px; max-height: 200px; margin-bottom: 30px; border-radius: 10px;">\` : ''}
                <h1 style="font-size: 3em; margin: 20px 0; color: #ecf0f1;">${endingSettings.congratsMessage}</h1>
                <p style="font-size: 1.3em; margin: 20px 0; color: #bdc3c7;">${endingSettings.completeMessage}</p>
                <div class="score-display" style="
                    margin: 30px 0;
                    padding: 20px;
                    background-color: rgba(241, 196, 15, 0.1);
                    border-radius: 10px;
                    border: 2px solid #f1c40f;
                ">
                    <h2 style="color: #f1c40f; margin: 0; font-size: 2em;">최종 점수: \${finalScore}</h2>
                </div>
                <div class="initials-section" style="
                    margin: 30px 0;
                    padding: 20px;
                    background-color: rgba(52, 152, 219, 0.1);
                    border-radius: 10px;
                    border: 2px solid #3498db;
                ">
                    <p style="color: #3498db; font-size: 1.2em; margin-bottom: 15px;">${endingSettings.initialsTitle}</p>
                    <div class="initials-input" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
                        <input type="text" maxlength="1" class="initial-box" id="initial1" style="
                            width: 50px; height: 50px; font-size: 24px; text-align: center;
                            background-color: #34495e; color: white; border: 2px solid #3498db;
                            border-radius: 5px; font-weight: bold; text-transform: uppercase;
                        ">
                        <input type="text" maxlength="1" class="initial-box" id="initial2" style="
                            width: 50px; height: 50px; font-size: 24px; text-align: center;
                            background-color: #34495e; color: white; border: 2px solid #3498db;
                            border-radius: 5px; font-weight: bold; text-transform: uppercase;
                        ">
                        <input type="text" maxlength="1" class="initial-box" id="initial3" style="
                            width: 50px; height: 50px; font-size: 24px; text-align: center;
                            background-color: #34495e; color: white; border: 2px solid #3498db;
                            border-radius: 5px; font-weight: bold; text-transform: uppercase;
                        ">
                    </div>
                    <button onclick="saveHighScore(\${finalScore})" style="
                        background-color: #27ae60; color: white; border: none;
                        padding: 12px 25px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">점수 저장</button>
                </div>
                <div class="ending-buttons" style="display: flex; justify-content: center; gap: 15px; margin-top: 30px;">
                    <button onclick="restartGame()" style="
                        background-color: #3498db; color: white; border: none;
                        padding: 15px 30px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">다시 하기</button>
                    <button onclick="goToMainMenu()" style="
                        background-color: #e74c3c; color: white; border: none;
                        padding: 15px 30px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">메인 메뉴</button>
                </div>
            </div>
        </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', endingHTML);
    
    // 이니셜 입력 박스 이벤트 리스너
    const initialBoxes = document.querySelectorAll('.initial-box');
    initialBoxes.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            if (e.target.value && index < initialBoxes.length - 1) {
                initialBoxes[index + 1].focus();
            }
        });
        
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                initialBoxes[index - 1].focus();
            }
        });
    });
    
    // 첫 번째 입력 박스에 포커스
    if (initialBoxes[0]) {
        initialBoxes[0].focus();
    }
}

function saveHighScore(finalScore) {
    const initial1 = document.getElementById('initial1').value || 'A';
    const initial2 = document.getElementById('initial2').value || 'A';
    const initial3 = document.getElementById('initial3').value || 'A';
    const initials = initial1 + initial2 + initial3;
    
    let highScores = JSON.parse(localStorage.getItem('savingCatsHighScores')) || [];
    
    const newScore = {
        initials: initials,
        score: finalScore,
        date: new Date().toLocaleDateString('ko-KR')
    };
    
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10); // 상위 10개만 저장
    
    localStorage.setItem('savingCatsHighScores', JSON.stringify(highScores));
    
    alert(\`점수가 저장되었습니다!\\n이니셜: \${initials}\\n점수: \${finalScore}\`);
}

function restartGame() {
    const endingScreen = document.getElementById('endingScreen');
    if (endingScreen) {
        endingScreen.remove();
    }
    startGame();
}

function goToMainMenu() {
    const endingScreen = document.getElementById('endingScreen');
    if (endingScreen) {
        endingScreen.remove();
    }
    // 메인 메뉴로 이동하는 로직 (필요시 구현)
    location.reload();
}

// gameComplete 함수를 다음과 같이 수정하세요:
function gameComplete() {
    showEndingScreen(score);
}
`;

    // 클립보드에 복사
    navigator.clipboard.writeText(endingScreenCode).then(() => {
        alert('엔딩 화면 코드가 클립보드에 복사되었습니다!\\n\\ngame.js 파일 맨 아래에 이 코드를 추가하세요.');
    }).catch(() => {
        // 클립보드 실패 시 텍스트 영역에 표시
        const textarea = document.createElement('textarea');
        textarea.value = endingScreenCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('엔딩 화면 코드가 클립보드에 복사되었습니다!\\n\\ngame.js 파일 맨 아래에 이 코드를 추가하세요.');
    });
}

function previewInGame() {
    localStorage.setItem('endingSettings', JSON.stringify(endingSettings));
    window.open('index.html', '_blank');
}

// 하이스코어 표시 함수
function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem('savingCatsHighScores')) || [];
    
    if (highScores.length === 0) {
        console.log('아직 기록된 점수가 없습니다.');
        return;
    }
    
    console.log('=== 최고 점수 기록 ===');
    highScores.forEach((record, index) => {
        console.log(`${index + 1}. ${record.initials} - ${record.score}점 (${record.date})`);
    });
}

initEndingEditor();