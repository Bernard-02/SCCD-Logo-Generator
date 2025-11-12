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
    // 手機版：根據 canvas-container 的寬度決定大小，保持 1:1 正方形比例
    const container = document.getElementById('canvas-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      // 使用較小的尺寸來確保正方形
      const size = Math.min(containerWidth, containerHeight);

      return {
        width: Math.floor(size),
        height: Math.floor(size)
      };
    }

    // 如果無法取得 container，使用預設計算（正方形）
    let availableWidth = window.innerWidth - 48; // 扣除左右 padding (1.5rem * 2 = 3rem = 48px)

    return {
      width: Math.floor(availableWidth),
      height: Math.floor(availableWidth) // 正方形：寬度等於高度
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
  const isInverseMode = mode === "Inverse";
  const isWireframeMode = mode === "Wireframe";

  // 決定 icon 後綴（黑色或白色版本）
  // 統一使用當前模式的顏色，透過 CSS opacity 控制 disabled 狀態
  let suffix = "";

  if (isWireframeMode) {
    // 根據 wireframeStrokeColor 判斷是使用黑色還是白色 icon
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    suffix = isWhiteIcon ? "_Inverse" : "";
  } else {
    suffix = isInverseMode ? "_Inverse" : "";
  }

  let iconSrc = '';
  let isPlayIcon = false;

  // 統一使用當前模式的 icon，CSS 會根據 disabled 狀態調整 opacity
  // 確保 isAutoRotateMode 有定義
  const autoRotateMode = (typeof isAutoRotateMode !== 'undefined') ? isAutoRotateMode : false;
  const isRotating = (typeof autoRotate !== 'undefined') ? autoRotate : false;

  if (!hasText) {
    // 沒有文字時：顯示 Rotate icon（disabled 狀態）
    iconSrc = `Panel Icon/Rotate${suffix}.svg`;
  } else if (autoRotateMode) {
    // 有文字且在 Auto Rotate 模式
    if (isRotating) {
      // 正在自動旋轉：顯示 Pause icon
      iconSrc = `Panel Icon/Pause${suffix}.svg`;
    } else {
      // Auto 模式但暫停：顯示 Play icon
      iconSrc = `Panel Icon/Play${suffix}.svg`;
      isPlayIcon = true;
    }
  } else {
    // 有文字且在 Custom 模式：顯示 Rotate icon（disabled 狀態）
    iconSrc = `Panel Icon/Rotate${suffix}.svg`;
  }

  if (rotateIcon) {
    rotateIcon.attribute('src', iconSrc);
    // 添加或移除 play-icon class
    let rotateButton = select('.custom-button-rotate');
    if (rotateButton) {
      if (isPlayIcon) {
        rotateButton.addClass('play-icon');
      } else {
        rotateButton.removeClass('play-icon');
      }
    }
  }

  if (mobileRotateIcon) {
    mobileRotateIcon.attribute('src', iconSrc);
    // 添加或移除 play-icon class（手機版）
    let mobileRotateButton = select('.mobile-rotate');
    if (mobileRotateButton) {
      if (isPlayIcon) {
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
  const isInverseMode = mode === "Inverse";
  const isWireframeMode = mode === "Wireframe";

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

  // 更新手機版按鈕和面板的邊框顏色（Wireframe 模式需要動態設定）
  if (isWireframeMode && wireframeStrokeColor) {
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
  }
}

// 更新 Color Wheel Play/Pause 圖標
function updateColorWheelIcon() {
  if (!colorWheelPlayIcon || !colorWheelPlayButton) return;

  // 根據背景色決定使用黑色或白色 icon
  let suffix = "";
  if (wireframeStrokeColor && red(wireframeStrokeColor) > 128) {
    suffix = "_Inverse";
  }

  // 根據旋轉狀態選擇 Play 或 Pause icon
  let iconSrc = isColorWheelRotating
    ? `Panel Icon/Pause${suffix}.svg`
    : `Panel Icon/Play${suffix}.svg`;

  colorWheelPlayIcon.attribute('src', iconSrc);

  // 添加或移除 is-play class（Play 狀態向右移 1px）
  if (isColorWheelRotating) {
    colorWheelPlayButton.removeClass('is-play');
  } else {
    colorWheelPlayButton.addClass('is-play');
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
