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
    // 手機版：使用響應式尺寸
    let containerWidth = Math.min(window.innerWidth * 0.9, 400);
    let containerHeight = Math.min(window.innerHeight * 0.4, 420);

    // 保持比例 4:3
    let aspectRatio = 4 / 3;

    let calcHeight = containerWidth / aspectRatio;
    if (calcHeight > containerHeight) {
      containerWidth = containerHeight * aspectRatio;
      calcHeight = containerHeight;
    }

    // 確保最小高度為350px
    if (calcHeight < 350) {
      calcHeight = 350;
      containerWidth = calcHeight * aspectRatio;
    }

    return {
      width: Math.floor(containerWidth),
      height: Math.floor(calcHeight)
    };
  } else {
    // 桌面版：固定尺寸
    return {
      width: 528,
      height: 400
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

  // Download 圖標 - 統一使用當前模式的 icon，CSS 會根據 disabled 狀態調整 opacity
  const downloadIconSrc = `Panel Icon/Download${suffix}.svg`;

  // Random 和 Reset 圖標 - 統一使用當前模式的 icon
  const randomIconSrc = `Panel Icon/Random${suffix}.svg`;
  const resetIconSrc = `Panel Icon/Reset${suffix}.svg`;

  // 更新桌面版圖標
  if (customIcon) customIcon.attribute('src', customIconSrc);
  if (colormodeIcon) colormodeIcon.attribute('src', colormodeIconSrc);
  if (randomImg) randomImg.attribute('src', randomIconSrc);
  if (resetImg) resetImg.attribute('src', resetIconSrc);
  if (saveImg) saveImg.attribute('src', downloadIconSrc);

  // 更新手機版圖標
  if (mobileCustomIcon) mobileCustomIcon.attribute('src', customIconSrc);
  if (mobileRandomImg) mobileRandomImg.attribute('src', randomIconSrc);
  if (mobileResetImg) mobileResetImg.attribute('src', resetIconSrc);
  if (saveImgMobile) saveImgMobile.attribute('src', downloadIconSrc);

  // 更新 Rotate 圖標
  updateRotateIcon();
}
