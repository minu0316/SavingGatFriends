// 스테이지 데이터 - 게임에 포함될 모든 스테이지 (20개)
// 난이도 조정: 적 최대속도 10프레임, 적 최대개수 5마리, 친구 캐릭터 10종류 랜덤
const STAGES = {
    1: {
        stageNumber: 1,
        stageName: "첫 번째 모험",
        backgroundColor: '#90EE90',
        playerSpeed: 400,
        enemySpeed: 10,
        player: { x: 1, y: 1 },
        exit: { x: 18, y: 8 },
        friends: [
            { x: 5, y: 2, rescued: false, type: 1 },
            { x: 12, y: 3, rescued: false, type: 2 }
        ],
        enemies: [
            { x: 7, y: 3, direction: 0, moveTimer: 0 }
        ],
        walls: [
            // 경계 벽
            ...Array.from({length: 20}, (_, x) => ({ x, y: 0 })),
            ...Array.from({length: 20}, (_, x) => ({ x, y: 9 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 0, y: y + 1 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 19, y: y + 1 })),
            // 간단한 장애물
            { x: 6, y: 3 },
            { x: 11, y: 2 },
            { x: 13, y: 5 }
        ]
    },
    
    2: {
        stageNumber: 2,
        stageName: "속도 증가",
        backgroundColor: '#FFE4B5',
        playerSpeed: 380,
        enemySpeed: 12, // 9에서 12로 변경 (적 느려짐)
        player: { x: 1, y: 1 },
        exit: { x: 18, y: 8 },
        friends: [
            { x: 3, y: 3, rescued: false, type: 1 },
            { x: 9, y: 2, rescued: false, type: 2 },
            { x: 16, y: 4, rescued: false, type: 3 }
        ],
        enemies: [
            { x: 6, y: 5, direction: 0, moveTimer: 0 },
            { x: 12, y: 6, direction: 1, moveTimer: 0 }
        ],
        walls: [
            // 경계 벽
            ...Array.from({length: 20}, (_, x) => ({ x, y: 0 })),
            ...Array.from({length: 20}, (_, x) => ({ x, y: 9 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 0, y: y + 1 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 19, y: y + 1 })),
            // 장애물 감소 (일부 벽 제거)
            { x: 4, y: 2 },
            { x: 7, y: 1 },
            { x: 10, y: 4 },
            { x: 13, y: 3 }
        ]
    },
    
    3: {
        stageNumber: 3,
        stageName: "친구들이 많아져요",
        backgroundColor: '#FFB6C1',
        playerSpeed: 360,
        enemySpeed: 8,
        player: { x: 1, y: 1 },
        exit: { x: 18, y: 8 },
        friends: [
            { x: 3, y: 3, rescued: false, type: 1 },
            { x: 9, y: 2, rescued: false, type: 2 },
            { x: 16, y: 4, rescued: false, type: 3 },
            { x: 5, y: 7, rescued: false, type: 4 }
        ],
        enemies: [
            { x: 6, y: 5, direction: 0, moveTimer: 0 },
            { x: 12, y: 6, direction: 1, moveTimer: 0 },
            { x: 15, y: 2, direction: 2, moveTimer: 0 }
        ],
        walls: [
            // 경계 벽
            ...Array.from({length: 20}, (_, x) => ({ x, y: 0 })),
            ...Array.from({length: 20}, (_, x) => ({ x, y: 9 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 0, y: y + 1 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 19, y: y + 1 })),
            // 미로 벽
            { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 },
            { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 },
            { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 },
            { x: 13, y: 3 }, { x: 14, y: 3 }, { x: 15, y: 3 },
            { x: 2, y: 6 }, { x: 3, y: 6 }
        ]
    },
    
    4: {
        stageNumber: 4,
        stageName: "적들의 반격",
        backgroundColor: '#DDA0DD',
        playerSpeed: 340,
        enemySpeed: 8,
        player: { x: 1, y: 1 },
        exit: { x: 18, y: 8 },
        friends: [
            { x: 2, y: 2, rescued: false, type: 1 },
            { x: 17, y: 2, rescued: false, type: 2 },
            { x: 2, y: 7, rescued: false, type: 3 },
            { x: 17, y: 7, rescued: false, type: 4 }
        ],
        enemies: [
            { x: 5, y: 4, direction: 0, moveTimer: 0 },
            { x: 9, y: 2, direction: 1, moveTimer: 0 },
            { x: 11, y: 6, direction: 2, moveTimer: 0 },
            { x: 15, y: 4, direction: 3, moveTimer: 0 }
        ],
        walls: [
            // 경계 벽
            ...Array.from({length: 20}, (_, x) => ({ x, y: 0 })),
            ...Array.from({length: 20}, (_, x) => ({ x, y: 9 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 0, y: y + 1 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 19, y: y + 1 })),
            // 복잡한 장애물
            { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 },
            { x: 12, y: 2 }, { x: 13, y: 2 }, { x: 14, y: 2 },
            { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 },
            { x: 14, y: 6 }, { x: 15, y: 5 }, { x: 16, y: 4 },
            { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 }
        ]
    },
    
    5: {
        stageNumber: 5,
        stageName: "모든 친구 구하기",
        backgroundColor: '#87CEEB',
        playerSpeed: 320,
        enemySpeed: 7,
        player: { x: 1, y: 1 },
        exit: { x: 18, y: 8 },
        friends: [
            { x: 3, y: 2, rescued: false, type: 1 },
            { x: 8, y: 3, rescued: false, type: 2 },
            { x: 14, y: 2, rescued: false, type: 3 },
            { x: 6, y: 7, rescued: false, type: 4 },
            { x: 12, y: 6, rescued: false, type: 5 }
        ],
        enemies: [
            { x: 5, y: 4, direction: 0, moveTimer: 0 },
            { x: 9, y: 2, direction: 1, moveTimer: 0 },
            { x: 11, y: 5, direction: 2, moveTimer: 0 },
            { x: 15, y: 4, direction: 3, moveTimer: 0 },
            { x: 7, y: 7, direction: 0, moveTimer: 0 }
        ],
        walls: [
            // 경계 벽
            ...Array.from({length: 20}, (_, x) => ({ x, y: 0 })),
            ...Array.from({length: 20}, (_, x) => ({ x, y: 9 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 0, y: y + 1 })),
            ...Array.from({length: 8}, (_, y) => ({ x: 19, y: y + 1 })),
            // 더 복잡한 미로
            { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 },
            { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 3 }, { x: 10, y: 3 },
            { x: 13, y: 1 }, { x: 13, y: 2 }, { x: 13, y: 3 }, { x: 13, y: 4 },
            { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 15, y: 6 }, { x: 16, y: 6 }, { x: 17, y: 6 }, { x: 17, y: 7 }
        ]
    }
};

// 나머지 스테이지들 (6-20)을 동적으로 생성
for (let i = 6; i <= 20; i++) {
    const progress = (i - 1) / 19; // 0.0 ~ 1.0
    
    // 플레이어 속도: 400ms -> 200ms
    const playerSpeed = Math.floor(400 - (200 * progress));
    
    // 적 속도: 10프레임 -> 4프레임
    const enemySpeed = Math.max(4, Math.floor(10 - (6 * progress)));
    
    // 친구 개수: 2 -> 5
    const friendCount = Math.min(5, Math.floor(2 + (3 * progress)));
    
    // 적 개수: 1 -> 5
    const enemyCount = Math.min(5, Math.floor(1 + (4 * progress)));
    
    // 벽 개수 증가
    const wallComplexity = Math.floor(progress * 40) + 10;
    
    const stageNames = [
        "첫 번째 모험", "속도 증가", "친구들이 많아져요", "적들의 반격", "모든 친구 구하기",
        "속도 전쟁", "장애물 지대", "빠른 추격전", "복잡한 미로", "중간 보스",
        "더 빠른 적들", "미로의 악몽", "불행한 13", "극한의 속도", "절망의 벽",
        "지옥의 관문", "혼돈의 끝", "악몽의 현실", "최후의 시련", "전설의 완성"
    ];
    
    const backgroundColors = [
        '#90EE90', '#FFE4B5', '#FFB6C1', '#DDA0DD', '#87CEEB',
        '#98FB98', '#F0E68C', '#FFB347', '#DA70D6', '#CD5C5C',
        '#20B2AA', '#9370DB', '#2F4F4F', '#B22222', '#8B0000',
        '#4B0000', '#1C1C1C', '#000000', '#660000', '#8B0000'
    ];
    
    // 친구들 생성 (랜덤 타입)
    const friends = [];
    for (let f = 0; f < friendCount; f++) {
        friends.push({
            x: Math.floor(Math.random() * 16) + 2,
            y: Math.floor(Math.random() * 6) + 2,
            rescued: false,
            type: Math.floor(Math.random() * 10) + 1
        });
    }
    
    // 적들 생성
    const enemies = [];
    for (let e = 0; e < enemyCount; e++) {
        enemies.push({
            x: Math.floor(Math.random() * 16) + 2,
            y: Math.floor(Math.random() * 6) + 2,
            direction: Math.floor(Math.random() * 4),
            moveTimer: 0
        });
    }
    
    // 기본 벽 구조
    let walls = [
        // 경계 벽
        ...Array.from({length: 20}, (_, x) => ({ x, y: 0 })),
        ...Array.from({length: 20}, (_, x) => ({ x, y: 9 })),
        ...Array.from({length: 8}, (_, y) => ({ x: 0, y: y + 1 })),
        ...Array.from({length: 8}, (_, y) => ({ x: 19, y: y + 1 }))
    ];
    
    // 추가 벽 생성
    for (let w = 0; w < wallComplexity; w++) {
        const wallX = Math.floor(Math.random() * 16) + 2;
        const wallY = Math.floor(Math.random() * 6) + 2;
        walls.push({ x: wallX, y: wallY });
    }
    
    STAGES[i] = {
        stageNumber: i,
        stageName: stageNames[i - 1],
        backgroundColor: backgroundColors[i - 1],
        playerSpeed: playerSpeed,
        enemySpeed: enemySpeed,
        player: { x: 1, y: 1 },
        exit: { x: 18, y: 8 },
        friends: friends,
        enemies: enemies,
        walls: walls
    };
}

// 스테이지 개수
const MAX_STAGE = Object.keys(STAGES).length;

// 디버깅: 스테이지가 제대로 생성되었는지 확인
console.log('Total stages created:', MAX_STAGE);
console.log('Stage 1 data:', STAGES[1]);
console.log('All stage numbers:', Object.keys(STAGES));