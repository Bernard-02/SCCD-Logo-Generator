// ====================================
// SCCD Logo Generator - 主程式
// ====================================
// 注意：全域變數已移至 js/variables.js
// 注意：工具函數已移至 js/utils.js (updateIconsForMode, updateRotateIcon, checkMobileMode, getCanvasSize等)
// 注意：色彩選擇器已移至 js/color-picker.js
// ===================================

// --- p5.js 預載入 ---
function preload() {
  font = loadFont("Inter-Medium.ttf");
  // 載入彩蛋圖片
  sccdBlackImg = loadImage('Easter Egg/sccd_black.png');
  sccdWhiteImg = loadImage('Easter Egg/sccd_white.png');
  // 載入 placeholder SVG wireframe (三層分離 - 黑色和白色版本)
  placeholderR = loadImage('Placeholder Logo/SCCD_R.svg');
  placeholderG = loadImage('Placeholder Logo/SCCD_G.svg');
  placeholderB = loadImage('Placeholder Logo/SCCD_B.svg');
  placeholderR_white = loadImage('Placeholder Logo/SCCD_R_white.svg');
  placeholderG_white = loadImage('Placeholder Logo/SCCD_G_white.svg');
  placeholderB_white = loadImage('Placeholder Logo/SCCD_B_white.svg');
}

// --- 計算去飽和顏色（將 Saturation 設為 0）---
function calculateDesaturatedColor(r, g, b) {
  // 將 RGB 轉換為 HSL
  r = r / 255;
  g = g / 255;
  b = b / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let l = (max + min) / 2;

  // Saturation = 0 時，RGB 都等於 Lightness 值
  let gray = Math.round(l * 255);
  return { r: gray, g: gray, b: gray };
}

// --- 初始化去飽和的 RGB 顏色 CSS 變數 ---
function initializeDesaturatedColors() {
  // R color: rgb(255, 68, 138)
  let rDesaturated = calculateDesaturatedColor(255, 68, 138);
  document.documentElement.style.setProperty('--r-color-desaturated', `rgb(${rDesaturated.r}, ${rDesaturated.g}, ${rDesaturated.b})`);

  // G color: rgb(0, 255, 128)
  let gDesaturated = calculateDesaturatedColor(0, 255, 128);
  document.documentElement.style.setProperty('--g-color-desaturated', `rgb(${gDesaturated.r}, ${gDesaturated.g}, ${gDesaturated.b})`);

  // B color: rgb(38, 188, 255)
  let bDesaturated = calculateDesaturatedColor(38, 188, 255);
  document.documentElement.style.setProperty('--b-color-desaturated', `rgb(${bDesaturated.r}, ${bDesaturated.g}, ${bDesaturated.b})`);
}

// --- p5.js 初始化設定 ---
function setup() {
  // 初始化去飽和顏色
  initializeDesaturatedColors();

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

  rotateButton = select(".custom-button-rotate");
  customButton = select(".custom-button-custom");
  colormodeButton = select("#colormode-button");
  colormodeBox = select("#colormode-box"); // 選取整個 colormode-box 容器

  // 這些按鈕本身是 button，裡面的 img 只是圖示
  randomButton = select("#random-button");
  resetButton = select("#reset-button");
  saveButton = select("#save-button");
  saveBox = select("#save-box"); // 選取整個 save-box 容器

  randomImg = select('#random-img');
  resetImg = select('#reset-img');
  saveImg = select('#save-img');
  rotateIcon = select('#rotate-icon');
  customIcon = select('#custom-icon');
  colormodeIcon = select('#colormode-icon');

  rSlider = select("#r-slider");
  gSlider = select("#g-slider");
  bSlider = select("#b-slider");

  // 初始化 slider 的當前值
  currentRSliderValue = 0;
  currentGSliderValue = 0;
  currentBSliderValue = 0;
  targetRSliderValue = 0;
  targetGSliderValue = 0;
  targetBSliderValue = 0;

  rAngleLabel = select("#r-angle-label");
  gAngleLabel = select("#g-angle-label");
  bAngleLabel = select("#b-angle-label");

  // --- 選取手機版元素 ---
  inputBoxMobile = select("#input-box-mobile");
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
  mobileRandomImg = select(".mobile-random-img");
  mobileResetImg = select(".mobile-reset-img");
  mobileRotateIcon = select("#mobile-rotate-icon");
  mobileCustomIcon = select("#mobile-custom-icon");

  // --- 選取下載提示框 ---
  downloadNotification = select("#download-notification");

  // --- 初始化色彩選擇器 ---
  colorPickerContainer = select("#colorpicker-container");
  // Color picker initialization moved inline to draw() function

  // --- 綁定所有 UI 事件 ---
  inputBox.input(handleInput);
  // 阻擋空白鍵輸入
  inputBox.elt.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.keyCode === 32) {
      e.preventDefault();
    }
  });

  if (inputBoxMobile) {
    inputBoxMobile.input(handleInput);
    // 阻擋手機版空白鍵輸入
    inputBoxMobile.elt.addEventListener('keydown', function(e) {
      if (e.key === ' ' || e.keyCode === 32) {
        e.preventDefault();
      }
    });
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

      // 更新桌面版按鈕icon
      updateRotateIcon();

      updateUI();
    }
  });

  // 參考 ref.js:124
  customButton.mousePressed(() => {
    if (letters.length > 0 && !isEasterEggActive) {
      // 如果已經在 Custom 模式下，點擊不做任何事
      if (!isAutoRotateMode) {
        return;
      }

      // 從 Rotate 模式切換到 Custom 模式
      isAutoRotateMode = false;
      autoRotate = false;

      // 先將所有角度正規化到 -180° 到 180° 範圍（選擇最短路徑）
      for (let i = 0; i < rotationAngles.length; i++) {
        if (rotationAngles[i] !== undefined) {
          // 正規化到 -180° 到 180°（最短路徑）
          rotationAngles[i] = normalizeAngle(rotationAngles[i]);
        }
      }

      // 重置桌面版按鈕icon
      updateRotateIcon();

      // 使用新的 ease 系統平滑回到 0°
      // 計算回到 0° 的最短路徑
      let rDiff = getShortestRotation(rRotationOffset, 0);
      let gDiff = getShortestRotation(gRotationOffset, 0);
      let bDiff = getShortestRotation(bRotationOffset, 0);

      // 設置目標值
      targetRRotationOffset = rRotationOffset + rDiff;
      targetGRotationOffset = gRotationOffset + gDiff;
      targetBRotationOffset = bRotationOffset + bDiff;

      // 設置 slider 的目標值為 0
      targetRSliderValue = 0;
      targetGSliderValue = 0;
      targetBSliderValue = 0;

      // 啟動新的 ease 動畫（Custom 模式的 ease）
      isEasingCustomRotation = true;
      isEasingSlider = true;
      // 同時標記需要 ease 回 0°（處理 rotationAngles）
      shouldResetToZero = true;

      updateUI();
    }
  });

  // 新增：Colormode 循環切換按鈕
  // Standard -> Inverse -> Wireframe -> Standard
  // 將事件綁定到整個 colormode-box，讓整個容器都可以點擊
  colormodeBox.mousePressed(() => {
    switch(targetMode) {
      case "Standard":
        targetMode = "Inverse";
        break;
      case "Inverse":
        targetMode = "Wireframe";
        break;
      case "Wireframe":
        targetMode = "Standard";
        break;
      default:
        targetMode = "Standard";
    }
    updateUI();
  });

  // 參考 ref.js:126
  randomButton.mousePressed(() => {
      if (letters.length > 0 && !isAutoRotateMode && !isEasterEggActive) {
        const letterCount = letters.length;

        // 只為有足夠字母數的 slider 生成隨機角度
        // R slider: 需要至少 1 個字母
        let newRAngle = (letterCount > 0) ? floor(random(-180, 180)) : 0;
        // G slider: 需要至少 2 個字母
        let newGAngle = (letterCount > 1) ? floor(random(-180, 180)) : 0;
        // B slider: 需要至少 3 個字母
        let newBAngle = (letterCount > 2) ? floor(random(-180, 180)) : 0;

        // 計算最短旋轉路徑
        let rDiff = getShortestRotation(rRotationOffset, newRAngle);
        let gDiff = getShortestRotation(gRotationOffset, newGAngle);
        let bDiff = getShortestRotation(bRotationOffset, newBAngle);

        // 設置目標值為當前值加上最短路徑差值
        targetRRotationOffset = rRotationOffset + rDiff;
        targetGRotationOffset = gRotationOffset + gDiff;
        targetBRotationOffset = bRotationOffset + bDiff;

        // 設置 slider 的目標值（正規化後）
        targetRSliderValue = normalizeAngle(targetRRotationOffset);
        targetGSliderValue = normalizeAngle(targetGRotationOffset);
        targetBSliderValue = normalizeAngle(targetBRotationOffset);

        // 啟動 ease 動畫
        isEasingCustomRotation = true;
        isEasingSlider = true;

        // 立即更新 UI 以顯示目標角度
        updateUI();
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

        // 設置 slider 的目標值為 0
        targetRSliderValue = 0;
        targetGSliderValue = 0;
        targetBSliderValue = 0;

        // 啟動 ease 動畫
        isEasingCustomRotation = true;
        isEasingSlider = true;

        // 立即更新 UI 以顯示目標角度
        updateUI();
      }
  });

  // --- 為滑桿綁定 input 事件，參考 ref.js:135-138 ---
  rSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });
  gSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });
  bSlider.input(() => { if (!isEasterEggActive && !isAutoRotateMode) { updateSliders(); updateUI(); } });

  // --- 為滑桿綁定 hover 事件 ---
  rSlider.elt.addEventListener('mouseenter', () => {
    if (rSlider.hasClass('enabled')) {
      hoveredSlider = 'r';
    }
  });
  rSlider.elt.addEventListener('mouseleave', () => { hoveredSlider = null; });

  gSlider.elt.addEventListener('mouseenter', () => {
    if (gSlider.hasClass('enabled')) {
      hoveredSlider = 'g';
    }
  });
  gSlider.elt.addEventListener('mouseleave', () => { hoveredSlider = null; });

  bSlider.elt.addEventListener('mouseenter', () => {
    if (bSlider.hasClass('enabled')) {
      hoveredSlider = 'b';
    }
  });
  bSlider.elt.addEventListener('mouseleave', () => { hoveredSlider = null; });

  // --- 為角度輸入框綁定事件 ---
  rAngleLabel.elt.addEventListener('input', function(e) {
    if (!isEasterEggActive && !isAutoRotateMode) {
      let normalizedAngle = convertAngleInput(e.target.value);
      rSlider.value(normalizedAngle);
      updateSliders();
      updateUI();
    }
  });

  gAngleLabel.elt.addEventListener('input', function(e) {
    if (!isEasterEggActive && !isAutoRotateMode) {
      let normalizedAngle = convertAngleInput(e.target.value);
      gSlider.value(normalizedAngle);
      updateSliders();
      updateUI();
    }
  });

  bAngleLabel.elt.addEventListener('input', function(e) {
    if (!isEasterEggActive && !isAutoRotateMode) {
      let normalizedAngle = convertAngleInput(e.target.value);
      bSlider.value(normalizedAngle);
      updateSliders();
      updateUI();
    }
  });

  // --- 綁定手機版角度輸入框事件 ---
  if (mobileRAngleLabel) {
    mobileRAngleLabel.elt.addEventListener('input', function(e) {
      if (!isEasterEggActive && !isAutoRotateMode) {
        let normalizedAngle = convertAngleInput(e.target.value);
        if (mobileRSlider) {
          mobileRSlider.value(normalizedAngle);
          rSlider.value(normalizedAngle);
        }
        updateSliders();
        updateUI();
      }
    });
  }

  if (mobileGAngleLabel) {
    mobileGAngleLabel.elt.addEventListener('input', function(e) {
      if (!isEasterEggActive && !isAutoRotateMode) {
        let normalizedAngle = convertAngleInput(e.target.value);
        if (mobileGSlider) {
          mobileGSlider.value(normalizedAngle);
          gSlider.value(normalizedAngle);
        }
        updateSliders();
        updateUI();
      }
    });
  }

  if (mobileBAngleLabel) {
    mobileBAngleLabel.elt.addEventListener('input', function(e) {
      if (!isEasterEggActive && !isAutoRotateMode) {
        let normalizedAngle = convertAngleInput(e.target.value);
        if (mobileBSlider) {
          mobileBSlider.value(normalizedAngle);
          bSlider.value(normalizedAngle);
        }
        updateSliders();
        updateUI();
      }
    });
  }

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
        updateRotateIcon();
        updateUI();
      }
    });
  }

  if (mobileCustomButton) {
    mobileCustomButton.mousePressed(() => {
      if (letters.length > 0 && !isEasterEggActive) {
        // 如果已經在 Custom 模式下，點擊不做任何事
        if (!isAutoRotateMode) {
          return;
        }

        // 從 Rotate 模式切換到 Custom 模式
        isAutoRotateMode = false;
        autoRotate = false;
        for (let i = 0; i < rotationAngles.length; i++) {
          if (rotationAngles[i] !== undefined) {
            rotationAngles[i] = normalizeAngle(rotationAngles[i]);
          }
        }
        updateRotateIcon();
        let rDiff = getShortestRotation(rRotationOffset, 0);
        let gDiff = getShortestRotation(gRotationOffset, 0);
        let bDiff = getShortestRotation(bRotationOffset, 0);
        targetRRotationOffset = rRotationOffset + rDiff;
        targetGRotationOffset = gRotationOffset + gDiff;
        targetBRotationOffset = bRotationOffset + bDiff;

        // 設置 slider 的目標值為 0
        targetRSliderValue = 0;
        targetGSliderValue = 0;
        targetBSliderValue = 0;

        isEasingCustomRotation = true;
        isEasingSlider = true;
        shouldResetToZero = true;
        updateUI();
      }
    });
  }

  if (mobileRandomButton) {
    mobileRandomButton.mousePressed(() => {
      if (letters.length > 0 && !isAutoRotateMode && !isEasterEggActive) {
        const letterCount = letters.length;

        // 只為有足夠字母數的 slider 生成隨機角度
        // R slider: 需要至少 1 個字母
        let newRAngle = (letterCount > 0) ? floor(random(-180, 180)) : 0;
        // G slider: 需要至少 2 個字母
        let newGAngle = (letterCount > 1) ? floor(random(-180, 180)) : 0;
        // B slider: 需要至少 3 個字母
        let newBAngle = (letterCount > 2) ? floor(random(-180, 180)) : 0;

        let rDiff = getShortestRotation(rRotationOffset, newRAngle);
        let gDiff = getShortestRotation(gRotationOffset, newGAngle);
        let bDiff = getShortestRotation(bRotationOffset, newBAngle);
        targetRRotationOffset = rRotationOffset + rDiff;
        targetGRotationOffset = gRotationOffset + gDiff;
        targetBRotationOffset = bRotationOffset + bDiff;

        // 設置 slider 的目標值（正規化後）
        targetRSliderValue = normalizeAngle(targetRRotationOffset);
        targetGSliderValue = normalizeAngle(targetGRotationOffset);
        targetBSliderValue = normalizeAngle(targetBRotationOffset);

        // 啟動 ease 動畫
        isEasingCustomRotation = true;
        isEasingSlider = true;

        // 立即更新 UI 以顯示目標角度
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

        // 設置 slider 的目標值為 0
        targetRSliderValue = 0;
        targetGSliderValue = 0;
        targetBSliderValue = 0;

        // 啟動 ease 動畫
        isEasingCustomRotation = true;
        isEasingSlider = true;

        // 立即更新 UI 以顯示目標角度
        updateUI();
      }
    });
  }

  // --- 為手機版滑桿綁定事件 ---
  if (mobileRSlider) {
    mobileRSlider.input(() => {
      if (!isEasterEggActive && !isAutoRotateMode) {
        isEasingCustomRotation = false;
        isEasingSlider = false;
        rRotationOffset = mobileRSlider.value();
        targetRRotationOffset = rRotationOffset;
        currentRSliderValue = rRotationOffset;
        targetRSliderValue = rRotationOffset;
        rSlider.value(rRotationOffset);
        updateUI();
      }
    });
  }

  if (mobileGSlider) {
    mobileGSlider.input(() => {
      if (!isEasterEggActive && !isAutoRotateMode) {
        isEasingCustomRotation = false;
        isEasingSlider = false;
        gRotationOffset = mobileGSlider.value();
        targetGRotationOffset = gRotationOffset;
        currentGSliderValue = gRotationOffset;
        targetGSliderValue = gRotationOffset;
        gSlider.value(gRotationOffset);
        updateUI();
      }
    });
  }

  if (mobileBSlider) {
    mobileBSlider.input(() => {
      if (!isEasterEggActive && !isAutoRotateMode) {
        isEasingCustomRotation = false;
        isEasingSlider = false;
        bRotationOffset = mobileBSlider.value();
        targetBRotationOffset = bRotationOffset;
        currentBSliderValue = bRotationOffset;
        targetBSliderValue = bRotationOffset;
        bSlider.value(bRotationOffset);
        updateUI();
      }
    });
  }

  // --- 綁定Save按鈕事件 ---
  // 將事件綁定到整個 save-box，讓整個容器都可以點擊
  saveBox.mousePressed(() => {
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

  // 讓輸入框自動獲得焦點，使游標一直顯示並閃爍
  setTimeout(() => {
    if (isMobileMode && inputBoxMobile) {
      inputBoxMobile.elt.focus();
    } else {
      inputBox.elt.focus();
    }
  }, 100); // 稍微延遲以確保頁面完全載入

  // 初始化頁面載入動畫
  pageLoadStartTime = millis();
  // CSS 已經將所有元素預設為 opacity: 0，這裡不需要重複設定
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

  // --- Slider Hover 效果 ---
  if (!isMobileMode) {
    // 選取所有 slider-container
    let sliderContainers = selectAll('.slider-container');

    // 檢查每個 slider 是否 disabled
    let rSliderEnabled = rSlider && rSlider.hasClass('enabled');
    let gSliderEnabled = gSlider && gSlider.hasClass('enabled');
    let bSliderEnabled = bSlider && bSlider.hasClass('enabled');

    // 移除所有 dimmed class
    sliderContainers.forEach(container => {
      container.removeClass('dimmed');
    });

    // 如果有 hover，添加 dimmed 效果
    if (hoveredSlider && sliderContainers.length >= 3) {
      if (hoveredSlider === 'r') {
        sliderContainers[1].addClass('dimmed'); // G slider
        sliderContainers[2].addClass('dimmed'); // B slider
      } else if (hoveredSlider === 'g') {
        sliderContainers[0].addClass('dimmed'); // R slider
        sliderContainers[2].addClass('dimmed'); // B slider
      } else if (hoveredSlider === 'b') {
        sliderContainers[0].addClass('dimmed'); // R slider
        sliderContainers[1].addClass('dimmed'); // G slider
      }
    }

    // 額外處理：如果有 slider 是 disabled 且沒有被 hover，也要添加 dimmed
    if (hoveredSlider) {
      if (!rSliderEnabled && hoveredSlider !== 'r') {
        sliderContainers[0].addClass('dimmed');
      }
      if (!gSliderEnabled && hoveredSlider !== 'g') {
        sliderContainers[1].addClass('dimmed');
      }
      if (!bSliderEnabled && hoveredSlider !== 'b') {
        sliderContainers[2].addClass('dimmed');
      }
    }
  }

  // --- 頁面載入動畫 ---
  let timeSinceLoad = millis() - pageLoadStartTime;

  // 1. 輸入框 fade in (0ms - 400ms)
  if (timeSinceLoad < fadeInDuration) {
    inputBoxOpacity = map(timeSinceLoad, 0, fadeInDuration, 0, 1);
  } else {
    inputBoxOpacity = 1;
  }

  // 2. Logo placeholder fade in (等待 typewriter 動畫完成後才開始)
  // typewriter 動畫從 0ms 開始，持續 1500ms
  // logo 在 typewriter 完成後才開始 fade in
  let logoStartTime = typewriterDuration; // 1500ms
  if (timeSinceLoad >= logoStartTime && timeSinceLoad < logoStartTime + fadeInDuration) {
    logoOpacity = map(timeSinceLoad, logoStartTime, logoStartTime + fadeInDuration, 0, 1);
  } else if (timeSinceLoad >= logoStartTime + fadeInDuration) {
    logoOpacity = 1;
  }

  // 3. Control panel fade in (Logo開始後 + 原本的delay時間)
  // 原本的delay是 fadeInDelay * 2 = 1000ms，但這是從頁面載入開始算
  // 現在改為：Logo開始時間(1500ms) + 原本兩個元素之間的間隔(fadeInDelay = 500ms)
  let panelStartTime = logoStartTime + fadeInDelay;
  if (timeSinceLoad >= panelStartTime && timeSinceLoad < panelStartTime + fadeInDuration) {
    controlPanelOpacity = map(timeSinceLoad, panelStartTime, panelStartTime + fadeInDuration, 0, 1);
  } else if (timeSinceLoad >= panelStartTime + fadeInDuration) {
    controlPanelOpacity = 1;
  }

  // 應用透明度到 DOM 元素
  if (inputBox) inputBox.style('opacity', inputBoxOpacity.toString());
  if (inputBoxMobile) inputBoxMobile.style('opacity', inputBoxOpacity.toString());
  // 桌面版：輸入框容器跟隨輸入框透明度
  let inputContainer = select('.input-container');
  if (inputContainer) inputContainer.style('opacity', inputBoxOpacity.toString());
  // Canvas 容器跟隨 logo 透明度
  if (canvasContainer) canvasContainer.style('opacity', logoOpacity.toString());
  // 控制面板
  let controlPanel = select('.control-panel');
  if (controlPanel) controlPanel.style('opacity', controlPanelOpacity.toString());
  // 手機版：操作區域跟隨控制面板透明度
  let mobileControlsWrapper = select('.mobile-controls-wrapper');
  if (mobileControlsWrapper) mobileControlsWrapper.style('opacity', controlPanelOpacity.toString());

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
    previousMode = mode; // 保存上一次的模式到全域變數

    // 所有模式切換都不使用 fade 效果，直接切換

    // 如果切換到 Wireframe 模式，重置色環以隨機選擇新顏色
    if (targetMode === "Wireframe" && previousMode !== "Wireframe") {
      if (colorPickerCanvas) {
        colorPickerCanvas.remove(); // 移除舊的 canvas
        colorPickerCanvas = null;
      }
    }

    mode = targetMode; // 立即切換模式

    updateUI(); // 立即更新UI，包括body class
  }

  // --- 色環繪製 (Wireframe 模式) ---
  if (mode === "Wireframe") {
    if (!colorPickerCanvas) {
      // 初始化色環
      let container = select('#colorpicker-container');
      if (container) {
        // 使用 clientWidth 和 clientHeight，取較小值確保是正方形
        let containerWidth = container.elt.clientWidth;
        let containerHeight = container.elt.clientHeight;
        let containerSize = Math.min(containerWidth, containerHeight);

        if (containerSize > 0) {
          colorPickerCanvas = createGraphics(containerSize, containerSize);
          colorPickerCanvas.parent('colorpicker-container');

          // 設置 canvas 樣式 - 不要設置 width/height 為 100%，讓它保持原始尺寸
          colorPickerCanvas.elt.style.display = 'block';
          colorPickerCanvas.elt.style.margin = 'auto';

          // 設置初始 indicator 位置（隨機色相）
          selectedHue = random(0, 360); // 隨機選擇 0-360 度
          colorPickerIndicatorX = 0.5;
          colorPickerIndicatorY = 0.25;

          // 設置初始顏色（隨機色相）
          colorMode(HSB, 360, 100, 100);
          wireframeColor = color(selectedHue, 80, 100);
          colorMode(RGB, 255);
          wireframeStrokeColor = getContrastColor(wireframeColor);

          // 更新背景顏色（使用 CSS 變數）
          updateBackgroundColor(wireframeColor);

          // 更新輸入框文字顏色
          updateInputTextColor();

          // 綁定鼠標事件
          colorPickerCanvas.elt.addEventListener('mousedown', handleColorPickerMouseDown);
          colorPickerCanvas.elt.addEventListener('mousemove', handleColorPickerMouseMove);
          colorPickerCanvas.elt.addEventListener('mouseup', handleColorPickerMouseUp);
          colorPickerCanvas.elt.addEventListener('mouseleave', handleColorPickerMouseUp); // 鼠標離開時也停止拖曳

          // 全局 mouseup 事件，確保在 canvas 外放開鼠標也能停止拖曳
          document.addEventListener('mouseup', handleColorPickerMouseUp);

          // 繪製色環
          drawColorWheel();
        }
      }
    } else {
      // 每一幀重繪（因為 indicator 可能移動）
      drawColorWheel();
    }
  } 
  
  // --- 淡入淡出邏輯 ---
  let currentLogoAlpha = logoAlpha;
  let currentEasterEggAlpha = easterEggAlpha;

  if (isFading) {
    let elapsedTime = millis() - fadeStartTime;
    // 根據是否為模式切換使用不同的 duration
    let duration = isModeTransition ? modeTransitionDuration : fadeDuration;
    let fadeProgress = constrain(elapsedTime / duration, 0, 1);

    if (isEasterEggActive) {
      currentLogoAlpha = lerp(255, 0, fadeProgress);
      currentEasterEggAlpha = lerp(0, 255, fadeProgress);
    } else {
      // 模式切換或一般 fade：從 0 fade in 到 255
      currentLogoAlpha = lerp(0, 255, fadeProgress);
      currentEasterEggAlpha = lerp(255, 0, fadeProgress);
    }

    if (fadeProgress === 1) {
      isFading = false;
      isModeTransition = false; // 重置模式切換標記
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
    // 使用 push/pop 並設置全域透明度，讓整個 logo 作為一個整體 fade
    push();

    // 設置全域 alpha，這樣所有繪製操作都會受影響
    drawingContext.globalAlpha = currentLogoAlpha / 255;

    // 繪製 logo（內部 alpha 設為 255，因為透明度已在外層控制）
    drawLogo(this, 255);

    pop(); // 恢復 globalAlpha
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
}

// --- 獲取當前活動的輸入框 ---
function getCurrentInputBox() {
    return isMobileMode ? inputBoxMobile : inputBox;
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
    isEasterEggActive = (normalizedInput === easterEggString || normalizedInput === "SCCD");
  
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
      // 重置桌面版按鈕icon
      updateRotateIcon();
    }
    rotationAngles = new Array(letters.length).fill(0);
    originalRotationAngles = [...rotationAngles]; // 儲存一份乾淨的初始角度
  
    // 更新字體大小
    adjustInputFontSize();
  
    // 圓圈顯示邏輯 - 已移除
    // 清理任何待處理的 timeout
    if (circleFillTimeout) {
      clearTimeout(circleFillTimeout);
      circleFillTimeout = null;
    }

    // 確保圓圈始終不顯示
    showCircle = false;
    circleShrinking = false;
    circleAlpha = 0;

    // 在函數結尾呼叫 UI 更新
    updateUI();
}

// --- 繪製 Placeholder SVG Wireframe ---
function drawPlaceholder(pg) {
  // 更新旋轉角度（使用 placeholderBaseSpeeds: [0.125, -0.125, 0.25] 對應 R, G, B，速度減緩75%）
  placeholderRotations[0] += placeholderBaseSpeeds[0]; // R: 0.125
  placeholderRotations[1] += placeholderBaseSpeeds[1]; // G: -0.125
  placeholderRotations[2] += placeholderBaseSpeeds[2]; // B: 0.25

  // Fade in/out 動畫（fade out: 0.3s，fade in: 0.5s）
  let fadeSpeed = (targetPlaceholderAlpha === 0) ? 0.3 : 0.15; // fade out 快，fade in 慢
  placeholderAlpha = lerp(placeholderAlpha, targetPlaceholderAlpha, fadeSpeed);

  // 根據模式決定透明度倍數和版本
  let opacityMultiplier = 0.25; // 預設 25%（Standard 模式，黑色版本）
  let isWhiteVersion = false;

  if (mode === 'Inverse') {
    // Inverse 模式：使用白色版本 + 50% 透明度
    isWhiteVersion = true;
    opacityMultiplier = 0.5;
  } else if (mode === 'Wireframe' && wireframeStrokeColor) {
    // Wireframe 模式：根據背景亮度決定使用黑色或白色版本及其透明度
    let r = red(wireframeStrokeColor);
    isWhiteVersion = r > 128;
    // 白色 50%，黑色 25%
    opacityMultiplier = isWhiteVersion ? 0.5 : 0.25;
  }

  // 結合頁面載入動畫的 opacity
  let finalAlpha = placeholderAlpha * logoOpacity * opacityMultiplier;

  pg.push();
  pg.translate(width / 2, height / 2);
  pg.imageMode(CENTER);

  // 繪製尺寸（放大 1.32 倍：350 * 1.2 * 1.1 = 462）
  let svgSize = 462;

  // 根據 isWhiteVersion 選擇正確的 SVG 檔案
  let rImg = isWhiteVersion ? placeholderR_white : placeholderR;
  let gImg = isWhiteVersion ? placeholderG_white : placeholderG;
  let bImg = isWhiteVersion ? placeholderB_white : placeholderB;

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

  // 判斷是否為wireframe模式
  let isWireframeMode = (mode === "Wireframe");
  // 根據當前模式設定混合模式（wireframe模式使用BLEND，不需要特殊混合）
  if (!isWireframeMode) {
    pg.blendMode(mode === "Inverse" ? SCREEN : MULTIPLY);
  }

  // --- 旋轉效果 ---
  // 開啟時立即開始，關閉時立即停止
  if (autoRotate) {
    rotationFactor = 1;
  } else {
    rotationFactor = 0;
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

  // Slider 的 ease 動畫（與 rotation ease 同步）
  if (isEasingSlider && !isAutoRotateMode && !isEasterEggActive) {
    let allSlidersReachedTarget = true;

    // 使用 lerp 平滑過渡到目標 slider 值
    currentRSliderValue = lerp(currentRSliderValue, targetRSliderValue, customEaseSpeed);
    currentGSliderValue = lerp(currentGSliderValue, targetGSliderValue, customEaseSpeed);
    currentBSliderValue = lerp(currentBSliderValue, targetBSliderValue, customEaseSpeed);

    // 更新 slider 顯示值
    if (rSlider) rSlider.value(currentRSliderValue);
    if (gSlider) gSlider.value(currentGSliderValue);
    if (bSlider) bSlider.value(currentBSliderValue);

    // 同步手機版 slider
    let mobileRSlider = select('.mobile-r-slider');
    let mobileGSlider = select('.mobile-g-slider');
    let mobileBSlider = select('.mobile-b-slider');
    if (mobileRSlider) mobileRSlider.value(currentRSliderValue);
    if (mobileGSlider) mobileGSlider.value(currentGSliderValue);
    if (mobileBSlider) mobileBSlider.value(currentBSliderValue);

    // 檢查是否已經很接近目標值
    if (abs(currentRSliderValue - targetRSliderValue) > 0.1) allSlidersReachedTarget = false;
    if (abs(currentGSliderValue - targetGSliderValue) > 0.1) allSlidersReachedTarget = false;
    if (abs(currentBSliderValue - targetBSliderValue) > 0.1) allSlidersReachedTarget = false;

    // 如果已經接近目標，完全設置為目標值並停止 ease
    if (allSlidersReachedTarget) {
      currentRSliderValue = targetRSliderValue;
      currentGSliderValue = targetGSliderValue;
      currentBSliderValue = targetBSliderValue;

      if (rSlider) rSlider.value(currentRSliderValue);
      if (gSlider) gSlider.value(currentGSliderValue);
      if (bSlider) bSlider.value(currentBSliderValue);
      if (mobileRSlider) mobileRSlider.value(currentRSliderValue);
      if (mobileGSlider) mobileGSlider.value(currentGSliderValue);
      if (mobileBSlider) mobileBSlider.value(currentBSliderValue);

      isEasingSlider = false;
    }
  }

  // Hover 時需要分兩批繪製：先繪製非 hover 的（半透明），再繪製 hover 的（置頂）
  let drawingPasses = hoveredSlider ? 2 : 1;

  for (let pass = 0; pass < drawingPasses; pass++) {
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

      // Hover 邏輯
      let isHoveredColor = false;
      if (hoveredSlider) {
        if (hoveredSlider === 'r' && colorIndex === 0) isHoveredColor = true;
        if (hoveredSlider === 'g' && colorIndex === 1) isHoveredColor = true;
        if (hoveredSlider === 'b' && colorIndex === 2) isHoveredColor = true;
      }

      // 第一次繪製時跳過 hover 的顏色，第二次只繪製 hover 的顏色
      if (drawingPasses === 2) {
        if (pass === 0 && isHoveredColor) continue; // 第一批：跳過 hover 的
        if (pass === 1 && !isHoveredColor) continue; // 第二批：只繪製 hover 的
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

    // 根據模式設定文字樣式並繪製
    // Hover 時，非 hover 的字母 25% 不透明度
    let letterAlpha = (hoveredSlider && !isHoveredColor) ? 64 : 255;

    if (isWireframeMode) {
      // Wireframe模式：使用色彩選擇器選擇的顏色

      // 第一次：繪製描邊（根據填充顏色亮度自動選擇黑色或白色）
      pg.noFill();
      if (wireframeStrokeColor) {
        pg.stroke(red(wireframeStrokeColor), green(wireframeStrokeColor), blue(wireframeStrokeColor), letterAlpha);
      } else {
        pg.stroke(0, 0, 0, letterAlpha); // 預設黑色
      }
      pg.strokeWeight(5);
      pg.text(letter, 0, -offsetY);

      // 第二次：繪製填充顏色（來自色彩選擇器）
      if (wireframeColor) {
        pg.fill(red(wireframeColor), green(wireframeColor), blue(wireframeColor), letterAlpha);
      } else {
        pg.fill(255, 255, 255, letterAlpha); // 預設白色
      }
      pg.noStroke();
      pg.text(letter, 0, -offsetY);
    } else {
      // 一般模式：使用RGB顏色，無stroke
      // 結合 alphaMultiplier（頁面載入動畫）和 letterAlpha（hover 效果）
      let [r, g, b] = colors[colorIndex];
      let finalAlpha = alphaMultiplier * (letterAlpha / 255);
      pg.fill(r, g, b, finalAlpha);
      pg.noStroke();
      pg.text(letter, 0, -offsetY);
    }

    pg.pop();
    }
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

    // 計算字元數（移除空格和換行）
    let charCount = letters.length;

    // 根據字元數決定字體大小（彩蛋模式和正常模式使用相同邏輯）
    if (charCount === 0) {
        targetFontSize = largeFontSize; // 空白時使用 120px（配合 placeholder）
    } else if (charCount <= 3) {
        targetFontSize = extraLargeFontSize; // 1-3 字：180px
    } else if (charCount <= 15) {
        targetFontSize = largeFontSize; // 4-15 字：120px
    } else if (charCount <= 30) {
        targetFontSize = mediumFontSize; // 16-30 字：90px
    } else {
        targetFontSize = smallFontSize; // 31-40 字：60px
    }

    // 更新字體大小
    inputBox.style("font-size", targetFontSize);

    // 所有字體大小都使用統一的 line-height
    inputBox.style("line-height", "1.1");

    // 等待 CSS transition 完成後再測量（font-size transition 是 0.2s = 200ms）
    // 加上一點緩衝時間確保渲染完成
    setTimeout(() => {
        adjustTextareaHeight(targetFontSize);
    }, 220);
}

// --- 精確的垂直置中函數（使用 Canvas 測量實際文字渲染高度）---
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

    // 使用 Canvas 來精確測量文字高度（不受 textarea 游標影響）
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    // 設定與 textarea 相同的字體樣式
    let fontSizeNum = parseFloat(fontSize);

    // 讀取 line-height（可能是純數字或帶單位的字串）
    let lineHeightValue = window.getComputedStyle(inputBox.elt).lineHeight;
    let lineHeight;
    if (lineHeightValue === 'normal') {
        lineHeight = 1.1; // 預設值
    } else if (lineHeightValue.includes('px')) {
        // 如果是 px 單位，轉換為相對於 fontSize 的倍數
        lineHeight = parseFloat(lineHeightValue) / fontSizeNum;
    } else {
        // 純數字
        lineHeight = parseFloat(lineHeightValue);
    }

    ctx.font = `${fontSize} ${inputBox.style('font-family')}`;

    // 取得 textarea 的實際寬度（textarea 沒有設定 padding，直接使用完整寬度）
    let textareaWidth = inputBox.elt.clientWidth;

    // 將文字按換行符分割
    let lines = content.split('\n');
    let totalLines = 0;

    // 對每一行進行寬度測量，計算實際需要多少行
    for (let line of lines) {
        if (line.length === 0) {
            // 空行也算一行
            totalLines += 1;
        } else {
            // 測量這一行的文字寬度
            let lineWidth = ctx.measureText(line).width;

            // 如果超過容器寬度，需要計算會自動換成幾行
            if (lineWidth > textareaWidth) {
                // 逐字測量，找出每行能放多少字
                let currentLineWidth = 0;
                let currentLineCount = 1;

                for (let i = 0; i < line.length; i++) {
                    let charWidth = ctx.measureText(line[i]).width;
                    currentLineWidth += charWidth;

                    if (currentLineWidth > textareaWidth) {
                        // 超出寬度，換行
                        currentLineCount++;
                        currentLineWidth = charWidth;
                    }
                }

                totalLines += currentLineCount;
            } else {
                // 不需要自動換行
                totalLines += 1;
            }
        }
    }

    // 計算總高度（行數 * 行高）
    let contentHeight = totalLines * (fontSizeNum * lineHeight);
    let containerHeight = 400;

    // 計算 padding-top（垂直置中）
    let paddingTop = Math.max(0, (containerHeight - contentHeight) / 2);

    // 設定 padding
    inputBox.style('padding-top', paddingTop + 'px');
}


// --- 新增：角度正規化函數（將角度正規化到 -180° 到 180° 之間）---
function normalizeAngle(angle) {
    angle = angle % 360;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    return angle;
}

// --- 新增：處理角度輸入框的數值換算 ---
function convertAngleInput(value) {
    // 移除非數字字符（保留負號和數字）
    let numericValue = value.replace(/[^\d-]/g, '');

    // 如果是空字符串，返回 0
    if (numericValue === '' || numericValue === '-') {
        return 0;
    }

    // 轉換為數字
    let angle = parseInt(numericValue, 10);

    // 如果不是有效數字，返回 0
    if (isNaN(angle)) {
        return 0;
    }

    // 執行模 360 運算並正規化到 -180 到 180 之間
    return normalizeAngle(angle);
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

// --- 新增：下載按鈕 icon 動畫 ---
function animateSaveButton(button, iconElement) {
    if (!button || !iconElement) return;

    const isInverseMode = mode === "Inverse";
    const suffix = isInverseMode ? "_Inverse" : "";
    const rotateDuration = 1500; // Generate icon 旋轉時長：1.5秒
    const fadeInOutDuration = 200; // 淡入淡出時間：200ms
    const scaleUpDuration = 100; // Generate icon 放大時間：100ms（快速出現）

    // 保存原始 icon
    const originalIconSrc = iconElement.attribute('src');
    const generateIconSrc = `Panel Icon/Generate${suffix}.svg`;

    // 1. 縮小原 icon 並淡出
    iconElement.style('transition', `transform ${fadeInOutDuration}ms ease, opacity ${fadeInOutDuration}ms ease`);
    iconElement.style('transform', 'scale(0)');
    iconElement.style('opacity', '0');

    // 2. fadeInOutDuration 後切換到 Generate icon，並快速放大同時旋轉
    setTimeout(() => {
        iconElement.attribute('src', generateIconSrc);
        // 設定 transition：scale 和 opacity 快速出現（100ms），rotation 使用 linear（1500ms）
        iconElement.style('transition', `transform ${scaleUpDuration}ms ease, opacity ${scaleUpDuration}ms ease`);
        iconElement.style('transform', 'scale(1) rotate(0deg)');
        iconElement.style('opacity', '1');

        // 放大完成後立即開始旋轉
        setTimeout(() => {
            iconElement.style('transition', `transform ${rotateDuration}ms linear`);
            iconElement.style('transform', 'scale(1) rotate(360deg)');
        }, scaleUpDuration);
    }, fadeInOutDuration);

    // 3. 旋轉完成後立即縮小並消失（無停留）
    setTimeout(() => {
        iconElement.style('transition', `transform ${fadeInOutDuration}ms ease, opacity ${fadeInOutDuration}ms ease`);
        iconElement.style('transform', 'scale(0) rotate(360deg)');
        iconElement.style('opacity', '0');
    }, fadeInOutDuration + scaleUpDuration + rotateDuration);

    // 4. Generate icon 縮小完成後，重置旋轉為 0 度並切換回原 icon
    setTimeout(() => {
        // 先移除所有 transition，避免旋轉殘留
        iconElement.style('transition', 'none');
        iconElement.style('transform', 'scale(0)');
        iconElement.style('opacity', '0');

        setTimeout(() => {
            // 切換回原 icon
            iconElement.attribute('src', originalIconSrc);

            // 短暫延遲後再設定 transition 並放大
            setTimeout(() => {
                iconElement.style('transition', `transform ${fadeInOutDuration}ms ease, opacity ${fadeInOutDuration}ms ease`);
                iconElement.style('transform', 'scale(1)');
                iconElement.style('opacity', '1');

                // 移除 transition 樣式，避免影響後續
                setTimeout(() => {
                    iconElement.style('transition', '');
                    iconElement.style('transform', '');
                    iconElement.style('opacity', '');
                }, fadeInOutDuration);
            }, 10);
        }, 10);
    }, fadeInOutDuration + scaleUpDuration + rotateDuration + fadeInOutDuration);

    // 總時長：淡出(200) + 快速放大(100) + 旋轉(1500) + 淡出(200) + 重置(10) + 淡入(200) = 2210ms
    return fadeInOutDuration * 3 + scaleUpDuration + rotateDuration + 10;
}

// --- 完全參照 ref.js:278-346 重寫 updateUI ---
function updateUI() {
    const hasText = letters.length > 0;
    const isStandardTarget = (targetMode === "Standard");
    const isInverseTarget = (targetMode === "Inverse");
    const isInverseMode = mode === "Inverse";
    const activeColor = isInverseMode ? "white" : "black";
    const activeBorder = isInverseMode ? "2px solid white" : "2px solid black";
    const body = select('body');

    // 更新 disabledColor 根據當前模式
    disabledColor = getDisabledColor();

    // 更新 Body Class
    const isWireframeMode = (mode === "Wireframe");

    if (isWireframeMode) {
        body.class('wireframe-mode');
        // Wireframe 模式下，背景顏色使用 CSS 變數 --wireframe-bg
    } else {
        body.class(isInverseMode ? 'inverse-mode' : 'standard-mode');
        // Standard/Inverse 模式下，CSS 會自動根據 class 切換背景色
    }

    // 更新所有圖標根據當前模式
    updateIconsForMode();

    // 更新輸入框顏色
    // Wireframe 模式下使用對比色，Standard/Inverse 模式使用固定顏色
    let textColor = activeColor;
    if (isWireframeMode && wireframeStrokeColor) {
        // 使用與 logo 邊框相同的對比色
        let r = red(wireframeStrokeColor);
        let g = green(wireframeStrokeColor);
        let b = blue(wireframeStrokeColor);
        textColor = `rgb(${r}, ${g}, ${b})`;
    }

    inputBox.style("color", textColor);
    if (inputBoxMobile) {
        inputBoxMobile.style("color", textColor);
    }

    if (isEasterEggActive) {
        // --- 彩蛋模式 UI ---
        // 隱藏整個 rotation-box
        select('#rotation-box').style('display', 'none');

        colormodeButton.style('display', 'flex');
        saveButton.style('display', 'flex');

        // Colormode 按鈕在彩蛋模式下仍然可用
        colormodeButton.style('cursor', 'pointer');

        // 修復：設定正確的圖片元素
        saveButton.style('cursor', 'pointer');
        saveButton.elt.disabled = false;

    } else {
        // --- 正常模式 UI ---
        // 顯示整個 rotation-box
        select('#rotation-box').style('display', 'flex');

        // 更新 rotation-box 和 save-box 的 disabled 狀態
        let rotationBox = select('#rotation-box');
        let saveBox = select('#save-box');
        if (hasText) {
            rotationBox.removeClass('disabled');
            saveBox.removeClass('disabled');
        } else {
            rotationBox.addClass('disabled');
            saveBox.addClass('disabled');
        }

        rotateButton.style('display', 'flex');
        customButton.style('display', 'flex');

        // 更新 Auto/Custom 按鈕（使用 class 控制邊框）
        rotateButton.elt.disabled = !hasText;
        rotateButton.style("color", !hasText ? disabledColor : isAutoRotateMode ? activeColor : disabledColor);
        rotateButton.style("cursor", !hasText ? 'not-allowed' : "pointer");

        // 更新 Rotate 按鈕 icon（使用統一函數）
        updateRotateIcon();

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
            // 為 custom-area-wrapper 添加 custom-mode class，顯示邊框和 padding
            let customAreaWrapper = select('#custom-area-wrapper');
            if (customAreaWrapper) customAreaWrapper.addClass('custom-mode');
        } else {
            customButton.removeClass('active');
            // 移除 custom-mode class
            let customAreaWrapper = select('#custom-area-wrapper');
            if (customAreaWrapper) customAreaWrapper.removeClass('custom-mode');
        }

        // 更新 Colormode 按鈕（循環切換，總是可用）
        colormodeButton.style('display', 'flex');
        colormodeButton.style('cursor', 'pointer');

        // 更新 Custom 控制面板
        const customControlsEnabled = hasText && !isAutoRotateMode;
        const customControlsContainer = select('#custom-angle-controls');

        if (customControlsEnabled) {
            // Custom 展開時：顯示 Custom 按鈕、slider 和 icon 按鈕
            customButton.style('display', 'flex');
            customControlsContainer.style('display', 'flex');
            randomButton.style('display', 'flex');
            resetButton.style('display', 'flex');
        } else {
            // Custom 未展開時：顯示 Custom 按鈕，隱藏 slider 和 icon 按鈕
            customButton.style('display', 'flex');
            customControlsContainer.style('display', 'none');
            randomButton.style('display', 'none');
            resetButton.style('display', 'none');
        }

        // 更新 Random/Reset 圖示
        randomButton.elt.disabled = !customControlsEnabled;
        resetButton.elt.disabled = !customControlsEnabled;
        randomButton.style('cursor', customControlsEnabled ? 'pointer' : 'not-allowed');
        resetButton.style('cursor', customControlsEnabled ? 'pointer' : 'not-allowed');
        
        // 更新滑桿（根據字母數量決定可用的 slider）
        const sliders = [rSlider, gSlider, bSlider];
        const labels = [rAngleLabel, gAngleLabel, bAngleLabel];
        const letterCount = letters.length;

        sliders.forEach((slider, i) => {
            // 決定這個 slider 是否應該啟用
            // i=0 (R): 需要至少 1 個字母
            // i=1 (G): 需要至少 2 個字母
            // i=2 (B): 需要至少 3 個字母
            let sliderEnabled = customControlsEnabled && letterCount > i;

            slider.elt.disabled = !sliderEnabled;
            if (sliderEnabled) {
                slider.addClass('enabled');
                labels[i].addClass('enabled');

                // 決定 slider 和 label 的顏色
                if (mode === "Wireframe") {
                    // Wireframe 模式：不需要手動設定顏色，CSS 會自動使用 --wireframe-border
                    // 移除 inline style，讓 CSS 規則生效
                    slider.elt.style.removeProperty("--track-color");
                    slider.elt.style.removeProperty("--thumb-color");
                    labels[i].elt.style.removeProperty("color");
                } else {
                    // Standard/Inverse 模式：使用 RGB 三種顏色
                    let sliderColor = `rgb(${colors[i].join(',')})`;
                    slider.elt.style.setProperty("--track-color", sliderColor);
                    slider.elt.style.setProperty("--thumb-color", sliderColor);
                    labels[i].style("color", sliderColor);
                }
            } else {
                slider.removeClass('enabled');
                labels[i].removeClass('enabled');

                if (mode === "Wireframe") {
                    // Wireframe 模式：移除 inline style，讓 CSS 規則生效
                    slider.elt.style.removeProperty("--track-color");
                    slider.elt.style.removeProperty("--thumb-color");
                    labels[i].elt.style.removeProperty("color");
                } else {
                    // 其他模式：設為預設 disabled 顏色
                    labels[i].style("color", disabledColor);
                }
            }
        });
        
        // 更新滑桿數值標籤，並加上正號
        // 如果正在 ease，顯示目標角度（正規化後的）；否則顯示當前角度
        let rVal = Math.round(isEasingCustomRotation ? normalizeAngle(targetRRotationOffset) : rRotationOffset);
        let gVal = Math.round(isEasingCustomRotation ? normalizeAngle(targetGRotationOffset) : gRotationOffset);
        let bVal = Math.round(isEasingCustomRotation ? normalizeAngle(targetBRotationOffset) : bRotationOffset);
        rAngleLabel.value((rVal > 0 ? "+" : "") + rVal);
        gAngleLabel.value((gVal > 0 ? "+" : "") + gVal);
        bAngleLabel.value((bVal > 0 ? "+" : "") + bVal);

        // 更新 Save 按鈕
        saveButton.style('display', 'flex');
        saveButton.elt.disabled = !hasText;
        saveButton.style('cursor', hasText ? 'pointer' : 'not-allowed');
    }
    
    // 更新手機版 Save 按鈕
    if (saveButtonMobile && saveImgMobile) {
        saveButtonMobile.elt.disabled = !hasText;
        saveButtonMobile.style('cursor', hasText ? 'pointer' : 'not-allowed');
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

    // 更新手機版 control-box 的 disabled 狀態
    let mobileRotationBox = select('.mobile-rotation-box');
    let mobileSaveContainer = select('.mobile-save-container');
    if (mobileRotationBox && mobileSaveContainer) {
        if (hasText) {
            mobileRotationBox.removeClass('disabled');
            mobileSaveContainer.removeClass('disabled');
        } else {
            mobileRotationBox.addClass('disabled');
            mobileSaveContainer.addClass('disabled');
        }
    }

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

        // 更新手機版 Rotate 按鈕 icon（使用統一函數）
        updateRotateIcon();

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
            // 為手機版 rotation-box 添加 custom-mode class，顯示整體邊框
            if (mobileRotationBox) mobileRotationBox.addClass('custom-mode');
        } else {
            mobileCustomButton.removeClass('active');
            // 移除 custom-mode class
            if (mobileRotationBox) mobileRotationBox.removeClass('custom-mode');
        }
    }

    // 更新手機版 Custom 控制面板
    const customControlsEnabled = hasText && !isAutoRotateMode;

    // 手機版：當 Custom 展開時，隱藏 Custom 按鈕
    if (mobileCustomButton) {
        if (customControlsEnabled) {
            mobileCustomButton.style('display', 'none');
        } else {
            mobileCustomButton.style('display', 'flex');
        }
    }

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
        const letterCount = letters.length;

        mobileSliders.forEach((slider, i) => {
            // 決定這個 slider 是否應該啟用（與桌面版相同邏輯）
            // i=0 (R): 需要至少 1 個字母
            // i=1 (G): 需要至少 2 個字母
            // i=2 (B): 需要至少 3 個字母
            let sliderEnabled = customControlsEnabled && letterCount > i;

            slider.elt.disabled = !sliderEnabled;
            if (sliderEnabled) {
                slider.addClass('enabled');
                mobileLabels[i].addClass('enabled');

                // 決定 slider 和 label 的顏色
                let sliderColor, labelColor;
                if (mode === "Wireframe") {
                    // Wireframe 模式：使用對比色（黑色或白色）
                    if (wireframeStrokeColor) {
                        let r = red(wireframeStrokeColor);
                        let g = green(wireframeStrokeColor);
                        let b = blue(wireframeStrokeColor);
                        sliderColor = `rgb(${r}, ${g}, ${b})`;
                        labelColor = sliderColor;
                    } else {
                        sliderColor = 'rgb(0, 0, 0)'; // 預設黑色
                        labelColor = sliderColor;
                    }
                } else {
                    // Standard/Inverse 模式：使用 RGB 三種顏色
                    sliderColor = `rgb(${colors[i].join(',')})`;
                    labelColor = sliderColor;
                }

                // 動態設定滑桿顏色
                slider.elt.style.setProperty("--track-color", sliderColor);
                slider.elt.style.setProperty("--thumb-color", sliderColor);
                mobileLabels[i].style("color", labelColor);
            } else {
                slider.removeClass('enabled');
                mobileLabels[i].removeClass('enabled');
                mobileLabels[i].style("color", disabledColor);
            }
        });

        // 同步滑桿數值
        // 如果正在 ease，顯示目標角度（正規化後的）；否則顯示當前角度
        let rVal = Math.round(isEasingCustomRotation ? normalizeAngle(targetRRotationOffset) : rRotationOffset);
        let gVal = Math.round(isEasingCustomRotation ? normalizeAngle(targetGRotationOffset) : gRotationOffset);
        let bVal = Math.round(isEasingCustomRotation ? normalizeAngle(targetBRotationOffset) : bRotationOffset);
        mobileRAngleLabel.value((rVal > 0 ? "+" : "") + rVal);
        mobileGAngleLabel.value((gVal > 0 ? "+" : "") + gVal);
        mobileBAngleLabel.value((bVal > 0 ? "+" : "") + bVal);
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
    isEasingSlider = false;

    // 同時更新當前值和目標值
    rRotationOffset = rSlider.value();
    gRotationOffset = gSlider.value();
    bRotationOffset = bSlider.value();

    targetRRotationOffset = rRotationOffset;
    targetGRotationOffset = gRotationOffset;
    targetBRotationOffset = bRotationOffset;

    // 同步 slider 的當前值和目標值
    currentRSliderValue = rSlider.value();
    currentGSliderValue = gSlider.value();
    currentBSliderValue = bSlider.value();
    targetRSliderValue = currentRSliderValue;
    targetGSliderValue = currentGSliderValue;
    targetBSliderValue = currentBSliderValue;
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
  // 防止重複點擊
  if (isDownloading) return;
  isDownloading = true;

  // 桌面版：播放 Save 按鈕動畫
  const animationDuration = animateSaveButton(saveButton, saveImg);

  // 手機版：播放 Save 按鈕動畫
  if (saveButtonMobile && saveImgMobile) {
    animateSaveButton(saveButtonMobile, saveImgMobile);
  }

  // 動畫結束後開始下載
  setTimeout(() => {
    performDownload();
    // 下載完成後重置狀態
    isDownloading = false;
  }, animationDuration || 2310);
}

// --- 實際執行下載的函數 ---
function performDownload() {
  const saveSize = 1080;

  // 生成檔案名稱
  let fileName = generateFileName();

  if (isEasterEggActive) {
    // 彩蛋模式：保存靜態圖片
    let imgToSave = (mode === 'Inverse') ? sccdWhiteImg : sccdBlackImg;
    if (imgToSave) {
      let pg = createGraphics(imgToSave.width, imgToSave.height);
      pg.image(imgToSave, 0, 0);
      pg.save(fileName);
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

    // 圓圈功能已移除，不再在儲存時繪製圓圈
    // if (showCircle) {
    //   drawCentralCircle(pg, 255); // 使用預設直徑 250
    // }

    // 繪製logo（使用原本的參數）
    drawLogo(pg, 255);

    pg.pop();

    // 恢復原本的 width 和 height
    width = tempWidth;
    height = tempHeight;

    // 保存文件
    pg.save(fileName);
  }
}

// --- 生成檔案名稱的函數 ---
function generateFileName() {
  let textPart = '';

  if (isEasterEggActive) {
    // 彩蛋模式：使用 "SCCD"
    textPart = 'SCCD';
  } else {
    // 正常模式：使用輸入框的文字（移除空格和換行，轉為大寫）
    // 獲取當前活動的輸入框
    let currentInputBox = isMobileMode ? inputBoxMobile : inputBox;
    if (currentInputBox) {
      let inputText = currentInputBox.value();
      // 移除所有空格和換行符，轉為大寫
      textPart = inputText.replace(/[\s\n]/g, '').toUpperCase();
    }

    // 如果沒有文字，使用預設名稱
    if (!textPart) {
      textPart = 'LOGO';
    }
  }

  // 模式部分：Standard 或 Inverse
  let modePart = mode; // "Standard" 或 "Inverse"

  // 組合檔案名稱：文字 - 模式.png
  return `${textPart} - ${modePart}.png`;
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

      // 更新按鈕icon為 Pause
      updateRotateIcon();

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

// ========================================
// 色彩選擇器相關函數
// ========================================

// 繪製色環（甜甜圈形狀）
function drawColorWheel() {
  if (!colorPickerCanvas) {
    return;
  }

  let w = colorPickerCanvas.width;
  let h = colorPickerCanvas.height;
  let centerX = w / 2;
  let centerY = h / 2;

  // 色環半徑基於 canvas 尺寸
  let outerRadius = Math.min(w, h) / 2 - 2; // 留 2px 給邊框
  let innerRadius = outerRadius * 0.55; // 內圈是外圈的 60%

  // 清空並設置 30% 透明白色背景
  colorPickerCanvas.clear(); // 先清空
  colorPickerCanvas.noFill(); // 30% 透明白色 (255 * 0.3 ≈ 77)
  colorPickerCanvas.noStroke();
  colorPickerCanvas.rect(0, 0, w, h);

  // 繪製色環 - 使用 HSB 顏色模式
  colorPickerCanvas.colorMode(HSB, 360, 100, 100);
  colorPickerCanvas.noStroke();

  // 繪製色環 - 使用弧形疊加
  colorPickerCanvas.push();
  colorPickerCanvas.translate(centerX, centerY);

  // 設定線條粗細（色環的厚度）
  let ringThickness = outerRadius - innerRadius;
  colorPickerCanvas.strokeWeight(ringThickness);
  colorPickerCanvas.strokeCap(SQUARE); // 使用方形端點，避免間隙

  // 計算弧形的半徑（在內外圈中間）
  let arcRadius = (outerRadius + innerRadius) / 2;

  // 繪製 360 個弧形線段，每段稍微重疊以避免間隙
  for (let angle = 0; angle < 360; angle += 1) {
    // 使用 HSB 顏色模式設置描邊顏色
    colorPickerCanvas.stroke(angle, 80, 100); // H=angle, S=80, B=100

    // 繪製一小段弧形（從頂部開始，順時針）
    // 稍微擴大角度範圍以確保完全覆蓋，避免間隙
    let startAngle = radians(angle - 90 - 0.5);
    let endAngle = radians(angle + 1 - 90 + 0.5);

    colorPickerCanvas.noFill();
    colorPickerCanvas.arc(0, 0, arcRadius * 2, arcRadius * 2, startAngle, endAngle);
  }

  colorPickerCanvas.pop();

  // 切換回 RGB 模式繪製其他元素
  colorPickerCanvas.colorMode(RGB, 255);

  // 繪製中心 30% 透明白色圓形（清除中心區域）
  colorPickerCanvas.noFill(); // 30% 透明白色 (255 * 0.3 ≈ 77)
  colorPickerCanvas.noStroke();
  colorPickerCanvas.circle(centerX, centerY, innerRadius * 2);

  // 繪製邊框（根據背景色自動選擇黑色或白色）
  colorPickerCanvas.noFill();
  // 使用對比色（與 wireframeStrokeColor 相同）
  if (wireframeStrokeColor) {
    let r = red(wireframeStrokeColor);
    let g = green(wireframeStrokeColor);
    let b = blue(wireframeStrokeColor);
    colorPickerCanvas.stroke(r, g, b);
  } else {
    colorPickerCanvas.stroke(0); // 預設黑色
  }
  colorPickerCanvas.strokeWeight(1.8);
  colorPickerCanvas.circle(centerX, centerY, outerRadius * 2); // 外圈
  colorPickerCanvas.circle(centerX, centerY, innerRadius * 2); // 內圈

  // 繪製 indicator
  drawColorPickerIndicator(centerX, centerY, outerRadius, innerRadius);
}

// 繪製 indicator（線段，黑色）
function drawColorPickerIndicator(centerX, centerY, outerRadius, innerRadius) {
  if (!colorPickerCanvas) return;

  // 計算角度
  let angle = map(selectedHue, 0, 360, 0, TWO_PI) - HALF_PI; // -HALF_PI 從頂部開始

  // 計算線段的起點和終點（從內圈到外圈）
  let x1 = centerX + cos(angle) * innerRadius;
  let y1 = centerY + sin(angle) * innerRadius;
  let x2 = centerX + cos(angle) * outerRadius;
  let y2 = centerY + sin(angle) * outerRadius;

  // 繪製線段（根據背景色自動選擇黑色或白色）
  // 使用對比色（與 wireframeStrokeColor 相同）
  if (wireframeStrokeColor) {
    let r = red(wireframeStrokeColor);
    let g = green(wireframeStrokeColor);
    let b = blue(wireframeStrokeColor);
    colorPickerCanvas.stroke(r, g, b);
  } else {
    colorPickerCanvas.stroke(0); // 預設黑色
  }
  colorPickerCanvas.strokeWeight(1.8);
  colorPickerCanvas.strokeCap(SQUARE); // 使用方形端點
  colorPickerCanvas.line(x1, y1, x2, y2);
}

// 處理鼠標事件
function handleColorPickerMouseDown(e) {
  if (!colorPickerCanvas) return;
  colorPickerDragging = true;
  updateColorFromMouse(e);
}

function handleColorPickerMouseMove(e) {
  if (!colorPickerCanvas || !colorPickerDragging) return;
  updateColorFromMouse(e);
}

function handleColorPickerMouseUp() {
  colorPickerDragging = false;

  // 恢復 transition（移除內聯樣式，讓 CSS 接管）
  let body = select('body');
  let canvasContainer = select('#canvas-container');

  if (body) {
    body.elt.style.removeProperty('transition');
  }
  if (canvasContainer) {
    canvasContainer.elt.style.removeProperty('transition');
  }
}

function updateColorFromMouse(e) {
  if (!colorPickerCanvas) return;

  let rect = colorPickerCanvas.elt.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  let w = colorPickerCanvas.width;
  let h = colorPickerCanvas.height;
  let centerX = w / 2;
  let centerY = h / 2;

  // 計算相對於中心的位置
  let dx = x - centerX;
  let dy = y - centerY;

  // 計算距離中心的距離
  let distance = Math.sqrt(dx * dx + dy * dy);

  // 計算 color wheel 的內外半徑（與繪製邏輯一致）
  let outerRadius = w * 0.45;
  let innerRadius = w * 0.25;

  // 檢查是否在 wheel 的環形範圍內
  if (distance < innerRadius || distance > outerRadius) {
    // 鼠標不在有效範圍內，停止拖曳
    colorPickerDragging = false;
    return;
  }

  // 計算角度（弧度）- atan2 返回 -PI 到 PI
  let angle = Math.atan2(dy, dx);

  // 轉換為度數並調整：
  // 1. atan2(dy, dx) 在右側 = 0，頂部 = -90度
  // 2. 我們要頂部 = 0度，所以加 90度
  // 3. 轉換到 0-360 範圍
  selectedHue = (degrees(angle) + 90 + 360) % 360;

  // 更新 wireframeColor（使用 HSB 模式：飽和度 80%，亮度 100%）
  colorMode(HSB, 360, 100, 100);
  wireframeColor = color(selectedHue, 80, 100);
  colorMode(RGB, 255);

  // 根據亮度決定描邊顏色（黑色或白色）
  wireframeStrokeColor = getContrastColor(wireframeColor);

  // 更新背景顏色（拖動時禁用 transition，實現即時更新）
  updateBackgroundColor(wireframeColor, true);

  // 更新輸入框文字顏色（即時更新，與背景同步）
  updateInputTextColor();
}

// 計算顏色的相對亮度（根據 WCAG 標準）
function getRelativeLuminance(col) {
  let r = red(col) / 255;
  let g = green(col) / 255;
  let b = blue(col) / 255;

  // 應用 gamma 校正
  r = r <= 0.03928 ? r / 12.92 : pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 根據背景顏色亮度選擇黑色或白色作為對比色
function getContrastColor(bgColor) {
  let luminance = getRelativeLuminance(bgColor);

  // 如果亮度大於 0.5，使用黑色；否則使用白色
  if (luminance > 0.5) {
    return color(0, 0, 0); // 黑色
  } else {
    return color(255, 255, 255); // 白色
  }
}

// 更新輸入框文字顏色（Wireframe 模式下使用對比色）
function updateInputTextColor() {
  if (mode === "Wireframe" && wireframeStrokeColor) {
    // 使用與 logo 邊框相同的對比色
    let r = red(wireframeStrokeColor);
    let g = green(wireframeStrokeColor);
    let b = blue(wireframeStrokeColor);
    let textColor = `rgb(${r}, ${g}, ${b})`;

    inputBox.style("color", textColor);
    if (inputBoxMobile) {
      inputBoxMobile.style("color", textColor);
    }
  }
}

// 更新背景顏色（Wireframe 模式）- 使用 CSS 變數
function updateBackgroundColor(bgColor, disableTransition = false) {
  // 將顏色轉換為 CSS rgb 格式
  let r = red(bgColor);
  let g = green(bgColor);
  let b = blue(bgColor);
  let cssColor = `rgb(${r}, ${g}, ${b})`;

  // 根據背景亮度計算對比色（黑色或白色）
  let contrastColor = getContrastColor(bgColor);
  let borderR = red(contrastColor);
  let borderG = green(contrastColor);
  let borderB = blue(contrastColor);
  let borderCssColor = `rgb(${borderR}, ${borderG}, ${borderB})`;

  // 判斷是否使用暗色 icon（黑色 icon）
  let isDarkIcons = borderR === 0 && borderG === 0 && borderB === 0;

  // 根據 icon 顏色設定透明度：白色 50%，黑色 25%
  let opacityValue = isDarkIcons ? '0.25' : '0.5';

  if (disableTransition) {
    // 拖動色環時：臨時禁用 transition，實現即時更新
    let body = select('body');
    let canvasContainer = select('#canvas-container');

    if (body) {
      body.elt.style.transition = 'none';
    }
    if (canvasContainer) {
      canvasContainer.elt.style.transition = 'none';
    }

    // 更新 CSS 變數
    document.documentElement.style.setProperty('--wireframe-bg', cssColor);
    document.documentElement.style.setProperty('--wireframe-border', borderCssColor);
    document.documentElement.style.setProperty('--wireframe-opacity', opacityValue);

    // 根據 icon 顏色添加或移除 dark-icons class
    if (isDarkIcons) {
      body.addClass('dark-icons');
    } else {
      body.removeClass('dark-icons');
    }

    // 更新 icon 顏色（即時更新）
    updateIconsForMode();

    // 強制瀏覽器重新計算樣式（觸發 reflow）
    if (body) {
      body.elt.offsetHeight;
    }
  } else {
    // 切換模式時：使用 transition 動畫
    let body = select('body');

    document.documentElement.style.setProperty('--wireframe-bg', cssColor);
    document.documentElement.style.setProperty('--wireframe-border', borderCssColor);
    document.documentElement.style.setProperty('--wireframe-opacity', opacityValue);

    // 根據 icon 顏色添加或移除 dark-icons class
    if (body) {
      if (isDarkIcons) {
        body.addClass('dark-icons');
      } else {
        body.removeClass('dark-icons');
      }
    }

    // 更新 icon 顏色
    updateIconsForMode();
  }
}

// 恢復預設背景顏色（Standard/Inverse 模式）- 不再需要，CSS 會自動處理
// 這個函數現在是空的，因為 CSS 會根據 body class 自動切換背景色
function restoreDefaultBackground() {
  // CSS transition 會自動處理背景色切換，不需要 JS 操作
}