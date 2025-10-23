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

  // --- 選取下載提示框 ---
  downloadNotification = select("#download-notification");

  // --- 重新對齊 hidden-measurer 的設定，參考 ref.js:82-86 ---
  hiddenMeasurer.style('font-family', inputBox.style('font-family'));
  hiddenMeasurer.style('font-size', inputBox.style('font-size'));
  hiddenMeasurer.style('white-space', 'pre-wrap');
  hiddenMeasurer.style('word-wrap', 'break-word');
  hiddenMeasurer.style('visibility', 'hidden');
  hiddenMeasurer.style('position', 'absolute');
  hiddenMeasurer.style('top', '-9999px');
  hiddenMeasurer.style('left', '-9999px');

  // --- 設定手機版隱藏測量器 ---
  if (hiddenMeasurerMobile) {
    hiddenMeasurerMobile.style('font-family', inputBox.style('font-family'));
    hiddenMeasurerMobile.style('font-size', inputBox.style('font-size'));
    hiddenMeasurerMobile.style('white-space', 'pre-wrap');
    hiddenMeasurerMobile.style('word-wrap', 'break-word');
    hiddenMeasurerMobile.style('visibility', 'hidden');
    hiddenMeasurerMobile.style('position', 'absolute');
    hiddenMeasurerMobile.style('top', '-9999px');
    hiddenMeasurerMobile.style('left', '-9999px');
  }

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
          let angle = rotationAngles[i] % 360;
          if (angle > 180) angle -= 360;   // 如果 > 180°，往負方向
          if (angle < -180) angle += 360;  // 如果 < -180°，往正方向
          rotationAngles[i] = angle;
        }
      }

      // 重置按鈕文字
      rotateButton.html('Automatic 自動旋轉');

      // 標記需要 ease 回 0°
      shouldResetToZero = true;
      // 重設滑桿
      resetRotationOffsets();
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
        rSlider.value(floor(random(-360, 360)));
        gSlider.value(floor(random(-360, 360)));
        bSlider.value(floor(random(-360, 360)));
        updateSliders(); // 更新偏移值
        updateUI(); // 更新UI
      }
  });

  // 參考 ref.js:128
  resetButton.mousePressed(() => {
      if (letters.length > 0 && !isAutoRotateMode && !isEasterEggActive) {
        // 觸發 ease 回到 0° 的效果
        shouldResetToZero = true;
        // 先將 slider 設為 0，但實際的角度會平滑過渡
        rSlider.value(0);
        gSlider.value(0);
        bSlider.value(0);
        updateSliders(); // 更新偏移值
        updateUI(); // 更新UI
      }
  });

  // --- 為滑桿綁定 input 事件，參考 ref.js:135-138 ---
  rSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });
  gSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });
  bSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });


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
        inputBox.value(sourceValue);
        inputBoxMobile.value(sourceValue);
    }
}

// --- 更新 letters 陣列的函數 (重新命名為 handleInput) ---
function handleInput(event) {
    // 確定是哪個輸入框觸發了事件
    let sourceInputBox = event ? event.target : getCurrentInputBox().elt;
    let currentInput = sourceInputBox.value;
    
    // 獲取輸入框的內容，轉換為大寫，並移除所有非字母字元（保留空格和換行以便後續處理）
    let rawInput = currentInput.toUpperCase();
    let validInput = rawInput.replace(/[^A-Z \n]/g, ""); 
    validInput = validInput.replace(/ {2,}/g, ' ');
    let lines = validInput.split("\n");
    if (lines.length > 3) {
      validInput = lines.slice(0, 3).join("\n");
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

  // 繪製尺寸（放大 1.2 倍：350 * 1.2 = 420）
  let svgSize = 420;

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

    if (!isEasterEggActive) {
        // 計算字元數（移除空格和換行）
        let charCount = letters.length;

        let targetFontSize;
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
        let currentFontSize = inputBox.style('font-size');
        if (currentFontSize !== targetFontSize) {
            inputBox.style("font-size", targetFontSize);
            // 字體大小改變時，強制在下一幀重新計算 padding
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    adjustVerticalPadding();
                });
            });
        } else {
            // 字體沒變，但內容可能變了，仍需調整 padding
            adjustVerticalPadding();
        }
    } else {
        // 彩蛋模式使用中字體
        if (inputBox.style('font-size') !== mediumFontSize) {
            inputBox.style("font-size", mediumFontSize);
        }
        adjustVerticalPadding();
    }
}

// --- 新增：調整輸入框垂直置中的函數 ---
function adjustVerticalPadding() {
    if (isMobileMode || !inputBox) return;

    // 使用 hiddenMeasurer 來測量文字實際高度
    if (!hiddenMeasurer) return;

    // 設定內容
    let content = inputBox.value();
    if (content.length === 0) {
        // 空白時不需要 padding
        inputBox.style('padding-top', '0px');
        return;
    }

    // 同步設定（使用最新的字體大小）
    hiddenMeasurer.style('width', inputBox.width + 'px');
    hiddenMeasurer.style('font-size', inputBox.style('font-size'));
    hiddenMeasurer.style('font-family', inputBox.style('font-family'));
    hiddenMeasurer.style('line-height', inputBox.style('line-height'));
    hiddenMeasurer.style('white-space', 'pre-wrap');
    hiddenMeasurer.style('word-wrap', 'break-word');
    hiddenMeasurer.style('text-align', 'left');

    hiddenMeasurer.html(content.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;'));

    // 強制瀏覽器重新計算佈局
    hiddenMeasurer.elt.offsetHeight; // 觸發 reflow

    // 測量高度
    let contentHeight = hiddenMeasurer.elt.offsetHeight;
    let containerHeight = 400; // inputBox 的高度

    // 計算需要的 padding-top 讓文字垂直置中
    let paddingTop = Math.max(0, (containerHeight - contentHeight) / 2);

    inputBox.style('padding-top', paddingTop + 'px');
}

// --- 新增：計算實際行數的函數 ---
function getActualLineCount(text) {
    if (!text || text.length === 0) return 0;
    
    // 計算手動換行數量
    let manualLineBreaks = (text.match(/\n/g) || []).length;
    
    // 建立臨時測量元素來計算自動換行
    let tempMeasurer = createDiv('');
    tempMeasurer.style('font-family', inputBox.style('font-family'));
    tempMeasurer.style('font-size', inputBox.style('font-size'));
    tempMeasurer.style('width', inputBox.width + 'px');
    tempMeasurer.style('white-space', 'pre-wrap');
    tempMeasurer.style('word-wrap', 'break-word');
    tempMeasurer.style('visibility', 'hidden');
    tempMeasurer.style('position', 'absolute');
    tempMeasurer.style('top', '-9999px');
    tempMeasurer.style('left', '-9999px');
    tempMeasurer.style('padding', '0');
    tempMeasurer.style('margin', '0');
    tempMeasurer.style('border', 'none');
    tempMeasurer.style('line-height', '1.2');
    
    // 設定測試內容
    tempMeasurer.html(text.replace(/\n/g, '<br>'));
    
    // 測量單行高度
    let singleLineDiv = createDiv('A');
    singleLineDiv.style('font-family', inputBox.style('font-family'));
    singleLineDiv.style('font-size', inputBox.style('font-size'));
    singleLineDiv.style('visibility', 'hidden');
    singleLineDiv.style('position', 'absolute');
    singleLineDiv.style('top', '-9999px');
    singleLineDiv.style('left', '-9999px');
    singleLineDiv.style('white-space', 'nowrap');
    singleLineDiv.style('line-height', '1.2');
    
    let singleLineHeight = singleLineDiv.elt.offsetHeight;
    let totalHeight = tempMeasurer.elt.offsetHeight;
    
    // 計算實際行數
    let calculatedLines = Math.round(totalHeight / singleLineHeight);
    
    // 清理臨時元素
    tempMeasurer.remove();
    singleLineDiv.remove();
    
    return calculatedLines;
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
    if (!colormodeIndicator) return;

    // 移除所有位置類別
    colormodeIndicator.removeClass('at-standard');
    colormodeIndicator.removeClass('at-inverse');

    // 根據目標模式添加對應的類別
    if (targetMode === "Standard") {
        colormodeIndicator.addClass('at-standard');
    } else {
        colormodeIndicator.addClass('at-inverse');
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
    
    // 手機版：動態調整Canvas容器高度（稍微延遲確保與背景色變化同步）
    if (isMobileMode && canvasContainer) {
        setTimeout(() => {
            const customControlsEnabled = hasText && !isAutoRotateMode;
            if (customControlsEnabled) {
                // Custom模式：給更多空間
                canvasContainer.style('max-height', '30vh');
            } else {
                // Auto模式：更緊湊
                canvasContainer.style('max-height', '18vh');
            }
        }, 10); // 10ms的小延遲，讓背景色變化先開始
    }
}

function updateSliders() {
    // 這個函數現在只負責更新全域的旋轉偏移變數
    rRotationOffset = rSlider.value();
    gRotationOffset = gSlider.value();
    bRotationOffset = bSlider.value();
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
        
        // 調整字體大小（僅桌面版）
        adjustInputFontSize();
        
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
