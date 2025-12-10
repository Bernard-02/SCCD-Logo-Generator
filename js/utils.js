// ====================================
// 工具函數模塊
// ====================================

// 獲取禁用顏色（統一使用黑色25%不透明度）
function getDisabledColor() {
  return 'rgba(0, 0, 0, 0.25)'; // 黑色25%不透明度
}

// 檢測手機模式
function checkMobileMode() {
  // 使用 matchMedia API 與CSS媒體查詢保持同步
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  isMobileMode = mediaQuery.matches;
}

// 計算Canvas尺寸
function getCanvasSize() {
  if (isMobileMode) {
    // 手機版：根據 mobile-logo-container 的可用空間，計算最佳 canvas 尺寸
    // Logo 的理想比例是 1:1.05 (寬:高)
    const LOGO_ASPECT_RATIO = 1.05; // 高度 = 寬度 × 1.05

    const logoContainer = document.querySelector('.mobile-logo-container');
    if (logoContainer) {
      const rect = logoContainer.getBoundingClientRect();
      const availableWidth = rect.width;
      const availableHeight = rect.height;

      // 根據可用空間和 logo 比例，計算最大可能的 canvas 尺寸
      // 情況1: 寬度是限制因素（容器較窄）
      const widthBasedHeight = availableWidth * LOGO_ASPECT_RATIO;

      // 情況2: 高度是限制因素（容器較矮）
      const heightBasedWidth = availableHeight / LOGO_ASPECT_RATIO;

      let canvasWidth, canvasHeight;

      if (widthBasedHeight <= availableHeight) {
        // 寬度是瓶頸，使用全部寬度
        canvasWidth = availableWidth;
        canvasHeight = widthBasedHeight;
      } else {
        // 高度是瓶頸，使用全部高度
        canvasWidth = heightBasedWidth;
        canvasHeight = availableHeight;
      }

      return {
        width: Math.floor(canvasWidth),
        height: Math.floor(canvasHeight)
      };
    }

    // 如果無法取得 container，使用預設計算
    let availableWidth = window.innerWidth - 48; // 扣除左右 padding (1.5rem * 2 = 3rem = 48px)

    return {
      width: Math.floor(availableWidth),
      height: Math.floor(availableWidth * LOGO_ASPECT_RATIO)
    };
  } else {
    // 桌面版：固定尺寸 432x540，與 canvas-container 一致
    return {
      width: 432,
      height: 540
    };
  }
}

// 更新旋轉圖標（根據當前狀態）
function updateRotateIcon() {
  // 防禦性檢查：確保必要的變數已定義
  if (typeof letters === 'undefined' || typeof mode === 'undefined') {
    return;
  }

  const hasText = letters.length > 0;
  // 使用 targetMode 而不是 mode，以確保在模式切換時圖標正確更新
  const currentMode = (typeof targetMode !== 'undefined') ? targetMode : mode;
  const isInverseMode = currentMode === "Inverse";
  const isWireframeMode = currentMode === "Wireframe";

  // 決定 icon 後綴（黑色或白色版本）
  let suffix = "";

  if (isWireframeMode) {
    // 根據 wireframeStrokeColor 判斷是使用黑色還是白色 icon
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    suffix = isWhiteIcon ? "_Inverse" : "";
  } else {
    suffix = isInverseMode ? "_Inverse" : "";
  }

  // 確保變數有定義
  const autoRotateMode = (typeof isAutoRotateMode !== 'undefined') ? isAutoRotateMode : false;
  const isRotating = (typeof autoRotate !== 'undefined') ? autoRotate : false;

  // 桌面版：使用 Auto/Custom 模式邏輯
  let desktopIconSrc = '';
  let desktopIsPlayIcon = false;

  if (!hasText) {
    // 沒有文字時：顯示 Rotate icon（disabled 狀態）
    desktopIconSrc = `Panel Icon/Rotate${suffix}.svg`;
  } else if (autoRotateMode) {
    // 有文字且在 Auto Rotate 模式
    if (isRotating) {
      // 正在自動旋轉：顯示 Pause icon
      desktopIconSrc = `Panel Icon/Pause${suffix}.svg`;
    } else {
      // Auto 模式但暫停：顯示 Play icon
      desktopIconSrc = `Panel Icon/Play${suffix}.svg`;
      desktopIsPlayIcon = true;
    }
  } else {
    // 有文字且在 Custom 模式：顯示 Rotate icon（disabled 狀態）
    desktopIconSrc = `Panel Icon/Rotate${suffix}.svg`;
  }

  // 手機版：使用與桌面版相同的 Auto/Custom 模式邏輯
  let mobileIconSrc = desktopIconSrc;
  let mobileIsPlayIcon = desktopIsPlayIcon;

  // 更新桌面版 icon
  if (rotateIcon) {
    rotateIcon.attribute('src', desktopIconSrc);
    // 添加或移除 play-icon class
    let rotateButton = select('.custom-button-rotate');
    if (rotateButton) {
      if (desktopIsPlayIcon) {
        rotateButton.addClass('play-icon');
      } else {
        rotateButton.removeClass('play-icon');
      }
    }
  }

  // 更新手機版 icon
  if (mobileRotateIcon) {
    mobileRotateIcon.attribute('src', mobileIconSrc);
    // 添加或移除 play-icon class（手機版）
    let mobileRotateButton = select('.mobile-rotate-btn');
    if (mobileRotateButton) {
      if (mobileIsPlayIcon) {
        mobileRotateButton.addClass('play-icon');
      } else {
        mobileRotateButton.removeClass('play-icon');
      }
    }
  }
}

// 更新所有圖標根據當前模式
function updateIconsForMode() {
  const hasText = letters.length > 0;
  const isInverseMode = targetMode === "Inverse";
  const isWireframeMode = targetMode === "Wireframe";

  // 決定 icon 後綴（黑色或白色版本）
  // 所有 icon 統一使用當前模式的顏色，透過 CSS opacity 控制 disabled 狀態
  let suffix = "";

  if (isWireframeMode) {
    // 根據 wireframeStrokeColor 判斷是使用黑色還是白色 icon
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    suffix = isWhiteIcon ? "_Inverse" : "";
  } else {
    // Standard 模式：使用黑色 icon（無後綴）
    // Inverse 模式：使用白色 icon（_Inverse 後綴）
    suffix = isInverseMode ? "_Inverse" : "";
  }

  // Colormode 圖標
  let colormodeIconSrc;
  if (isWireframeMode) {
    // Wireframe 模式下，根據背景色選擇黑色或白色版本
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    colormodeIconSrc = isWhiteIcon ? `Panel Icon/Inverse_Wireframe.svg` : `Panel Icon/Standard_Wireframe.svg`;
  } else {
    switch(mode) {
      case "Standard":
        colormodeIconSrc = `Panel Icon/Standard.svg`;
        break;
      case "Inverse":
        colormodeIconSrc = `Panel Icon/Inverse_White.svg`;
        break;
      default:
        colormodeIconSrc = `Panel Icon/Standard.svg`;
    }
  }

  // Custom 圖標 - 統一使用當前模式的 icon，CSS 會根據 disabled 狀態調整 opacity
  const customIconSrc = `Panel Icon/Custom${suffix}.svg`;

  // Download 圖標 - 彩蛋模式下使用 Gift icon，否則使用 Download icon
  const downloadIconSrc = isEasterEggActive
    ? `Panel Icon/Gift${suffix}.svg`
    : `Panel Icon/Download${suffix}.svg`;

  // Random 和 Reset 圖標 - 統一使用當前模式的 icon
  const randomIconSrc = `Panel Icon/Random${suffix}.svg`;
  const resetIconSrc = `Panel Icon/Reset${suffix}.svg`;

  // 更新桌面版圖標
  if (customIcon) customIcon.attribute('src', customIconSrc);
  if (colormodeIcon) colormodeIcon.attribute('src', colormodeIconSrc);
  if (randomImg) randomImg.attribute('src', randomIconSrc);
  if (resetImg) resetImg.attribute('src', resetIconSrc);
  // 只在下載動畫未執行時更新下載按鈕icon（避免干擾動畫）
  if (saveImg && !isDownloading) saveImg.attribute('src', downloadIconSrc);

  // 更新手機版圖標
  if (mobileCustomIcon) mobileCustomIcon.attribute('src', customIconSrc);
  if (mobileRandomImg) mobileRandomImg.attribute('src', randomIconSrc);
  if (mobileResetImg) mobileResetImg.attribute('src', resetIconSrc);
  // 只在下載動畫未執行時更新下載按鈕icon（避免干擾動畫）
  if (saveImgMobile && !isDownloading) saveImgMobile.attribute('src', downloadIconSrc);

  // 更新 Rotate 圖標
  updateRotateIcon();

  // 更新 Color Wheel Play/Pause 圖標
  updateColorWheelIcon();

  // 更新手機版 Mode 按鈕圖標
  updateMobileModeIcon();

  // 更新手機版按鈕和面板的邊框顏色
  if (isWireframeMode && wireframeStrokeColor) {
    // Wireframe 模式：動態設定邊框顏色
    const borderColor = `rgb(${red(wireframeStrokeColor)}, ${green(wireframeStrokeColor)}, ${blue(wireframeStrokeColor)})`;

    // 更新底部按鈕邊框顏色
    const mobileBottomBtns = selectAll('.mobile-bottom-btn');
    mobileBottomBtns.forEach(btn => {
      btn.style('border-color', borderColor);
      btn.style('color', borderColor);
    });

    // 更新面板邊框顏色
    const mobilePanels = selectAll('.mobile-panel');
    mobilePanels.forEach(panel => {
      panel.style('border-color', borderColor);
      panel.style('color', borderColor);
    });

    // 更新 Bento 容器和按鈕邊框顏色
    const mobileBentoContainer = select('.mobile-bento-container');
    if (mobileBentoContainer) {
      mobileBentoContainer.style('border-color', borderColor);
    }

    const mobileBentoButtons = selectAll('.mobile-bento-button');
    mobileBentoButtons.forEach(btn => {
      btn.style('border-color', borderColor);
    });
  } else {
    // Standard/Inverse 模式：清除 inline style，讓 CSS 規則生效
    const mobileBottomBtns = selectAll('.mobile-bottom-btn');
    mobileBottomBtns.forEach(btn => {
      btn.style('border-color', '');
      btn.style('color', '');
    });

    const mobilePanels = selectAll('.mobile-panel');
    mobilePanels.forEach(panel => {
      panel.style('border-color', '');
      panel.style('color', '');
    });

    const mobileBentoContainer = select('.mobile-bento-container');
    if (mobileBentoContainer) {
      mobileBentoContainer.style('border-color', '');
    }

    const mobileBentoButtons = selectAll('.mobile-bento-button');
    mobileBentoButtons.forEach(btn => {
      btn.style('border-color', '');
    });
  }
}

// 更新 Color Wheel Play/Pause 圖標
function updateColorWheelIcon() {
  // 根據模式決定使用黑色或白色 icon
  let suffix = "";
  if (mode === "Inverse") {
    suffix = "_Inverse"; // 白色 icon
  } else if (mode === "Wireframe") {
    // Wireframe 模式下，根據描邊顏色選擇
    if (wireframeStrokeColor && red(wireframeStrokeColor) > 128) {
      suffix = "_Inverse"; // 白色 icon
    }
  }
  // Standard 模式：黑色 icon（無後綴）

  // 根據旋轉狀態選擇 Play 或 Pause icon
  let iconSrc = isColorWheelRotating
    ? `Panel Icon/Pause${suffix}.svg`
    : `Panel Icon/Play${suffix}.svg`;

  // 更新桌面版 icon
  if (colorWheelPlayIcon && colorWheelPlayButton) {
    colorWheelPlayIcon.attribute('src', iconSrc);

    // 添加或移除 is-play class（Play 狀態向右移 1px）
    if (isColorWheelRotating) {
      colorWheelPlayButton.removeClass('is-play');
    } else {
      colorWheelPlayButton.addClass('is-play');
    }
  }

  // 更新手機版 Color Wheel Play icon
  const mobileColorWheelPlayIcon = select('#mobile-colorwheel-play-icon');
  if (mobileColorWheelPlayIcon) {
    mobileColorWheelPlayIcon.attribute('src', iconSrc);
  }
}

// 更新手機版 Mode 按鈕圖標
function updateMobileModeIcon() {
  let mobileModeIcon = select("#mobile-mode-icon");
  if (!mobileModeIcon) return;

  const isWireframeMode = mode === "Wireframe";

  // 決定 icon 後綴（黑色或白色版本）
  let suffix = "";

  if (isWireframeMode) {
    // Wireframe 模式下，根據描邊顏色選擇黑色或白色版本
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    suffix = isWhiteIcon ? "_Inverse" : "";
  } else {
    // Standard 模式：使用黑色 icon（無後綴）
    // Inverse 模式：使用白色 icon（_Inverse 後綴）
    suffix = (mode === "Inverse") ? "_Inverse" : "";
  }

  // 根據當前模式選擇對應的 icon
  let iconSrc;
  if (isWireframeMode) {
    // Wireframe 模式下，根據背景色選擇黑色或白色版本
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

  mobileModeIcon.attribute('src', iconSrc);
}

// 更新手機版輸入框的垂直置中
function updateMobileInputBoxVerticalAlignment(inputBox, text) {
  console.log('✅ updateMobileInputBoxVerticalAlignment 被調用', {
    isMobileMode,
    hasMeasurer: !!mobileHiddenMeasurer,
    hasInputBox: !!inputBox,
    text: text ? text.substring(0, 20) : 'empty'
  });

  if (!isMobileMode || !mobileHiddenMeasurer || !inputBox) {
    console.log('❌ 條件檢查失敗，函數提前返回');
    return;
  }

  // 檢查是否有 custom-open class（這個狀態才需要靠上）
  // 注意：最滿狀態和鍵盤狀態現在都會走垂直居中邏輯，不會提前返回
  if (inputBox.elt.classList.contains('custom-open')) {
    console.log('⏭️ custom-open 狀態，文字靠上對齊（padding-top: 0）');
    inputBox.style('padding-top', '0');
    inputBox.style('padding-bottom', '0');
    return;
  }

  // 檢查是否處於鍵盤激活狀態（單行模式，高度受限）
  // 在此狀態下，輸入框高度固定且較小，不需要 padding 調整
  const inputArea = document.querySelector('.mobile-input-area');
  if (inputArea && inputArea.classList.contains('keyboard-active')) {
    console.log('⏭️ keyboard-active 狀態，不調整 padding（保持單行居中）');
    inputBox.style('padding-top', '0');
    inputBox.style('padding-bottom', '0');
    return;
  }

  // 如果沒有文字，設置 padding 讓 placeholder 垂直居中
  if (!text || text.trim() === '') {
    // Placeholder 是一行文字 "TYPE AND ENTER"，需要垂直居中
    const containerHeight = inputBox.elt.offsetHeight;
    const currentFontSize = parseFloat(window.getComputedStyle(inputBox.elt).fontSize);
    const lineHeight = currentFontSize * 1.2; // line-height: 1.2

    // Placeholder 只有一行，計算一行的總高度
    const placeholderHeight = lineHeight * 1;
    const paddingTop = Math.max(0, (containerHeight - placeholderHeight) / 2);

    inputBox.style('padding-top', `${paddingTop}px`);
    inputBox.style('padding-bottom', '0');
    return;
  }

  // 等待兩幀確保字體大小已經更新（第一幀更新 class，第二幀計算）
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 同步 hidden measurer 的字體大小（因為 small-text class 可能剛被加上/移除）
      const currentFontSize = window.getComputedStyle(inputBox.elt).fontSize;
      const lineHeight = parseFloat(currentFontSize) * 1.2;
      mobileHiddenMeasurer.style('font-size', currentFontSize);
      mobileHiddenMeasurer.style('line-height', '1.2');
      mobileHiddenMeasurer.style('width', inputBox.style('width'));

      // 設置 measurer 的內容（將換行轉為 <br>）
      const htmlContent = text.replace(/\n/g, '<br>');
      mobileHiddenMeasurer.html(htmlContent);

      // 獲取輸入框的固定高度和實際文字高度
      const containerHeight = inputBox.elt.offsetHeight;
      const textHeight = mobileHiddenMeasurer.elt.scrollHeight;

    // 計算文字行數（基於實際測量的高度）
    const estimatedLines = Math.round(textHeight / lineHeight);

    // 規則：無論幾行，都垂直居中
    const paddingTop = Math.max(0, (containerHeight - textHeight) / 2);

    console.log('🔍 垂直對齊計算:', {
      text: text.substring(0, 20),
      containerHeight,
      textHeight,
      lineHeight,
      estimatedLines,
      paddingTop
    });

      // 應用 padding（只設置 top，讓文字自然從上往下排列）
      inputBox.style('padding-top', `${paddingTop}px`);
      inputBox.style('padding-bottom', '0');
    });
  });
}
