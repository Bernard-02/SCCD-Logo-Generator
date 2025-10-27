// --- 全域變數 ---
let letters = [];
let font;
let inputBox;
let canvasContainer;
let hiddenMeasurer; // 新增：用於測量文字的隱藏 div
let showCircle = false;
let circleAlpha = 0;
let circleShrinking = false;
let circleFillTimeout = null;

// --- 旋轉相關變數 ---
let autoRotate = false;
let rotationFactor = 0;
let rotationAngles = [];
let originalRotationAngles = []; // 用於重置角度
let shouldResetToZero = false; // 是否應該 ease 回到 0°
let resetEaseSpeed = 0.035; // ease 回 0° 的速度
const baseSpeeds = [0.5, -0.5, 1]; // R, G, B 各自的基礎旋轉速度
// 新的字體大小設定：根據字元數
const largeFontSize = '120px';   // 1-15 字
const mediumFontSize = '90px';   // 16-30 字
const smallFontSize = '60px';    // 31-40 字
const easterEggString = "SHIHCHIENCOMMUNICATIONSDESIGN";
let isEasterEggActive = false;

// --- 動畫與圖片變數 ---
let isFading = false;
let fadeStartTime = 0;
const fadeDuration = 400; // ms
let logoAlpha = 255;
let easterEggAlpha = 0;
let sccdBlackImg, sccdWhiteImg;

// --- 新增：UI 狀態與模式 ---
let mode = "Standard"; // "Standard" or "Inverse"
let targetMode = "Standard"; // 用於模式轉換的目標模式
let isAutoRotateMode = false;
let isCustomMode = false; // 新增：是否為自訂角度模式
let rRotationOffset = 0, gRotationOffset = 0, bRotationOffset = 0;
// 新增：目標旋轉偏移和是否正在ease
let targetRRotationOffset = 0, targetGRotationOffset = 0, targetBRotationOffset = 0;
let isEasingCustomRotation = false; // 是否正在進行 custom 模式的 ease 動畫
let customEaseSpeed = 0.08; // custom 模式的 ease 速度（與 auto 模式停止時相同）

// --- 新增：DOM 元素 ---
let rotateButton, customButton, standardButton, inverseButton;
let randomButton, resetButton, saveButton;
let rSlider, gSlider, bSlider;
let rAngleLabel, gAngleLabel, bAngleLabel;
let randomImg, resetImg, saveImg; // 圖片按鈕的 img 元素
let disabledColor = '#E0E0E0'; // 定義一個禁用顏色
let colormodeIndicator; // 滑動邊框指示器

// --- 響應式元素 ---
let inputBoxMobile, hiddenMeasurerMobile;
let saveButtonMobile, saveImgMobile;
let isMobileMode = false;

// --- 下載提示框 ---
let downloadNotification;

// --- 打字機動畫變數 ---
let typewriterActive = false;
let typewriterLines = []; // 將文字分行儲存
let typewriterCurrentLine = 0; // 當前正在打的行
let typewriterCurrentChar = 0; // 當前行的字元索引
let typewriterStartTime = 0;
const typewriterDuration = 1500; // 3秒完成動畫
let typewriterTotalChars = 0; // 總字元數（不包含換行符）

// --- Logo 繪製相關常數 ---
const colors = [ [255, 68, 138], [0, 255, 128], [38, 188, 255] ];

// --- Placeholder SVG 變數 ---
let placeholderR, placeholderG, placeholderB; // 三層 SVG (黑色)
let placeholderR_white, placeholderG_white, placeholderB_white; // 三層 SVG (白色)
let placeholderRotations = [0, 0, 0]; // R, G, B 三層的旋轉角度
let placeholderAlpha = 255; // Placeholder 的透明度（用於 fade in/out）
let targetPlaceholderAlpha = 255; // 目標透明度

// --- 頁面載入動畫變數 ---
let pageLoadStartTime = 0; // 頁面載入開始時間
let inputBoxOpacity = 0; // 輸入框透明度
let logoOpacity = 0; // Logo placeholder 透明度
let controlPanelOpacity = 0; // Control panel 透明度
const fadeInDuration = 200; // 每個元素 fade in 的持續時間 (ms) - 改成 1s
const fadeInDelay = 500; // 每個元素之間的延遲 (ms)

// --- p5.js 預載入 ---
function preload() {
  font = loadFont("Inter-Medium.ttf");
  // 載入彩蛋圖片
  sccdBlackImg = loadImage('sccd_black.png');
  sccdWhiteImg = loadImage('sccd_white.png');
  // 載入 placeholder SVG wireframe (三層分離 - 黑色和白色版本)
  placeholderR = loadImage('SCCD_R.svg');
  placeholderG = loadImage('SCCD_G.svg');
  placeholderB = loadImage('SCCD_B.svg');
  placeholderR_white = loadImage('SCCD_R_white.svg');
  placeholderG_white = loadImage('SCCD_G_white.svg');
  placeholderB_white = loadImage('SCCD_B_white.svg');
}

// --- 檢測手機模式函數 ---
function checkMobileMode() {
    // 使用 matchMedia API 與CSS媒體查詢保持同步
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    isMobileMode = mediaQuery.matches;
}

// --- 計算Canvas尺寸函數 ---
function getCanvasSize() {
    if (isMobileMode) {
        // 手機版：使用響應式尺寸
        let containerWidth = Math.min(window.innerWidth * 0.9, 400); // 最大不超過400px
        let containerHeight = Math.min(window.innerHeight * 0.4, 420); // 調整最大高度為420px
        
        // 保持比例 4:3 (類似原本的 528:400)
        let aspectRatio = 4 / 3;
        
        // 根據寬度計算高度，如果高度超出則根據高度計算寬度
        let calcHeight = containerWidth / aspectRatio;
        if (calcHeight > containerHeight) {
            containerWidth = containerHeight * aspectRatio;
            calcHeight = containerHeight;
        }
        
        // 確保最小高度為350px，避免字母被切掉
        if (calcHeight < 350) {
            calcHeight = 350;
            containerWidth = calcHeight * aspectRatio; // 相應調整寬度保持比例
        }
        
        return {
            width: Math.floor(containerWidth),
            height: Math.floor(calcHeight)
        };
    } else {
        // 桌面版：保持原本的固定尺寸
        return {
            width: 528,
            height: 400
        };
    }
}

// --- p5.js 初始化設定 ---
function setup() {
  // 選取 HTML 中的 Canvas 容器
  canvasContainer = select('#canvas-container');
  
  // 初始檢測手機模式
  checkMobileMode();
  
  // 根據模式創建合適尺寸的Canvas
  let canvasSize = getCanvasSize();
  let canvas = createCanvas(canvasSize.width, canvasSize.height);
  canvas.parent('canvas-container');

  // --- 移除：不再需要計算中心點 ---
  // circleX = width * 0.7; // 參考 ref.js 的佈局
  // circleY = height * 0.4; // 參考 ref.js 的佈局

  // p5.js 繪圖設定
  textFont(font);
  textSize(350);
  textAlign(CENTER, CENTER);
  imageMode(CENTER); // <-- 新增：將圖片的繪製模式設定為中心對齊

  // --- 修正：使用 Class 選擇器來選取所有 UI 元素 ---
  inputBox = select("#input-box");
  hiddenMeasurer = select("#hidden-measurer");

  rotateButton = select(".custom-button-rotate");
  customButton = select(".custom-button-custom");
  standardButton = select(".custom-button-standard");
  inverseButton = select(".custom-button-inverse");

  // 選取滑動邊框指示器
  colormodeIndicator = select("#colormode-indicator");
  
  // 這些按鈕本身是 button，裡面的 img 只是圖示
  randomButton = select("#random-button"); 
  resetButton = select("#reset-button");
  saveButton = select("#save-button");

  randomImg = select('#random-img');
  resetImg = select('#reset-img');
  saveImg = select('#save-img');

  rSlider = select("#r-slider");
  gSlider = select("#g-slider");
  bSlider = select("#b-slider");

  rAngleLabel = select("#r-angle-label");
  gAngleLabel = select("#g-angle-label");
  bAngleLabel = select("#b-angle-label");

  // --- 選取手機版元素 ---
  inputBoxMobile = select("#input-box-mobile");
  hiddenMeasurerMobile = select("#hidden-measurer-mobile");
  saveButtonMobile = select("#save-button-mobile");
  saveImgMobile = select("#save-img-mobile");

  // 選取手機版按鈕
  let mobileStandardButton = select(".mobile-standard");
  let mobileInverseButton = select(".mobile-inverse");
  let mobileRotateButton = select(".mobile-rotate");
  let mobileCustomButton = select(".mobile-custom");
  let mobileRandomButton = select(".mobile-random-button");
  let mobileResetButton = select(".mobile-reset-button");
  let mobileColormodeIndicator = select(".mobile-colormode-indicator");

  // 選取手機版滑桿
  let mobileRSlider = select(".mobile-r-slider");
  let mobileGSlider = select(".mobile-g-slider");
  let mobileBSlider = select(".mobile-b-slider");
  let mobileRAngleLabel = select(".mobile-r-angle-label");
  let mobileGAngleLabel = select(".mobile-g-angle-label");
  let mobileBAngleLabel = select(".mobile-b-angle-label");

  // 選取手機版圖片
  let mobileRandomImg = select(".mobile-random-img");
  let mobileResetImg = select(".mobile-reset-img");

  // --- 選取下載提示框 ---
  downloadNotification = select("#download-notification");

  // 注意：hiddenMeasurer 變數保留但不再使用（未來可能移除）

  // --- 綁定所有 UI 事件 ---
  inputBox.input(handleInput);
  if (inputBoxMobile) {
    inputBoxMobile.input(handleInput);
  }
  
  // 參考 ref.js:123
  rotateButton.mousePressed(() => {
    if (letters.length > 0 && !isEasterEggActive) {
      // 從 Custom 模式切換到 Auto 模式
      if (!isAutoRotateMode) {
        isAutoRotateMode = true;
        autoRotate = true;
        resetRotationOffsets();
      } else {
        // 已經在 Auto 模式，只是 toggle
        autoRotate = !autoRotate;
        if (autoRotate) {
          resetRotationOffsets();
        }
      }

      // 更新按鈕文字
      if (autoRotate) {
        rotateButton.html('Pause 暫停旋轉');
      } else {
        rotateButton.html('Automatic 自動旋轉');
      }

      updateUI();
    }
  });

  // 參考 ref.js:124
  customButton.mousePressed(() => {
    if (letters.length > 0 && !isEasterEggActive) {
      isAutoRotateMode = false;
      autoRotate = false;

      // 先將所有角度正規化到 -180° 到 180° 範圍（選擇最短路徑）
      for (let i = 0; i < rotationAngles.length; i++) {
        if (rotationAngles[i] !== undefined) {
          // 正規化到 -180° 到 180°（最短路徑）
          rotationAngles[i] = normalizeAngle(rotationAngles[i]);
        }
      }

      // 重置按鈕文字
      rotateButton.html('Automatic 自動旋轉');

      // 使用新的 ease 系統平滑回到 0°
      // 計算回到 0° 的最短路徑
      let rDiff = getShortestRotation(rRotationOffset, 0);
      let gDiff = getShortestRotation(gRotationOffset, 0);
      let bDiff = getShortestRotation(bRotationOffset, 0);

      // 設置目標值
      targetRRotationOffset = rRotationOffset + rDiff;
      targetGRotationOffset = gRotationOffset + gDiff;
      targetBRotationOffset = bRotationOffset + bDiff;

      // 更新滑桿顯示為 0（不調用 updateSliders，避免干擾）
      rSlider.value(0);
      gSlider.value(0);
      bSlider.value(0);

      // 啟動新的 ease 動畫（Custom 模式的 ease）
      isEasingCustomRotation = true;
      // 同時標記需要 ease 回 0°（處理 rotationAngles）
      shouldResetToZero = true;

      updateUI();
    }
  });

  // 參考 ref.js:130
  standardButton.mousePressed(() => {
    targetMode = "Standard";
    updateUI();
  });
  
  // 參考 ref.js:131
  inverseButton.mousePressed(() => {
    targetMode = "Inverse";
    updateUI();
  });

  // 參考 ref.js:126
  randomButton.mousePressed(() => {
      if (letters.length > 0 && !isAutoRotateMode && !isEasterEggActive) {
        // 生成新的隨機角度（限制在 -180° 到 180° 之間，確保最短路徑）
        let newRAngle = floor(random(-180, 180));
        let newGAngle = floor(random(-180, 180));
        let newBAngle = floor(random(-180, 180));

        // 計算最短旋轉路徑
        let rDiff = getShortestRotation(rRotationOffset, newRAngle);
        let gDiff = getShortestRotation(gRotationOffset, newGAngle);
        let bDiff = getShortestRotation(bRotationOffset, newBAngle);

        // 設置目標值為當前值加上最短路徑差值
        targetRRotationOffset = rRotationOffset + rDiff;
        targetGRotationOffset = gRotationOffset + gDiff;
        targetBRotationOffset = bRotationOffset + bDiff;

        // 更新滑桿顯示為正規化後的目標角度
        rSlider.value(normalizeAngle(targetRRotationOffset));
        gSlider.value(normalizeAngle(targetGRotationOffset));
        bSlider.value(normalizeAngle(targetBRotationOffset));

        // 啟動 ease 動畫
        isEasingCustomRotation = true;

        updateUI(); // 更新UI
      }
  });

  // 參考 ref.js:128
  resetButton.mousePressed(() => {
      if (letters.length > 0 && !isAutoRotateMode && !isEasterEggActive) {
        // 計算回到 0° 的最短路徑
        let rDiff = getShortestRotation(rRotationOffset, 0);
        let gDiff = getShortestRotation(gRotationOffset, 0);
        let bDiff = getShortestRotation(bRotationOffset, 0);

        // 設置目標值為當前值加上最短路徑差值
        targetRRotationOffset = rRotationOffset + rDiff;
        targetGRotationOffset = gRotationOffset + gDiff;
        targetBRotationOffset = bRotationOffset + bDiff;

        // 更新滑桿顯示為 0
        rSlider.value(0);
        gSlider.value(0);
        bSlider.value(0);

        // 啟動 ease 動畫
        isEasingCustomRotation = true;

        updateUI(); // 更新UI
      }
  });

  // --- 為滑桿綁定 input 事件，參考 ref.js:135-138 ---
  rSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });
  gSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });
  bSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });

  // --- 綁定手機版按鈕事件（同步桌面版） ---
  if (mobileStandardButton) {
    mobileStandardButton.mousePressed(() => {
      targetMode = "Standard";
      updateUI();
    });
  }

  if (mobileInverseButton) {
    mobileInverseButton.mousePressed(() => {
      targetMode = "Inverse";
      updateUI();
    });
  }

  if (mobileRotateButton) {
    mobileRotateButton.mousePressed(() => {
      if (letters.length > 0 && !isEasterEggActive) {
        if (!isAutoRotateMode) {
          isAutoRotateMode = true;
          autoRotate = true;
          resetRotationOffsets();
        } else {
          autoRotate = !autoRotate;
          if (autoRotate) {
            resetRotationOffsets();
          }
        }
        if (autoRotate) {
          rotateButton.html('Pause 暫停旋轉');
          mobileRotateButton.html('Pause 暫停旋轉');
        } else {
          rotateButton.html('Automatic 自動旋轉');
          mobileRotateButton.html('Automatic 自動旋轉');
        }
        updateUI();
      }
    });
  }

  if (mobileCustomButton) {
    mobileCustomButton.mousePressed(() => {
      if (letters.length > 0 && !isEasterEggActive) {
        isAutoRotateMode = false;
        autoRotate = false;
        for (let i = 0; i < rotationAngles.length; i++) {
          if (rotationAngles[i] !== undefined) {
            rotationAngles[i] = normalizeAngle(rotationAngles[i]);
          }
        }
        rotateButton.html('Automatic 自動旋轉');
        mobileRotateButton.html('Automatic 自動旋轉');
        let rDiff = getShortestRotation(rRotationOffset, 0);
        let gDiff = getShortestRotation(gRotationOffset, 0);
        let bDiff = getShortestRotation(bRotationOffset, 0);
        targetRRotationOffset = rRotationOffset + rDiff;
        targetGRotationOffset = gRotationOffset + gDiff;
        targetBRotationOffset = bRotationOffset + bDiff;
        rSlider.value(0);
        gSlider.value(0);
        bSlider.value(0);
        if (mobileRSlider) mobileRSlider.value(0);
        if (mobileGSlider) mobileGSlider.value(0);
        if (mobileBSlider) mobileBSlider.value(0);
        isEasingCustomRotation = true;
        shouldResetToZero = true;
        updateUI();
      }
    });
  }

  if (mobileRandomButton) {
    mobileRandomButton.mousePressed(() => {
      if (letters.length > 0 && !isAutoRotateMode && !isEasterEggActive) {
        let newRAngle = floor(random(-180, 180));
        let newGAngle = floor(random(-180, 180));
        let newBAngle = floor(random(-180, 180));
        let rDiff = getShortestRotation(rRotationOffset, newRAngle);
        let gDiff = getShortestRotation(gRotationOffset, newGAngle);
        let bDiff = getShortestRotation(bRotationOffset, newBAngle);
        targetRRotationOffset = rRotationOffset + rDiff;
        targetGRotationOffset = gRotationOffset + gDiff;
        targetBRotationOffset = bRotationOffset + bDiff;
        rSlider.value(normalizeAngle(targetRRotationOffset));
        gSlider.value(normalizeAngle(targetGRotationOffset));
        bSlider.value(normalizeAngle(targetBRotationOffset));
        if (mobileRSlider) mobileRSlider.value(normalizeAngle(targetRRotationOffset));
        if (mobileGSlider) mobileGSlider.value(normalizeAngle(targetGRotationOffset));
        if (mobileBSlider) mobileBSlider.value(normalizeAngle(targetBRotationOffset));
        isEasingCustomRotation = true;
        updateUI();
      }
    });
  }

  if (mobileResetButton) {
    mobileResetButton.mousePressed(() => {
      if (letters.length > 0 && !isAutoRotateMode && !isEasterEggActive) {
        let rDiff = getShortestRotation(rRotationOffset, 0);
        let gDiff = getShortestRotation(gRotationOffset, 0);
        let bDiff = getShortestRotation(bRotationOffset, 0);
        targetRRotationOffset = rRotationOffset + rDiff;
        targetGRotationOffset = gRotationOffset + gDiff;
        targetBRotationOffset = bRotationOffset + bDiff;
        rSlider.value(0);
        gSlider.value(0);
        bSlider.value(0);
        if (mobileRSlider) mobileRSlider.value(0);
        if (mobileGSlider) mobileGSlider.value(0);
        if (mobileBSlider) mobileBSlider.value(0);
        isEasingCustomRotation = true;
        updateUI();
      }
    });
  }

  // --- 為手機版滑桿綁定事件 ---
  if (mobileRSlider) {
    mobileRSlider.input(() => {
      if (!isEasterEggActive && !isAutoRotateMode) {
        isEasingCustomRotation = false;
        rRotationOffset = mobileRSlider.value();
        targetRRotationOffset = rRotationOffset;
        rSlider.value(rRotationOffset);
        updateUI();
      }
    });
  }

  if (mobileGSlider) {
    mobileGSlider.input(() => {
      if (!isEasterEggActive && !isAutoRotateMode) {
        isEasingCustomRotation = false;
        gRotationOffset = mobileGSlider.value();
        targetGRotationOffset = gRotationOffset;
        gSlider.value(gRotationOffset);
        updateUI();
      }
    });
  }

  if (mobileBSlider) {
    mobileBSlider.input(() => {
      if (!isEasterEggActive && !isAutoRotateMode) {
        isEasingCustomRotation = false;
        bRotationOffset = mobileBSlider.value();
        targetBRotationOffset = bRotationOffset;
        bSlider.value(bRotationOffset);
        updateUI();
      }
    });
  }

  // --- 綁定Save按鈕事件 ---
  saveButton.mousePressed(() => {
    if (letters.length > 0) {
      saveTransparentPNG();
    }
  });

  // --- 綁定手機版Save按鈕事件 ---
  if (saveButtonMobile) {
    saveButtonMobile.mousePressed(() => {
      if (letters.length > 0) {
        saveTransparentPNG();
      }
    });
  }

  // 初始化響應式檢測
  checkMobileMode();

  // 監聽媒體查詢變化，確保與CSS保持同步
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  mediaQuery.addListener(() => {
    setTimeout(() => {
      checkMobileMode();
      updateUI();
    }, 10);
  });

  // 初始 UI 狀態設定
  updateUI();

  // 初始化指示器位置
  if (colormodeIndicator) {
    colormodeIndicator.addClass('at-standard'); // 預設在 Standard 位置
  }
  if (mobileColormodeIndicator) {
    mobileColormodeIndicator.addClass('at-standard'); // 手機版也預設在 Standard 位置
  }

  // 初始化頁面載入動畫
  pageLoadStartTime = millis();
  // 初始隱藏所有元素
  if (inputBox) inputBox.style('opacity', '0');
  if (inputBoxMobile) inputBoxMobile.style('opacity', '0');
  let controlPanel = select('.control-panel');
  if (controlPanel) controlPanel.style('opacity', '0');
  // placeholder 的 opacity 由 logoOpacity 變數控制，在 draw() 中處理

  // --- 禁用 Canvas 容器的右鍵菜單，防止直接下載 ---
  // 只在 canvas-container 上禁用，不影響其他區域
  if (canvasContainer) {
    canvasContainer.elt.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // --- 啟動打字機動畫 ---
  startTypewriterAnimation();
}

// --- 打字機動畫函數 ---
function startTypewriterAnimation() {
  // 獲取原始 placeholder
  let placeholderText = inputBox.attribute('placeholder');

  // 根據是否為手機模式選擇不同的 placeholder
  if (isMobileMode && inputBoxMobile) {
    placeholderText = inputBoxMobile.attribute('placeholder');
  }

  // 將 placeholder 按換行符分割成行
  typewriterLines = placeholderText.split('\n');

  // 計算總字元數（不包含換行符）
  typewriterTotalChars = typewriterLines.reduce((sum, line) => sum + line.length, 0);

  // 初始化動畫參數
  typewriterCurrentLine = 0;
  typewriterCurrentChar = 0;
  typewriterStartTime = millis();
  typewriterActive = true;

  // 清空 placeholder 準備開始動畫
  inputBox.attribute('placeholder', '');
  if (inputBoxMobile) {
    inputBoxMobile.attribute('placeholder', '');
  }
}

// --- p5.js 繪圖迴圈 ---
function draw() {
  // 保持canvas透明，讓CSS控制頁面背景
  clear();

  // --- 頁面載入動畫 ---
  let timeSinceLoad = millis() - pageLoadStartTime;

  // 1. 輸入框 fade in (0ms - 400ms)
  if (timeSinceLoad < fadeInDuration) {
    inputBoxOpacity = map(timeSinceLoad, 0, fadeInDuration, 0, 1);
  } else {
    inputBoxOpacity = 1;
  }

  // 2. Logo placeholder fade in (200ms - 600ms)
  let logoStartTime = fadeInDelay;
  if (timeSinceLoad >= logoStartTime && timeSinceLoad < logoStartTime + fadeInDuration) {
    logoOpacity = map(timeSinceLoad, logoStartTime, logoStartTime + fadeInDuration, 0, 1);
  } else if (timeSinceLoad >= logoStartTime + fadeInDuration) {
    logoOpacity = 1;
  }

  // 3. Control panel fade in (400ms - 800ms)
  let panelStartTime = fadeInDelay * 2;
  if (timeSinceLoad >= panelStartTime && timeSinceLoad < panelStartTime + fadeInDuration) {
    controlPanelOpacity = map(timeSinceLoad, panelStartTime, panelStartTime + fadeInDuration, 0, 1);
  } else if (timeSinceLoad >= panelStartTime + fadeInDuration) {
    controlPanelOpacity = 1;
  }

  // 應用透明度到 DOM 元素
  if (inputBox) inputBox.style('opacity', inputBoxOpacity.toString());
  if (inputBoxMobile) inputBoxMobile.style('opacity', inputBoxOpacity.toString());
  let controlPanel = select('.control-panel');
  if (controlPanel) controlPanel.style('opacity', controlPanelOpacity.toString());

  // --- 打字機動畫更新 ---
  if (typewriterActive) {
    let elapsed = millis() - typewriterStartTime;
    let progress = constrain(elapsed / typewriterDuration, 0, 1);

    // 計算當前應該已經打了多少個字元（總計）
    let targetTotalChars = floor(progress * typewriterTotalChars);

    // 計算目前已經打了多少字元
    let currentTotalChars = 0;
    for (let i = 0; i < typewriterCurrentLine; i++) {
      currentTotalChars += typewriterLines[i].length;
    }
    currentTotalChars += typewriterCurrentChar;

    // 如果需要前進
    if (targetTotalChars > currentTotalChars) {
      // 計算需要前進多少字元
      let charsToAdd = targetTotalChars - currentTotalChars;

      for (let i = 0; i < charsToAdd; i++) {
        // 檢查當前行是否已經打完
        if (typewriterCurrentChar >= typewriterLines[typewriterCurrentLine].length) {
          // 換到下一行
          typewriterCurrentLine++;
          typewriterCurrentChar = 0;

          // 檢查是否已經打完所有行
          if (typewriterCurrentLine >= typewriterLines.length) {
            typewriterActive = false;
            break;
          }
        } else {
          // 在當前行繼續打字
          typewriterCurrentChar++;
        }
      }

      // 構建當前要顯示的文字
      let displayText = '';
      for (let i = 0; i <= typewriterCurrentLine && i < typewriterLines.length; i++) {
        if (i < typewriterCurrentLine) {
          // 完整顯示之前的行
          displayText += typewriterLines[i];
          if (i < typewriterLines.length - 1) {
            displayText += '\n';
          }
        } else if (i === typewriterCurrentLine) {
          // 部分顯示當前行
          displayText += typewriterLines[i].substring(0, typewriterCurrentChar);
        }
      }

      // 更新 placeholder
      inputBox.attribute('placeholder', displayText);
      if (inputBoxMobile) {
        inputBoxMobile.attribute('placeholder', displayText);
      }
    }

    // 動畫完成
    if (progress >= 1 || !typewriterActive) {
      typewriterActive = false;
      // 顯示完整文字
      let fullText = typewriterLines.join('\n');
      inputBox.attribute('placeholder', fullText);
      if (inputBoxMobile) {
        inputBoxMobile.attribute('placeholder', fullText);
      }
    }
  }

  // 直接處理模式轉換，不需要漸變（CSS有transition效果）
  if (mode !== targetMode) {
    mode = targetMode;
    updateUI(); // 立即更新UI，包括body class
  } 
  
  // --- 淡入淡出邏輯 ---
  let currentLogoAlpha = logoAlpha;
  let currentEasterEggAlpha = easterEggAlpha;

  if (isFading) {
    let elapsedTime = millis() - fadeStartTime;
    let fadeProgress = constrain(elapsedTime / fadeDuration, 0, 1);
    if (isEasterEggActive) {
      currentLogoAlpha = lerp(255, 0, fadeProgress);
      currentEasterEggAlpha = lerp(0, 255, fadeProgress);
    } else {
      currentLogoAlpha = lerp(0, 255, fadeProgress);
      currentEasterEggAlpha = lerp(255, 0, fadeProgress);
    }
    if (fadeProgress === 1) {
      isFading = false;
      logoAlpha = currentLogoAlpha;
      easterEggAlpha = currentEasterEggAlpha;
    }
  } else {
      currentLogoAlpha = isEasterEggActive ? 0 : 255;
      currentEasterEggAlpha = isEasterEggActive ? 255 : 0;
  }
  
  // --- Placeholder SVG 繪製 ---
  // 非彩蛋模式時，當沒有文字或正在 fade out 時繪製（透明度由 placeholderAlpha 控制）
  if (!isEasterEggActive && (letters.length === 0 || placeholderAlpha > 1)) {
    drawPlaceholder(this);
  }

  // --- Logo 繪製 ---
  // 只有在非彩蛋模式、有字母、且透明度大於 0 時才繪製動態 Logo
  if (!isEasterEggActive && letters.length > 0 && currentLogoAlpha > 0) {
    drawLogo(this, currentLogoAlpha);
  }

  // --- 彩蛋圖片繪製 ---
  if (isEasterEggActive && currentEasterEggAlpha > 0) {
    push();
    tint(255, currentEasterEggAlpha);
    // 根據模式選擇要顯示的彩蛋圖片
    let imgToShow = (mode === 'Inverse') ? sccdWhiteImg : sccdBlackImg;
    image(imgToShow, width / 2, height / 2, 360, 360); // 放大 1.2 倍 (300 * 1.2 = 360)
    pop();
  }

  // --- 圓圈動畫與繪製 (覆蓋在上方) ---
  // 在彩蛋模式下不顯示圓圈
  if (showCircle && !isEasterEggActive) {
    if (circleShrinking) {
      // 淡出
      circleAlpha = lerp(circleAlpha, 0, 0.15);
      if (circleAlpha < 1) {
        // 完全淡出後重設狀態
        circleAlpha = 0;
        showCircle = false;
        circleShrinking = false;
      }
    } else {
      // 淡入
      circleAlpha = lerp(circleAlpha, 255, 0.1);
    }
    // 只有在 alpha > 0 時才繪製，避免不必要的繪圖
    if (circleAlpha > 0) {
        drawCentralCircle(this, circleAlpha);
    }
  }
}

// --- 獲取當前活動的輸入框 ---
function getCurrentInputBox() {
    return isMobileMode ? inputBoxMobile : inputBox;
}

function getCurrentHiddenMeasurer() {
    return isMobileMode ? hiddenMeasurerMobile : hiddenMeasurer;
}

// --- 同步兩個輸入框的內容 ---
function syncInputBoxes(sourceValue) {
    if (inputBox && inputBoxMobile) {
        // 桌面版和手機版都是 textarea
        inputBox.value(sourceValue);
        inputBoxMobile.value(sourceValue);
    }
}

// --- 更新 letters 陣列的函數 (重新命名為 handleInput) ---
function handleInput(event) {
    // 確定是哪個輸入框觸發了事件
    let sourceInputBox = event ? event.target : getCurrentInputBox().elt;

    // textarea 使用 value
    let currentInput = sourceInputBox.value;

    // 獲取輸入框的內容，轉換為大寫，並移除所有非字母字元（保留空格和換行以便後續處理）
    let rawInput = currentInput.toUpperCase();
    let validInput = rawInput.replace(/[^A-Z \n]/g, "");

    // 移除開頭的所有空白字元（空格和換行）
    validInput = validInput.replace(/^[\s\n]+/, '');

    // 合併多個連續空格為單個空格
    validInput = validInput.replace(/ {2,}/g, ' ');
    let lines = validInput.split("\n");
    if (lines.length > 3) {
      validInput = lines.slice(0, 3).join("\n");
    }

    // 限制最大字元數為 40（計算純字母，不含空格換行）
    let pureLetters = validInput.replace(/[\s\n]/g, "");
    if (pureLetters.length > 40) {
        // 超過 40 字，需要截斷
        // 重新組裝，保留空格和換行，但只取前 40 個字母
        let letterCount = 0;
        let result = '';
        for (let char of validInput) {
            if (char === ' ' || char === '\n') {
                result += char; // 保留空格和換行
            } else if (letterCount < 40) {
                result += char;
                letterCount++;
            }
        }
        validInput = result;
    }

    // 同步更新兩個輸入框
    syncInputBoxes(validInput);

    // 彩蛋邏輯
    let previousEasterEggState = isEasterEggActive;
    let normalizedInput = validInput.toUpperCase().replace(/[\s\n]/g, "");
    isEasterEggActive = (normalizedInput === easterEggString);
  
    // --- UI 啟用/禁用邏輯 ---
    if (letters.length > 0 && !isEasterEggActive) {
        if (rotateButton.elt.hasAttribute('disabled')) {
            rotateButton.removeAttribute('disabled');
            customButton.removeAttribute('disabled');
            // 首次啟用時，預設進入 custom mode
            isCustomMode = true;
            updateUI();
        }
    } else {
        rotateButton.attribute('disabled', '');
        customButton.attribute('disabled', '');
        // 沒有文字時，關閉 custom mode
        isCustomMode = false;
        updateUI();
    }

    if (isEasterEggActive !== previousEasterEggState) {
        isFading = true;
        fadeStartTime = millis();
    }
  
    // 最終，移除所有空格和換行符，得到用於生成 Logo 的純字母陣列
    let previousLettersLength = letters.length;
    letters = validInput.replace(/[\s\n]/g, "").split("");

    // 控制 Placeholder 的 fade in/out
    if (letters.length === 0) {
      targetPlaceholderAlpha = 255; // Fade in（沒有文字時顯示）
    } else if (previousLettersLength === 0 && letters.length > 0) {
      targetPlaceholderAlpha = 0; // Fade out（剛輸入文字時隱藏）
    }

    // 每次手動輸入文字時，都停止自動旋轉並重置角度
    if (!isEasterEggActive) {
      autoRotate = false;
      isAutoRotateMode = false; // 確保退出自動模式
      // 重置按鈕文字
      rotateButton.html('Automatic 自動旋轉');
    }
    rotationAngles = new Array(letters.length).fill(0);
    originalRotationAngles = [...rotationAngles]; // 儲存一份乾淨的初始角度
  
    // 更新字體大小
    adjustInputFontSize();
  
    // 圓圈顯示邏輯
    if (circleFillTimeout) {
      clearTimeout(circleFillTimeout);
      circleFillTimeout = null;
    }
  
    if (isEasterEggActive) {
        showCircle = false;
        circleShrinking = false;
        circleAlpha = 0;
        autoRotate = false;
        isAutoRotateMode = false;
        if (circleFillTimeout) { clearTimeout(circleFillTimeout); circleFillTimeout = null; }
    } else {
              if (letters.length >= 10) {
        // 從彩蛋模式回到正常模式且字母數 >= 10 時，立即顯示圓圈
        if (previousEasterEggState === true && isEasterEggActive === false) {
          showCircle = true;
          circleAlpha = 255;
          circleShrinking = false;
        }
        else if (!showCircle && !circleShrinking) {
          circleFillTimeout = setTimeout(() => {
            showCircle = true;
            circleAlpha = 0;
            circleShrinking = false;
            circleFillTimeout = null;
          }, 500);
        }
      } else {
        if (showCircle) {
          circleShrinking = true;
        }
      }
    }

    // 在函數結尾呼叫 UI 更新
    updateUI();
}

// --- 繪製 Placeholder SVG Wireframe ---
function drawPlaceholder(pg) {
  // 更新旋轉角度（使用 baseSpeeds: [0.5, -0.5, 1] 對應 R, G, B）
  placeholderRotations[0] += baseSpeeds[0]; // R: 0.5
  placeholderRotations[1] += baseSpeeds[1]; // G: -0.5
  placeholderRotations[2] += baseSpeeds[2]; // B: 1

  // Fade in/out 動畫（fade out: 0.3s，fade in: 0.5s）
  let fadeSpeed = (targetPlaceholderAlpha === 0) ? 0.3 : 0.15; // fade out 快，fade in 慢
  placeholderAlpha = lerp(placeholderAlpha, targetPlaceholderAlpha, fadeSpeed);

  // 結合頁面載入動畫的 opacity
  let finalAlpha = placeholderAlpha * logoOpacity;

  pg.push();
  pg.translate(width / 2, height / 2);
  pg.imageMode(CENTER);

  // 繪製尺寸（放大 1.32 倍：350 * 1.2 * 1.1 = 462）
  let svgSize = 462;

  // 根據模式選擇正確的 SVG 檔案（Standard: 黑色, Inverse: 白色）
  let rImg = (mode === 'Inverse') ? placeholderR_white : placeholderR;
  let gImg = (mode === 'Inverse') ? placeholderG_white : placeholderG;
  let bImg = (mode === 'Inverse') ? placeholderB_white : placeholderB;

  // 繪製 R 層
  pg.push();
  pg.rotate(radians(placeholderRotations[0]));
  pg.tint(255, finalAlpha);
  pg.image(rImg, 0, 0, svgSize, svgSize);
  pg.pop();

  // 繪製 G 層
  pg.push();
  pg.rotate(radians(placeholderRotations[1]));
  pg.tint(255, finalAlpha);
  pg.image(gImg, 0, 0, svgSize, svgSize);
  pg.pop();

  // 繪製 B 層
  pg.push();
  pg.rotate(radians(placeholderRotations[2]));
  pg.tint(255, finalAlpha);
  pg.image(bImg, 0, 0, svgSize, svgSize);
  pg.pop();

  pg.pop();
}

// --- 核心 Logo 繪製邏輯 (直接從 ref.js 移植，簡化版) ---
function drawLogo(pg, alphaMultiplier = 255) {
  let totalLetters = letters.length;
  if (totalLetters === 0) return;

  // 計算每個字母應佔的角度
  let angleStep = 360 / totalLetters;
  
  // 簡單地將字母分為三組
  let sectionSize = floor(totalLetters / 3);
  let remainder = totalLetters % 3;
  let rCount = sectionSize + (remainder > 0 ? 1 : 0);
  let gCount = sectionSize + (remainder > 1 ? 1 : 0);

  // 將原點移動到畫布中心
  pg.push();
  // 修正：統一使用畫布的中心 width/2, height/2
  pg.translate(width / 2, height / 2); 
  
  // 根據當前模式設定混合模式
  pg.blendMode(mode === "Inverse" ? SCREEN : MULTIPLY);

  // --- 旋轉效果 ---
  // 開啟時立即開始，關閉時有減速效果
  if (autoRotate) {
    rotationFactor = 1;
  } else {
    rotationFactor = lerp(rotationFactor, 0, 0.08);
  }

  // 如果需要重設角度到 0°，使用 ease 效果平滑過渡
  if (shouldResetToZero) {
    let allReachedZero = true;

    // 處理 rotationAngles（Auto 模式的旋轉）
    for (let i = 0; i < totalLetters; i++) {
      if (rotationAngles[i] !== undefined) {
        // 使用 lerp 讓角度平滑回到 0°
        rotationAngles[i] = lerp(rotationAngles[i], 0, 0.08);

        // 檢查是否已經很接近 0°
        if (abs(rotationAngles[i]) > 0.1) {
          allReachedZero = false;
        }
      }
    }

    // 處理手動偏移（Custom 模式的 offset）
    rRotationOffset = lerp(rRotationOffset, 0, 0.08);
    gRotationOffset = lerp(gRotationOffset, 0, 0.08);
    bRotationOffset = lerp(bRotationOffset, 0, 0.08);

    // 檢查 offset 是否也接近 0°
    if (abs(rRotationOffset) > 0.1 || abs(gRotationOffset) > 0.1 || abs(bRotationOffset) > 0.1) {
      allReachedZero = false;
    }

    // 如果所有角度都接近 0° 了，完全重設並停止
    if (allReachedZero) {
      rotationAngles = [...originalRotationAngles];
      rRotationOffset = 0;
      gRotationOffset = 0;
      bRotationOffset = 0;
      shouldResetToZero = false;
    }
  }

  // Custom 模式的 ease 動畫（用於 Random 和 Reset 按鈕）
  if (isEasingCustomRotation && !isAutoRotateMode && !isEasterEggActive) {
    let allReachedTarget = true;

    // 使用 lerp 平滑過渡到目標角度
    rRotationOffset = lerp(rRotationOffset, targetRRotationOffset, customEaseSpeed);
    gRotationOffset = lerp(gRotationOffset, targetGRotationOffset, customEaseSpeed);
    bRotationOffset = lerp(bRotationOffset, targetBRotationOffset, customEaseSpeed);

    // 檢查是否已經很接近目標角度
    if (abs(rRotationOffset - targetRRotationOffset) > 0.1) allReachedTarget = false;
    if (abs(gRotationOffset - targetGRotationOffset) > 0.1) allReachedTarget = false;
    if (abs(bRotationOffset - targetBRotationOffset) > 0.1) allReachedTarget = false;

    // 如果已經接近目標，完全設置為目標值並停止 ease
    if (allReachedTarget) {
      rRotationOffset = targetRRotationOffset;
      gRotationOffset = targetGRotationOffset;
      bRotationOffset = targetBRotationOffset;

      // 正規化角度值到 -180° 到 180°
      rRotationOffset = normalizeAngle(rRotationOffset);
      gRotationOffset = normalizeAngle(gRotationOffset);
      bRotationOffset = normalizeAngle(bRotationOffset);

      // 同步更新目標值
      targetRRotationOffset = rRotationOffset;
      targetGRotationOffset = gRotationOffset;
      targetBRotationOffset = bRotationOffset;

      isEasingCustomRotation = false;
    }
  }

  for (let i = 0; i < totalLetters; i++) {
    let letter = letters[i];

    // 獲取當前 textSize（從 pg 的設定中）
    // 注意：p5.Graphics 沒有直接的 getter，所以我們需要用其他方式
    // 在這裡直接使用全域的 textSize，因為 setup 時設定為 350
    // 但在保存時會臨時修改為 700
    let currentTextSize = pg._renderer._textSize || 350;

    // 獲取字母的邊界，以計算垂直偏移，使其中心對齊
    let bounds = font.textBounds(letter, 0, 0, currentTextSize);
    let offsetY = bounds.y + bounds.h / 2;
    
    // 決定當前字母的顏色
    let colorIndex;
    if (i < rCount) {
      colorIndex = 0; // 紅色組
    } else if (i < rCount + gCount) {
      colorIndex = 1; // 綠色組
    } else {
      colorIndex = 2; // 藍色組
    }
    
    // --- 更新每個字母的旋轉角度 ---
    // 只有在不是 ease 回 0° 的狀態下，才累積旋轉角度
    if (!shouldResetToZero) {
      let rotationSpeed = baseSpeeds[colorIndex] * rotationFactor;
      if (rotationAngles[i] === undefined) { rotationAngles[i] = 0; }
      rotationAngles[i] += rotationSpeed;
    }

    // --- 應用手動偏移 ---
    let currentManualOffset;
    if (colorIndex === 0) { currentManualOffset = rRotationOffset; }
    else if (colorIndex === 1) { currentManualOffset = gRotationOffset; }
    else { currentManualOffset = bRotationOffset; }

    let [r, g, b] = colors[colorIndex];
    pg.fill(r, g, b, alphaMultiplier); // 使用對應的顏色，並應用透明度
    pg.noStroke();

    pg.push();
    // 計算並應用旋轉角度
    // 修正：減去最後一個字母的角度，確保最後一個字母在 0 度位置
    let rotationOffset = (totalLetters > 1) ? (totalLetters - 1) * angleStep : 0;
    let finalAngle = radians(i * angleStep - rotationOffset + rotationAngles[i] + currentManualOffset);
    pg.rotate(finalAngle);

    // 特殊處理 'W'，因為它通常比較寬
    if (letter === 'W') {
      pg.scale(0.85);
    }
    
    // 在旋轉後的坐標系中繪製文字
    // (0, -offsetY) 讓文字的中心點落在圓周上
    pg.text(letter, 0, -offsetY);
    pg.pop();
  }
  
  // 恢復混合模式和坐標系
  pg.blendMode(BLEND);
  pg.pop();
}

// --- 繪製中央圓圈的函數 ---
function drawCentralCircle(pg, alpha, diameter = 250) {
    pg.push();
    // 修正：統一使用畫布的中心 width/2, height/2
    pg.translate(width / 2, height / 2);
    // 根據模式設定圓圈顏色
    pg.fill(mode === "Inverse" ? 255 : 0, alpha);
    pg.noStroke();
    // 圓圈直徑（可自訂，預設 250）
    pg.circle(0, 0, diameter);
    pg.pop();
}

// --- 新增：調整輸入框字體大小的函數 ---
function adjustInputFontSize() {
    // 在手機模式下，字體大小由CSS控制，不需要動態調整
    if (isMobileMode) return;

    let targetFontSize;

    if (!isEasterEggActive) {
        // 計算字元數（移除空格和換行）
        let charCount = letters.length;

        // 根據字元數決定字體大小
        if (charCount === 0) {
            targetFontSize = largeFontSize; // 空白時使用大字體
        } else if (charCount <= 15) {
            targetFontSize = largeFontSize; // 1-15 字：120px
        } else if (charCount <= 30) {
            targetFontSize = mediumFontSize; // 16-30 字：90px
        } else {
            targetFontSize = smallFontSize; // 31-40 字：60px
        }

        // 更新字體大小
        inputBox.style("font-size", targetFontSize);
    } else {
        // 彩蛋模式使用中字體
        targetFontSize = mediumFontSize;
        inputBox.style("font-size", targetFontSize);
    }

    // 等待 CSS transition 完成後再測量（font-size transition 是 0.2s = 200ms）
    // 加上一點緩衝時間確保渲染完成
    setTimeout(() => {
        adjustTextareaHeight(targetFontSize);
    }, 220);
}

// --- 精確的垂直置中函數（使用隱藏 div 測量）---
function adjustTextareaHeight(fontSize) {
    if (isMobileMode || !inputBox) return;

    // 獲取當前內容
    let content = inputBox.value();

    // 如果沒有內容，padding-top 設為 0
    if (!content || content.length === 0) {
        inputBox.style('padding-top', '0px');
        return;
    }

    // 如果沒有傳入 fontSize，從 inputBox 讀取
    if (!fontSize) {
        fontSize = inputBox.style('font-size');
    }

    // 創建臨時測量 div
    let measurer = createDiv('');
    measurer.style('position', 'absolute');
    measurer.style('visibility', 'hidden');
    measurer.style('top', '-9999px');
    measurer.style('left', '-9999px');
    measurer.style('width', (inputBox.width - 20) + 'px'); // 減去左右 padding
    measurer.style('font-family', inputBox.style('font-family'));
    measurer.style('font-size', fontSize); // 使用傳入的字體大小
    measurer.style('line-height', inputBox.style('line-height'));
    measurer.style('white-space', 'pre-wrap');
    measurer.style('word-wrap', 'break-word');
    measurer.style('padding', '0');
    measurer.style('margin', '0');
    measurer.style('border', 'none');
    measurer.style('box-sizing', 'border-box');

    // 設定內容（轉換換行為 <br>）
    measurer.html(content.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;'));

    // 強制瀏覽器重新計算佈局
    measurer.elt.offsetHeight; // 觸發 reflow

    // 測量高度
    let contentHeight = measurer.elt.offsetHeight;
    let containerHeight = 400;

    // 計算 padding-top
    let paddingTop = Math.max(0, (containerHeight - contentHeight) / 2);

    // 設定 padding
    inputBox.style('padding-top', paddingTop + 'px');

    // 移除測量 div
    measurer.remove();
}


// --- 新增：角度正規化函數（將角度正規化到 -180° 到 180° 之間）---
function normalizeAngle(angle) {
    angle = angle % 360;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    return angle;
}

// --- 新增：計算最短旋轉路徑 ---
function getShortestRotation(currentAngle, targetAngle) {
    // 計算差值
    let diff = targetAngle - currentAngle;
    // 正規化差值到 -180° 到 180°
    return normalizeAngle(diff);
}

// --- 新增：重設角度偏移的輔助函數 ---
function resetRotationOffsets() {
    rSlider.value(0);
    gSlider.value(0);
    bSlider.value(0);
    updateSliders(); // 確保全域變數也被更新
}

// --- 新增：更新顏色模式指示器位置 ---
function updateColormodeIndicator() {
    // 更新桌面版指示器
    if (colormodeIndicator) {
        colormodeIndicator.removeClass('at-standard');
        colormodeIndicator.removeClass('at-inverse');
        if (targetMode === "Standard") {
            colormodeIndicator.addClass('at-standard');
        } else {
            colormodeIndicator.addClass('at-inverse');
        }
    }

    // 更新手機版指示器
    let mobileColormodeIndicator = select('.mobile-colormode-indicator');
    if (mobileColormodeIndicator) {
        mobileColormodeIndicator.removeClass('at-standard');
        mobileColormodeIndicator.removeClass('at-inverse');
        if (targetMode === "Standard") {
            mobileColormodeIndicator.addClass('at-standard');
        } else {
            mobileColormodeIndicator.addClass('at-inverse');
        }
    }
}

// --- 新增：顯示下載提示框 ---
function showDownloadNotification() {
    if (!downloadNotification) return;

    // 移除 hidden 類別並添加 show 類別
    downloadNotification.removeClass('hidden');
    // 需要小延遲讓瀏覽器先渲染 DOM 變化，然後才能觸發 CSS transition
    setTimeout(() => {
        downloadNotification.addClass('show');
    }, 10);

    // 1 秒後開始淡出
    setTimeout(() => {
        downloadNotification.removeClass('show');
        // 等待淡出動畫完成後隱藏元素
        setTimeout(() => {
            downloadNotification.addClass('hidden');
        }, 200); // 對應 CSS 的 transition 時間
    }, 1000);
}

// --- 完全參照 ref.js:278-346 重寫 updateUI ---
function updateUI() {
    const hasText = letters.length > 0;
    const isStandardTarget = (targetMode === "Standard");
    const isInverseTarget = (targetMode === "Inverse");
    const activeColor = (mode === "Inverse" ? "white" : "black");
    const activeBorder = (mode === "Inverse" ? "2px solid white" : "2px solid black");
    const body = select('body');

    // 更新顏色模式指示器位置
    updateColormodeIndicator();

    // 更新 Body Class
    body.class(mode === 'Inverse' ? 'inverse-mode' : 'standard-mode');
    
    // 更新輸入框顏色
    inputBox.style("color", activeColor);
    if (inputBoxMobile) {
        inputBoxMobile.style("color", activeColor);
    }

    if (isEasterEggActive) {
        // --- 彩蛋模式 UI ---
        // 隱藏整個 rotation-box
        select('#rotation-box').style('display', 'none');

        standardButton.style('display', 'flex');
        inverseButton.style('display', 'flex');
        saveButton.style('display', 'flex');

        standardButton.elt.disabled = isStandardTarget;
        standardButton.style("color", isStandardTarget ? activeColor : disabledColor);
        standardButton.style("cursor", isStandardTarget ? "default" : "pointer");
        if (isStandardTarget) {
            standardButton.addClass('active');
        } else {
            standardButton.removeClass('active');
        }

        inverseButton.elt.disabled = isInverseTarget;
        inverseButton.style("color", isInverseTarget ? activeColor : disabledColor);
        inverseButton.style("cursor", isInverseTarget ? "default" : "pointer");
        if (isInverseTarget) {
            inverseButton.addClass('active');
        } else {
            inverseButton.removeClass('active');
        }

        // 修復：設定正確的圖片元素
        saveImg.attribute('src', mode === "Inverse" ? 'save_white.svg' : 'save_black.svg');
        saveButton.style('cursor', 'pointer');
        saveButton.elt.disabled = false;

    } else {
        // --- 正常模式 UI ---
        // 顯示整個 rotation-box
        select('#rotation-box').style('display', 'flex');

        rotateButton.style('display', 'flex');
        customButton.style('display', 'flex');

        // 更新 Auto/Custom 按鈕（使用 class 控制邊框）
        rotateButton.elt.disabled = !hasText;
        rotateButton.style("color", !hasText ? disabledColor : isAutoRotateMode ? activeColor : disabledColor);
        rotateButton.style("cursor", !hasText ? 'not-allowed' : "pointer");
        // 使用 class 控制 active 狀態
        if (hasText && isAutoRotateMode) {
            rotateButton.addClass('active');
        } else {
            rotateButton.removeClass('active');
        }

        customButton.elt.disabled = !hasText;
        customButton.style("color", !hasText ? disabledColor : !isAutoRotateMode ? activeColor : disabledColor);
        customButton.style("cursor", !hasText ? 'not-allowed' : "pointer");
        // 使用 class 控制 active 狀態
        if (hasText && !isAutoRotateMode) {
            customButton.addClass('active');
        } else {
            customButton.removeClass('active');
        }

        // 更新 Standard/Inverse 按鈕（不受hasText影響，總是顯示狀態）
        // 這些按鈕不需要 border，因為使用滑動指示器
        standardButton.style('display', 'flex');
        inverseButton.style('display', 'flex');
        standardButton.elt.disabled = isStandardTarget;
        standardButton.style("color", isStandardTarget ? activeColor : disabledColor);
        standardButton.style("cursor", isStandardTarget ? "default" : "pointer");
        // 使用 class 控制 active 狀態（但邊框由指示器處理）
        if (isStandardTarget) {
            standardButton.addClass('active');
        } else {
            standardButton.removeClass('active');
        }

        inverseButton.elt.disabled = isInverseTarget;
        inverseButton.style("color", isInverseTarget ? activeColor : disabledColor);
        inverseButton.style("cursor", isInverseTarget ? "default" : "pointer");
        if (isInverseTarget) {
            inverseButton.addClass('active');
        } else {
            inverseButton.removeClass('active');
        }

        // 更新 Custom 控制面板
        const customControlsEnabled = hasText && !isAutoRotateMode;
        const customControlsContainer = select('#custom-angle-controls');

        if (customControlsEnabled) {
            customControlsContainer.style('display', 'flex');
            randomButton.style('display', 'flex');
            resetButton.style('display', 'flex');
        } else {
            customControlsContainer.style('display', 'none');
            randomButton.style('display', 'none');
            resetButton.style('display', 'none');
        }

        // 更新 Random/Reset 圖示
        randomButton.elt.disabled = !customControlsEnabled;
        resetButton.elt.disabled = !customControlsEnabled;
        randomButton.style('cursor', customControlsEnabled ? 'pointer' : 'not-allowed');
        resetButton.style('cursor', customControlsEnabled ? 'pointer' : 'not-allowed');
        randomImg.attribute('src', customControlsEnabled ? `random_${mode === "Inverse" ? 'white' : 'black'}.svg` : 'random_gray.svg');
        resetImg.attribute('src', customControlsEnabled ? `reset_${mode === "Inverse" ? 'white' : 'black'}.svg` : 'reset_gray.svg');
        
        // 更新滑桿
        const sliders = [rSlider, gSlider, bSlider];
        const labels = [rAngleLabel, gAngleLabel, bAngleLabel];
        sliders.forEach((slider, i) => {
            slider.elt.disabled = !customControlsEnabled;
            if (customControlsEnabled) {
                slider.addClass('enabled');
                labels[i].addClass('enabled');
                // 動態設定滑桿顏色，參考 ref.js:317-320
                slider.elt.style.setProperty("--track-color", `rgb(${colors[i].join(',')})`);
                slider.elt.style.setProperty("--thumb-color", `rgb(${colors[i].join(',')})`);
                labels[i].style("color", `rgb(${colors[i].join(',')})`);
            } else {
                slider.removeClass('enabled');
                labels[i].removeClass('enabled');
                // 可選：移除屬性或設為預設顏色
                labels[i].style("color", disabledColor);
            }
        });
        
        // 更新滑桿數值標籤，並加上正號
        let rVal = Math.round(rSlider.value());
        let gVal = Math.round(gSlider.value());
        let bVal = Math.round(bSlider.value());
        rAngleLabel.html((rVal > 0 ? "+" : "") + rVal);
        gAngleLabel.html((gVal > 0 ? "+" : "") + gVal);
        bAngleLabel.html((bVal > 0 ? "+" : "") + bVal);

        // 更新 Save 按鈕
        saveButton.style('display', 'flex');
        saveButton.elt.disabled = !hasText;
        saveButton.style('cursor', hasText ? 'pointer' : 'not-allowed');
        saveImg.attribute('src', hasText ? `save_${mode === "Inverse" ? 'white' : 'black'}.svg` : 'save_gray.svg');
    }
    
    // 更新手機版 Save 按鈕
    if (saveButtonMobile && saveImgMobile) {
        saveButtonMobile.elt.disabled = !hasText;
        saveButtonMobile.style('cursor', hasText ? 'pointer' : 'not-allowed');
        saveImgMobile.attribute('src', hasText ? `save_${mode === "Inverse" ? 'white' : 'black'}.svg` : 'save_gray.svg');
    }
    
    // 手機版：更新UI
    let mobileRotateButton = select('.mobile-rotate');
    let mobileCustomButton = select('.mobile-custom');
    let mobileStandardButton = select('.mobile-standard');
    let mobileInverseButton = select('.mobile-inverse');
    let mobileRandomButton = select('.mobile-random-button');
    let mobileResetButton = select('.mobile-reset-button');
    let mobileRandomImg = select('.mobile-random-img');
    let mobileResetImg = select('.mobile-reset-img');
    let mobileCustomAngleControls = select('.mobile-custom-angle-controls');

    if (mobileStandardButton && mobileInverseButton) {
        mobileStandardButton.elt.disabled = isStandardTarget;
        mobileStandardButton.style("color", isStandardTarget ? activeColor : disabledColor);
        mobileStandardButton.style("cursor", isStandardTarget ? "default" : "pointer");

        mobileInverseButton.elt.disabled = isInverseTarget;
        mobileInverseButton.style("color", isInverseTarget ? activeColor : disabledColor);
        mobileInverseButton.style("cursor", isInverseTarget ? "default" : "pointer");
    }

    if (mobileRotateButton && mobileCustomButton) {
        mobileRotateButton.elt.disabled = !hasText;
        mobileRotateButton.style("color", !hasText ? disabledColor : isAutoRotateMode ? activeColor : disabledColor);
        mobileRotateButton.style("cursor", !hasText ? 'not-allowed' : "pointer");
        if (hasText && isAutoRotateMode) {
            mobileRotateButton.addClass('active');
        } else {
            mobileRotateButton.removeClass('active');
        }

        mobileCustomButton.elt.disabled = !hasText;
        mobileCustomButton.style("color", !hasText ? disabledColor : !isAutoRotateMode ? activeColor : disabledColor);
        mobileCustomButton.style("cursor", !hasText ? 'not-allowed' : "pointer");
        if (hasText && !isAutoRotateMode) {
            mobileCustomButton.addClass('active');
        } else {
            mobileCustomButton.removeClass('active');
        }
    }

    // 更新手機版 Custom 控制面板
    const customControlsEnabled = hasText && !isAutoRotateMode;

    if (mobileCustomAngleControls) {
        if (customControlsEnabled) {
            mobileCustomAngleControls.removeClass('hidden');
        } else {
            mobileCustomAngleControls.addClass('hidden');
        }
    }

    if (mobileRandomButton && mobileResetButton && mobileRandomImg && mobileResetImg) {
        mobileRandomButton.elt.disabled = !customControlsEnabled;
        mobileResetButton.elt.disabled = !customControlsEnabled;
        mobileRandomButton.style('cursor', customControlsEnabled ? 'pointer' : 'not-allowed');
        mobileResetButton.style('cursor', customControlsEnabled ? 'pointer' : 'not-allowed');
        mobileRandomImg.attribute('src', customControlsEnabled ? `random_${mode === "Inverse" ? 'white' : 'black'}.svg` : 'random_gray.svg');
        mobileResetImg.attribute('src', customControlsEnabled ? `reset_${mode === "Inverse" ? 'white' : 'black'}.svg` : 'reset_gray.svg');
    }

    // 更新手機版滑桿
    let mobileRSlider = select('.mobile-r-slider');
    let mobileGSlider = select('.mobile-g-slider');
    let mobileBSlider = select('.mobile-b-slider');
    let mobileRAngleLabel = select('.mobile-r-angle-label');
    let mobileGAngleLabel = select('.mobile-g-angle-label');
    let mobileBAngleLabel = select('.mobile-b-angle-label');

    if (mobileRSlider && mobileGSlider && mobileBSlider && mobileRAngleLabel && mobileGAngleLabel && mobileBAngleLabel) {
        const mobileSliders = [mobileRSlider, mobileGSlider, mobileBSlider];
        const mobileLabels = [mobileRAngleLabel, mobileGAngleLabel, mobileBAngleLabel];
        mobileSliders.forEach((slider, i) => {
            slider.elt.disabled = !customControlsEnabled;
            if (customControlsEnabled) {
                slider.addClass('enabled');
                mobileLabels[i].addClass('enabled');
                slider.elt.style.setProperty("--track-color", `rgb(${colors[i].join(',')})`);
                slider.elt.style.setProperty("--thumb-color", `rgb(${colors[i].join(',')})`);
                mobileLabels[i].style("color", `rgb(${colors[i].join(',')})`);
            } else {
                slider.removeClass('enabled');
                mobileLabels[i].removeClass('enabled');
                mobileLabels[i].style("color", disabledColor);
            }
        });

        // 同步滑桿數值
        let rVal = Math.round(rSlider.value());
        let gVal = Math.round(gSlider.value());
        let bVal = Math.round(bSlider.value());
        mobileRAngleLabel.html((rVal > 0 ? "+" : "") + rVal);
        mobileGAngleLabel.html((gVal > 0 ? "+" : "") + gVal);
        mobileBAngleLabel.html((bVal > 0 ? "+" : "") + bVal);
    }

    // 手機版：動態調整 logo 和操作區域的占比
    if (isMobileMode) {
        const displayArea = select('.display-area');
        const mobileControlsWrapper = select('.mobile-controls-wrapper');

        if (customControlsEnabled) {
            // Custom展開：logo占4，操作區域占6
            displayArea.addClass('expanded');
            mobileControlsWrapper.addClass('expanded');
        } else {
            // 沒有輸入文字或Custom沒展開：logo占7，操作區域占3
            displayArea.removeClass('expanded');
            mobileControlsWrapper.removeClass('expanded');
        }
    }
}

function updateSliders() {
    // 當用戶手動拖動滑桿時，取消 ease 動畫並立即更新
    isEasingCustomRotation = false;

    // 同時更新當前值和目標值
    rRotationOffset = rSlider.value();
    gRotationOffset = gSlider.value();
    bRotationOffset = bSlider.value();

    targetRRotationOffset = rRotationOffset;
    targetGRotationOffset = gRotationOffset;
    targetBRotationOffset = bRotationOffset;
}


function getRotationFor(layer, index) {
    let baseRotation = 0;
    // --- 應用自訂角度偏移 ---
    if (layer === 0) baseRotation += rRotationOffset; // R
    if (layer === 1) baseRotation += gRotationOffset; // G
    if (layer === 2) baseRotation += bRotationOffset; // B

    return baseRotation;
}


// --- 視窗大小調整處理 ---
function windowResized() {
    // 延遲處理響應式變化，確保CSS媒體查詢先生效
    setTimeout(() => {
        // 更新響應式模式檢測
        checkMobileMode();

        // 根據新的模式重新計算並調整Canvas尺寸
        let canvasSize = getCanvasSize();
        resizeCanvas(canvasSize.width, canvasSize.height);

        // 調整字體大小和輸入框高度（僅桌面版）
        if (!isMobileMode) {
            adjustInputFontSize(); // 這個函數內部會調用 adjustTextareaHeight()
        }

        // 更新UI以反映可能的模式變化
        updateUI();
    }, 50); // 50ms延遲，讓CSS媒體查詢先生效
}

// --- 保存透明PNG函數 ---
function saveTransparentPNG() {
  // 顯示提示框
  showDownloadNotification();

  // 延遲 1 秒後開始下載
  setTimeout(() => {
    performDownload();
  }, 1000);
}

// --- 實際執行下載的函數 ---
function performDownload() {
  const saveSize = 1080;

  if (isEasterEggActive) {
    // 彩蛋模式：保存靜態圖片
    let imgToSave = (mode === 'Inverse') ? sccdWhiteImg : sccdBlackImg;
    if (imgToSave) {
      let pg = createGraphics(imgToSave.width, imgToSave.height);
      pg.image(imgToSave, 0, 0);
      pg.save("sccd_logo.png");
    }
  } else {
    // 正常模式：創建一個 1080x1080 的高解析度畫布來儲存
    let pg = createGraphics(saveSize, saveSize);
    const scaleFactor = 2; // 放大倍數

    // 設定繪圖參數（保持原本的參數）
    pg.textFont(font);
    pg.textSize(350); // 保持原本的大小
    pg.textAlign(CENTER, CENTER);
    pg.imageMode(CENTER);

    // 臨時保存全域的 width 和 height
    let tempWidth = width;
    let tempHeight = height;

    // 暫時修改全域變數為原始canvas尺寸（540），而不是saveSize（1080）
    // 這樣 drawLogo 和 drawCentralCircle 會使用 540/2 = 270 作為中心點
    width = saveSize / scaleFactor; // 540
    height = saveSize / scaleFactor; // 540

    pg.push();
    pg.scale(scaleFactor); // 將整個內容放大2倍

    // 如果顯示圓圈，先繪製圓圈（使用原本的參數）
    if (showCircle) {
      drawCentralCircle(pg, 255); // 使用預設直徑 250
    }

    // 繪製logo（使用原本的參數）
    drawLogo(pg, 255);

    pg.pop();

    // 恢復原本的 width 和 height
    width = tempWidth;
    height = tempHeight;

    // 保存文件
    pg.save("sccd_logo_1080.png");
  }
}

// --- 鍵盤事件處理 ---
function keyPressed() {
  // 當按下 ENTER 鍵時
  if (keyCode === ENTER) {
    // 如果有字母且不在彩蛋模式，就觸發自動旋轉
    if (letters.length > 0 && !isEasterEggActive) {
      isAutoRotateMode = true;
      autoRotate = true;
      resetRotationOffsets();
      updateUI();
    }
    // 阻止瀏覽器預設行為 (例如在 textarea 中換行)
    return false; 
  }
  else if (keyCode === BACKSPACE) {
    // 按下 BACKSPACE 時，停止自動旋轉並重設狀態
    autoRotate = false;
    isAutoRotateMode = false;
    resetRotationOffsets();
    rotationAngles = [...originalRotationAngles];
    if (circleFillTimeout) {
      clearTimeout(circleFillTimeout);
      circleFillTimeout = null;
    }
    // inputBox.input() 會在之後觸發，所以這裡只需更新樣式
    updateUI();
  }
}
