// ====================================
// 手機版專用邏輯
// ====================================
// 此文件只在手機模式下運行，與桌面版邏輯互通但 UI 獨立

// 手機版 DOM 元素
let mobileElements = {
  // 底部按鈕列
  inputBtn: null,
  modeBtn: null,
  customBtn: null,
  rotateBtn: null,
  saveBtn: null,

  // 彈出面板
  inputPanel: null,
  colorpickerPanel: null,
  rotatePanel: null,

  // 輸入框
  inputBox: null,

  // Mode 圖標
  modeIcon: null,

  // Rotate 面板內的元素
  bentoCustomBtn: null,
  bentoPlayBtn: null,
  bentoCustomIcon: null,
  bentoPlayIcon: null,

  // Sliders (桌面版)
  rSlider: null,
  gSlider: null,
  bSlider: null,
  rAngleLabel: null,
  gAngleLabel: null,
  bAngleLabel: null,

  // 手機版 Custom 調整區
  customAngleControls: null,
  mobileRSlider: null,
  mobileGSlider: null,
  mobileBSlider: null,
  mobileRAngleLabel: null,
  mobileGAngleLabel: null,
  mobileBAngleLabel: null,
  mobileRandomBtn: null,
  mobileResetBtn: null,
  mobileRandomImg: null,
  mobileResetImg: null,

  // Random/Reset 按鈕
  randomBtn: null,
  resetBtn: null,
  randomIcon: null,
  resetIcon: null,

  // Color Picker (桌面版)
  colorpickerContainer: null,
  colorWheelPlayBtn: null,
  colorWheelPlayIcon: null,

  // 手機版 Color Picker Bar
  mobileColorpickerBar: null,
  mobileColorpickerContainer: null,
  mobileColorWheelPlayBtn: null,
  mobileColorWheelPlayIcon: null
};

// 初始化手機版 UI
function initMobileUI() {
  if (!isMobileMode) return;

  // 選取所有元素
  mobileElements.inputBtn = select('.mobile-input-btn');
  mobileElements.modeBtn = select('.mobile-mode-btn');
  mobileElements.customBtn = select('.mobile-custom-btn');
  mobileElements.rotateBtn = select('.mobile-rotate-btn');
  mobileElements.saveBtn = select('.mobile-save-btn');

  mobileElements.inputPanel = select('.mobile-input-panel');
  mobileElements.colorpickerPanel = select('.mobile-colorpicker-panel');
  mobileElements.rotatePanel = select('.mobile-rotate-panel');

  mobileElements.inputBox = select('#mobile-input-box');
  mobileElements.modeIcon = select('#mobile-mode-icon');

  // 創建隱藏的 div 用於測量文字高度（用於垂直置中）
  if (mobileElements.inputBox) {
    mobileHiddenMeasurer = createDiv('');
    mobileHiddenMeasurer.style('visibility', 'hidden');
    mobileHiddenMeasurer.style('position', 'absolute');
    mobileHiddenMeasurer.style('top', '-9999px');
    mobileHiddenMeasurer.style('left', '-9999px');
    mobileHiddenMeasurer.style('width', mobileElements.inputBox.style('width'));
    mobileHiddenMeasurer.style('font-family', mobileElements.inputBox.style('font-family'));
    mobileHiddenMeasurer.style('font-weight', mobileElements.inputBox.style('font-weight'));
    mobileHiddenMeasurer.style('font-size', mobileElements.inputBox.style('font-size'));
    mobileHiddenMeasurer.style('line-height', mobileElements.inputBox.style('line-height'));
    mobileHiddenMeasurer.style('white-space', 'pre-wrap');
    mobileHiddenMeasurer.style('word-wrap', 'break-word');
    mobileHiddenMeasurer.style('box-sizing', 'border-box');
  }

  mobileElements.bentoCustomBtn = select('.mobile-custom-button');
  mobileElements.bentoPlayBtn = select('.mobile-play-button');
  mobileElements.bentoCustomIcon = select('#mobile-custom-icon');
  mobileElements.bentoPlayIcon = select('#mobile-rotate-icon');

  mobileElements.rSlider = select('.mobile-r-slider');
  mobileElements.gSlider = select('.mobile-g-slider');
  mobileElements.bSlider = select('.mobile-b-slider');
  mobileElements.rAngleLabel = select('.mobile-r-angle-label');
  mobileElements.gAngleLabel = select('.mobile-g-angle-label');
  mobileElements.bAngleLabel = select('.mobile-b-angle-label');

  mobileElements.randomBtn = select('.mobile-random-button');
  mobileElements.resetBtn = select('.mobile-reset-button');
  mobileElements.randomIcon = select('.mobile-random-img');
  mobileElements.resetIcon = select('.mobile-reset-img');

  mobileElements.colorpickerContainer = select('#mobile-colorpicker-container');
  mobileElements.colorWheelPlayBtn = select('#mobile-colorwheel-play-button');
  mobileElements.colorWheelPlayIcon = select('#mobile-colorwheel-play-icon');

  // 手機版 Color Picker Bar 元素
  mobileElements.mobileColorpickerBar = select('.mobile-colorpicker-bar');
  mobileElements.mobileColorpickerContainer = select('#mobile-colorpicker-container');
  mobileElements.mobileColorWheelPlayBtn = select('#mobile-colorwheel-play-button');
  mobileElements.mobileColorWheelPlayIcon = select('#mobile-colorwheel-play-icon');

  // 手機版 Custom 調整區元素
  mobileElements.customAngleControls = select('.mobile-custom-angle-controls');
  mobileElements.mobileRSlider = select('#mobile-r-slider');
  mobileElements.mobileGSlider = select('#mobile-g-slider');
  mobileElements.mobileBSlider = select('#mobile-b-slider');
  mobileElements.mobileRAngleLabel = select('#mobile-r-angle-label');
  mobileElements.mobileGAngleLabel = select('#mobile-g-angle-label');
  mobileElements.mobileBAngleLabel = select('#mobile-b-angle-label');
  mobileElements.mobileRandomBtn = select('#mobile-random-button');
  mobileElements.mobileResetBtn = select('#mobile-reset-button');
  mobileElements.mobileRandomImg = select('#mobile-random-img');
  mobileElements.mobileResetImg = select('#mobile-reset-img');

  // 綁定事件
  bindMobileEvents();

  // 初始化 placeholder 的垂直置中
  if (mobileElements.inputBox) {
    updateMobileInputBoxVerticalAlignment(mobileElements.inputBox, '');
  }

  console.log('手機版 UI 初始化完成');
}

// 綁定手機版事件
function bindMobileEvents() {
  // 輸入框事件
  if (mobileElements.inputBox) {
    mobileElements.inputBox.input(handleInput);

    // 阻擋空白鍵
    mobileElements.inputBox.elt.addEventListener('keydown', function(e) {
      if (e.key === ' ' || e.keyCode === 32) {
        e.preventDefault();
      }
    });

    // 防止鍵盤彈出時自動滾動
    mobileElements.inputBox.elt.addEventListener('focus', function(e) {
      // 使用 scrollIntoView 防止自動滾動行為
      setTimeout(() => {
        mobileElements.inputBox.elt.scrollIntoView({
          behavior: 'instant',
          block: 'nearest',
          inline: 'nearest'
        });
      }, 0);
    }, { passive: true });
  }

  // 底部按鈕事件
  if (mobileElements.inputBtn) {
    mobileElements.inputBtn.mousePressed(toggleInputPanel);
  }

  if (mobileElements.modeBtn) {
    mobileElements.modeBtn.mousePressed(cycleModeButton);
  }

  if (mobileElements.customBtn) {
    mobileElements.customBtn.mousePressed(toggleMobileCustomPanel);
  }

  if (mobileElements.rotateBtn) {
    mobileElements.rotateBtn.mousePressed(toggleAutoRotate);
  }

  if (mobileElements.saveBtn) {
    mobileElements.saveBtn.mousePressed(() => {
      if (letters.length > 0 || isEasterEggActive) {
        saveTransparentPNG();
      }
    });
  }

  // Bento 面板按鈕事件
  if (mobileElements.bentoCustomBtn) {
    mobileElements.bentoCustomBtn.mousePressed(switchToCustomMode);
  }

  if (mobileElements.bentoPlayBtn) {
    mobileElements.bentoPlayBtn.mousePressed(toggleAutoRotate);
  }

  // Slider 事件
  if (mobileElements.rSlider) {
    mobileElements.rSlider.input(() => {
      if (!isEasterEggActive && !autoRotate) {
        handleMobileSliderChange('r', mobileElements.rSlider.value());
      }
    });
  }

  if (mobileElements.gSlider) {
    mobileElements.gSlider.input(() => {
      if (!isEasterEggActive && !autoRotate) {
        handleMobileSliderChange('g', mobileElements.gSlider.value());
      }
    });
  }

  if (mobileElements.bSlider) {
    mobileElements.bSlider.input(() => {
      if (!isEasterEggActive && !autoRotate) {
        handleMobileSliderChange('b', mobileElements.bSlider.value());
      }
    });
  }

  // Random/Reset 按鈕
  if (mobileElements.randomBtn) {
    mobileElements.randomBtn.mousePressed(handleRandomButton);
  }

  if (mobileElements.resetBtn) {
    mobileElements.resetBtn.mousePressed(handleResetButton);
  }

  // 手機版 Color Wheel Play 按鈕
  if (mobileElements.mobileColorWheelPlayBtn) {
    mobileElements.mobileColorWheelPlayBtn.mousePressed(() => {
      if (mode === "Wireframe") {
        isColorWheelRotating = !isColorWheelRotating;
        updateColorWheelIcon();
      }
    });
  }

  // 手機版 Custom 調整區的 Slider 事件
  if (mobileElements.mobileRSlider) {
    mobileElements.mobileRSlider.input(() => {
      if (!isEasterEggActive && !autoRotate) {
        handleMobileSliderChange('r', mobileElements.mobileRSlider.value());
      }
    });
  }

  if (mobileElements.mobileGSlider) {
    mobileElements.mobileGSlider.input(() => {
      if (!isEasterEggActive && !autoRotate) {
        handleMobileSliderChange('g', mobileElements.mobileGSlider.value());
      }
    });
  }

  if (mobileElements.mobileBSlider) {
    mobileElements.mobileBSlider.input(() => {
      if (!isEasterEggActive && !autoRotate) {
        handleMobileSliderChange('b', mobileElements.mobileBSlider.value());
      }
    });
  }

  // 手機版 Random/Reset 按鈕
  if (mobileElements.mobileRandomBtn) {
    mobileElements.mobileRandomBtn.mousePressed(handleRandomButton);
  }

  if (mobileElements.mobileResetBtn) {
    mobileElements.mobileResetBtn.mousePressed(handleResetButton);
  }

  // Angle Label 事件（簡化版，只支援輸入數字）
  bindMobileAngleLabelEvents();
}

// 綁定角度輸入框事件
function bindMobileAngleLabelEvents() {
  const filterAngleInput = function(e) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'];
    if (allowedKeys.includes(e.key)) return;
    if (!/^[0-9\-+]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  if (mobileElements.rAngleLabel) {
    mobileElements.rAngleLabel.elt.addEventListener('keydown', filterAngleInput);
    mobileElements.rAngleLabel.elt.addEventListener('input', function(e) {
      if (!isEasterEggActive && !autoRotate) {
        let angle = convertAngleInput(e.target.value);
        mobileElements.rSlider.value(angle);
        if (rSlider) rSlider.value(angle);
        handleMobileSliderChange('r', angle);
      }
    });
  }

  if (mobileElements.gAngleLabel) {
    mobileElements.gAngleLabel.elt.addEventListener('keydown', filterAngleInput);
    mobileElements.gAngleLabel.elt.addEventListener('input', function(e) {
      if (!isEasterEggActive && !autoRotate) {
        let angle = convertAngleInput(e.target.value);
        mobileElements.gSlider.value(angle);
        if (gSlider) gSlider.value(angle);
        handleMobileSliderChange('g', angle);
      }
    });
  }

  if (mobileElements.bAngleLabel) {
    mobileElements.bAngleLabel.elt.addEventListener('keydown', filterAngleInput);
    mobileElements.bAngleLabel.elt.addEventListener('input', function(e) {
      if (!isEasterEggActive && !autoRotate) {
        let angle = convertAngleInput(e.target.value);
        mobileElements.bSlider.value(angle);
        if (bSlider) bSlider.value(angle);
        handleMobileSliderChange('b', angle);
      }
    });
  }
}

// 關閉所有面板
function closeAllMobilePanels() {
  if (mobileElements.inputPanel) mobileElements.inputPanel.removeClass('active');
  if (mobileElements.colorpickerPanel) mobileElements.colorpickerPanel.removeClass('active');
  if (mobileElements.rotatePanel) mobileElements.rotatePanel.removeClass('active');
}

// 切換 Input 面板
function toggleInputPanel() {
  if (mobileElements.inputPanel.hasClass('active')) {
    mobileElements.inputPanel.removeClass('active');
  } else {
    closeAllMobilePanels();
    mobileElements.inputPanel.addClass('active');
    // Focus 到輸入框
    if (mobileElements.inputBox) {
      setTimeout(() => {
        mobileElements.inputBox.elt.focus();
      }, 300);
    }
  }
}

// 切換 Rotate 面板
function toggleRotatePanel() {
  if (mobileElements.rotatePanel.hasClass('active')) {
    mobileElements.rotatePanel.removeClass('active');
  } else {
    closeAllMobilePanels();
    mobileElements.rotatePanel.addClass('active');
  }
}

// 循環切換模式（Mode 按鈕）
function cycleModeButton() {
  // 循環切換
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

  // 根據模式自動顯示/隱藏 Color Picker Bar
  if (mobileElements.mobileColorpickerBar) {
    if (targetMode === "Wireframe") {
      // 切換到 Wireframe 模式：顯示 Color Picker Bar
      mobileElements.mobileColorpickerBar.removeClass('hidden');
    } else {
      // 切換到 Standard/Inverse 模式：隱藏 Color Picker Bar
      mobileElements.mobileColorpickerBar.addClass('hidden');
    }
  }

  updateUI();
}

// 手機版：Toggle Custom 調整區
function toggleMobileCustomPanel() {
  if (letters.length === 0 || isEasterEggActive) return;

  // 檢查調整區當前是否顯示
  const isHidden = mobileElements.customAngleControls.hasClass('hidden');

  if (isHidden) {
    // 如果調整區隱藏，需要先切換到 Custom 模式（如果還在 Auto 模式）
    if (isAutoRotateMode) {
      switchToCustomMode();
    }
    // 顯示調整區
    mobileElements.customAngleControls.removeClass('hidden');
  } else {
    // 如果調整區顯示，隱藏它（但保持在 Custom 模式）
    mobileElements.customAngleControls.addClass('hidden');
  }
}


// 切換到 Custom 模式
function switchToCustomMode() {
  if (letters.length === 0 || isEasterEggActive) return;

  // 如果已經在 Custom 模式，不做任何事
  if (!isAutoRotateMode) return;

  // 切換到 Custom 模式
  isAutoRotateMode = false;
  autoRotate = false;

  // 正規化角度
  for (let i = 0; i < rotationAngles.length; i++) {
    if (rotationAngles[i] !== undefined) {
      rotationAngles[i] = normalizeAngle(rotationAngles[i]);
    }
  }

  // 計算回到 0° 的最短路徑
  let rDiff = getShortestRotation(rRotationOffset, 0);
  let gDiff = getShortestRotation(gRotationOffset, 0);
  let bDiff = getShortestRotation(bRotationOffset, 0);

  targetRRotationOffset = rRotationOffset + rDiff;
  targetGRotationOffset = gRotationOffset + gDiff;
  targetBRotationOffset = bRotationOffset + bDiff;

  targetRSliderValue = 0;
  targetGSliderValue = 0;
  targetBSliderValue = 0;

  isEasingCustomRotation = true;
  isEasingSlider = true;
  shouldResetToZero = true;

  // 不自動顯示調整區，由用戶通過按鈕控制

  updateRotateIcon();
  updateUI();
}

// 切換自動旋轉（與桌面版相同的邏輯）
function toggleAutoRotate() {
  if (letters.length === 0 || isEasterEggActive) return;

  // 從 Custom 模式切換到 Auto 模式
  if (!isAutoRotateMode) {
    isAutoRotateMode = true;
    autoRotate = true;
    resetRotationOffsets();

    // 手機版：隱藏 Custom 調整區
    if (isMobileMode && mobileElements.customAngleControls) {
      mobileElements.customAngleControls.addClass('hidden');
    }
  } else {
    // 已經在 Auto 模式，只是 toggle
    autoRotate = !autoRotate;
    if (autoRotate) {
      resetRotationOffsets();
    }
  }

  updateRotateIcon();
  updateUI();
}

// 處理 Slider 變化
function handleMobileSliderChange(channel, value) {
  // 停止 easing
  isEasingCustomRotation = false;
  isEasingSlider = false;

  // 更新對應的 offset
  switch(channel) {
    case 'r':
      rRotationOffset = value;
      targetRRotationOffset = value;
      currentRSliderValue = value;
      targetRSliderValue = value;
      if (rSlider) rSlider.value(value);
      break;
    case 'g':
      gRotationOffset = value;
      targetGRotationOffset = value;
      currentGSliderValue = value;
      targetGSliderValue = value;
      if (gSlider) gSlider.value(value);
      break;
    case 'b':
      bRotationOffset = value;
      targetBRotationOffset = value;
      currentBSliderValue = value;
      targetBSliderValue = value;
      if (bSlider) bSlider.value(value);
      break;
  }

  updateUI();
}

// Random 按鈕
function handleRandomButton() {
  if (letters.length === 0 || autoRotate || isEasterEggActive) return;

  const letterCount = letters.length;

  // 生成隨機角度
  let newRAngle = (letterCount > 0) ? floor(random(-180, 180)) : 0;
  let newGAngle = (letterCount > 1) ? floor(random(-180, 180)) : 0;
  let newBAngle = (letterCount > 2) ? floor(random(-180, 180)) : 0;

  // 計算最短路徑
  let rDiff = getShortestRotation(rRotationOffset, newRAngle);
  let gDiff = getShortestRotation(gRotationOffset, newGAngle);
  let bDiff = getShortestRotation(bRotationOffset, newBAngle);

  targetRRotationOffset = rRotationOffset + rDiff;
  targetGRotationOffset = gRotationOffset + gDiff;
  targetBRotationOffset = bRotationOffset + bDiff;

  targetRSliderValue = normalizeAngle(targetRRotationOffset);
  targetGSliderValue = normalizeAngle(targetGRotationOffset);
  targetBSliderValue = normalizeAngle(targetBRotationOffset);

  isEasingCustomRotation = true;
  isEasingSlider = true;

  updateUI();
}

// Reset 按鈕
function handleResetButton() {
  if (letters.length === 0 || autoRotate || isEasterEggActive) return;

  // 計算回到 0°
  let rDiff = getShortestRotation(rRotationOffset, 0);
  let gDiff = getShortestRotation(gRotationOffset, 0);
  let bDiff = getShortestRotation(bRotationOffset, 0);

  targetRRotationOffset = rRotationOffset + rDiff;
  targetGRotationOffset = gRotationOffset + gDiff;
  targetBRotationOffset = bRotationOffset + bDiff;

  targetRSliderValue = 0;
  targetGSliderValue = 0;
  targetBSliderValue = 0;

  isEasingCustomRotation = true;
  isEasingSlider = true;

  updateUI();
}

// 更新手機版 UI 狀態
function updateMobileUI() {
  if (!isMobileMode) return;

  const hasText = letters.length > 0;
  const isWireframe = mode === "Wireframe";

  // 更新 Mode 圖標
  updateMobileModeIcon();

  // 更新 Rotate 圖標（使用共用函數）
  updateRotateIcon();

  // 更新 Sliders 狀態
  updateMobileSliders();

  // 更新按鈕狀態
  updateMobileButtons();

  // 更新圖標顏色
  updateMobileIcons();

  // 同步桌面版的 sliders（如果存在）
  syncDesktopSliders();
}

// 更新手機版 Sliders
function updateMobileSliders() {
  if (!mobileElements.rSlider) return;

  const hasText = letters.length > 0;
  const letterCount = letters.length;

  // R slider（至少 1 個字母）
  if (hasText && letterCount >= 1 && !autoRotate && !isEasterEggActive) {
    mobileElements.rSlider.removeAttribute('disabled');
    mobileElements.rSlider.addClass('enabled');
    if (mobileElements.rAngleLabel) {
      mobileElements.rAngleLabel.addClass('enabled');
      mobileElements.rAngleLabel.value(Math.round(rRotationOffset));
    }
  } else {
    mobileElements.rSlider.attribute('disabled', '');
    mobileElements.rSlider.removeClass('enabled');
    if (mobileElements.rAngleLabel) {
      mobileElements.rAngleLabel.removeClass('enabled');
      mobileElements.rAngleLabel.value('0');
    }
  }

  // G slider（至少 2 個字母）
  if (hasText && letterCount >= 2 && !autoRotate && !isEasterEggActive) {
    mobileElements.gSlider.removeAttribute('disabled');
    mobileElements.gSlider.addClass('enabled');
    if (mobileElements.gAngleLabel) {
      mobileElements.gAngleLabel.addClass('enabled');
      mobileElements.gAngleLabel.value(Math.round(gRotationOffset));
    }
  } else {
    mobileElements.gSlider.attribute('disabled', '');
    mobileElements.gSlider.removeClass('enabled');
    if (mobileElements.gAngleLabel) {
      mobileElements.gAngleLabel.removeClass('enabled');
      mobileElements.gAngleLabel.value('0');
    }
  }

  // B slider（至少 3 個字母）
  if (hasText && letterCount >= 3 && !autoRotate && !isEasterEggActive) {
    mobileElements.bSlider.removeAttribute('disabled');
    mobileElements.bSlider.addClass('enabled');
    if (mobileElements.bAngleLabel) {
      mobileElements.bAngleLabel.addClass('enabled');
      mobileElements.bAngleLabel.value(Math.round(bRotationOffset));
    }
  } else {
    mobileElements.bSlider.attribute('disabled', '');
    mobileElements.bSlider.removeClass('enabled');
    if (mobileElements.bAngleLabel) {
      mobileElements.bAngleLabel.removeClass('enabled');
      mobileElements.bAngleLabel.value('0');
    }
  }
}

// 更新手機版按鈕狀態
function updateMobileButtons() {
  const hasText = letters.length > 0;

  // 更新底部按鈕的 disabled 狀態
  // Mode 按鈕始終啟用

  // Custom 按鈕：手機版只在沒有文字時禁用（與桌面版不同）
  if (mobileElements.customBtn) {
    if (!hasText) {
      mobileElements.customBtn.elt.disabled = true;
    } else {
      mobileElements.customBtn.elt.disabled = false;
    }
  }

  // Rotate 按鈕：沒有文字時禁用
  if (mobileElements.rotateBtn) {
    if (!hasText) {
      mobileElements.rotateBtn.elt.disabled = true;
    } else {
      mobileElements.rotateBtn.elt.disabled = false;
    }
  }

  // Save 按鈕：沒有文字時禁用（彩蛋除外）
  if (mobileElements.saveBtn) {
    if (!hasText && !isEasterEggActive) {
      mobileElements.saveBtn.elt.disabled = true;
    } else {
      mobileElements.saveBtn.elt.disabled = false;
    }
  }

  // Custom/Play 按鈕的 active 狀態（Bento 面板內的按鈕）
  if (mobileElements.bentoCustomBtn) {
    if (!autoRotate && hasText) {
      mobileElements.bentoCustomBtn.addClass('active');
    } else {
      mobileElements.bentoCustomBtn.removeClass('active');
    }
  }

  if (mobileElements.bentoPlayBtn) {
    if (autoRotate && hasText) {
      mobileElements.bentoPlayBtn.addClass('active');
    } else {
      mobileElements.bentoPlayBtn.removeClass('active');
    }
  }
}

// 更新手機版圖標
function updateMobileIcons() {
  const isWireframe = mode === "Wireframe";
  const suffix = getSuffixForMode();

  // Random/Reset 圖標（舊的 Bento 面板）
  if (mobileElements.randomIcon) {
    mobileElements.randomIcon.attribute('src', `Panel Icon/Random${suffix}.svg`);
  }
  if (mobileElements.resetIcon) {
    mobileElements.resetIcon.attribute('src', `Panel Icon/Reset${suffix}.svg`);
  }

  // Random/Reset 圖標（新的 Custom 調整區）
  if (mobileElements.mobileRandomImg) {
    mobileElements.mobileRandomImg.attribute('src', `Panel Icon/Random${suffix}.svg`);
  }
  if (mobileElements.mobileResetImg) {
    mobileElements.mobileResetImg.attribute('src', `Panel Icon/Reset${suffix}.svg`);
  }

  // Custom 圖標
  if (mobileElements.bentoCustomIcon) {
    mobileElements.bentoCustomIcon.attribute('src', `Panel Icon/Custom${suffix}.svg`);
  }

  // Play/Pause 圖標（Bento 面板）
  updateMobileBentoPlayIcon();

  // 更新邊框顏色
  if (isWireframe && wireframeStrokeColor) {
    // Wireframe 模式：設定動態顏色
    updateMobileBorderColors();
  } else {
    // Standard/Inverse 模式：清除 inline style，讓 CSS 規則生效
    const bottomBtns = selectAll('.mobile-bottom-btn');
    bottomBtns.forEach(btn => {
      btn.style('border-color', '');
      btn.style('color', '');
    });

    const bentoContainer = select('.mobile-bento-container');
    if (bentoContainer) {
      bentoContainer.style('border-color', '');
    }

    const bentoLeft = select('.mobile-bento-left');
    if (bentoLeft) {
      bentoLeft.style('border-color', '');
    }

    const bentoButtons = selectAll('.mobile-bento-button');
    bentoButtons.forEach(btn => {
      btn.style('border-color', '');
    });
  }
}

// 更新 Bento Play 圖標
function updateMobileBentoPlayIcon() {
  if (!mobileElements.bentoPlayIcon) return;

  const hasText = letters.length > 0;
  const suffix = getSuffixForMode();

  let iconSrc = '';

  if (!hasText) {
    iconSrc = `Panel Icon/Rotate${suffix}.svg`;
  } else if (isAutoRotateMode) {
    if (autoRotate) {
      iconSrc = `Panel Icon/Pause${suffix}.svg`;
    } else {
      iconSrc = `Panel Icon/Play${suffix}.svg`;
    }
  } else {
    iconSrc = `Panel Icon/Rotate${suffix}.svg`;
  }

  mobileElements.bentoPlayIcon.attribute('src', iconSrc);
}

// 取得圖標後綴
function getSuffixForMode() {
  if (mode === "Wireframe") {
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    return isWhiteIcon ? "_Inverse" : "";
  } else {
    return (mode === "Inverse") ? "_Inverse" : "";
  }
}

// 更新手機版邊框顏色（Wireframe 模式）
function updateMobileBorderColors() {
  if (!wireframeStrokeColor) return;

  const borderColor = `rgb(${red(wireframeStrokeColor)}, ${green(wireframeStrokeColor)}, ${blue(wireframeStrokeColor)})`;

  // 底部按鈕
  const bottomBtns = selectAll('.mobile-bottom-btn');
  bottomBtns.forEach(btn => {
    btn.style('border-color', borderColor);
    btn.style('color', borderColor);
  });

  // Bento 容器和按鈕
  const bentoContainer = select('.mobile-bento-container');
  if (bentoContainer) {
    bentoContainer.style('border-color', borderColor);
  }

  const bentoLeft = select('.mobile-bento-left');
  if (bentoLeft) {
    bentoLeft.style('border-color', borderColor);
  }

  const bentoButtons = selectAll('.mobile-bento-button');
  bentoButtons.forEach(btn => {
    btn.style('border-color', borderColor);
  });
}

// 同步桌面版 Sliders
function syncDesktopSliders() {
  if (!rSlider || !gSlider || !bSlider) return;

  // 同步數值
  if (mobileElements.rSlider) rSlider.value(mobileElements.rSlider.value());
  if (mobileElements.gSlider) gSlider.value(mobileElements.gSlider.value());
  if (mobileElements.bSlider) bSlider.value(mobileElements.bSlider.value());
}

// 更新手機版 Mode 圖標（複製 utils.js 的邏輯）
function updateMobileModeIcon() {
  if (!mobileElements.modeIcon) return;

  const isWireframe = mode === "Wireframe";
  let iconSrc;

  if (isWireframe) {
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    iconSrc = isWhiteIcon ? `Panel Icon/Inverse_Wireframe.svg` : `Panel Icon/Standard_Wireframe.svg`;
  } else {
    switch(mode) {
      case "Standard":
        iconSrc = `Panel Icon/Standard.svg`;
        break;
      case "Inverse":
        iconSrc = `Panel Icon/Inverse_White.svg`;
        break;
      default:
        iconSrc = `Panel Icon/Standard.svg`;
    }
  }

  mobileElements.modeIcon.attribute('src', iconSrc);
}

// ====================================
// Visual Viewport API：處理鍵盤覆蓋行為
// ====================================
// 使用 Visual Viewport API 來偵測虛擬鍵盤的出現並調整佈局
if (window.visualViewport) {
  let initialHeight = window.visualViewport.height;

  window.visualViewport.addEventListener('resize', () => {
    if (!isMobileMode) return;

    const currentHeight = window.visualViewport.height;
    const keyboardHeight = initialHeight - currentHeight;

    // 鍵盤彈出時（viewport 高度減少）
    if (keyboardHeight > 0) {
      // 不做任何調整，讓內容保持原位，鍵盤覆蓋在上方
      // 確保 body 固定不動
      document.body.style.height = `${initialHeight}px`;
    } else {
      // 鍵盤收起時，恢復原本高度
      document.body.style.height = '100vh';
      document.body.style.height = '100dvh';
    }
  });

  // 偵測 scroll 事件，防止頁面被鍵盤推上去
  window.visualViewport.addEventListener('scroll', () => {
    if (!isMobileMode) return;
    // 強制回到原位
    window.scrollTo(0, 0);
  });
}
