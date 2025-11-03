// ====================================
// 工具函數模塊
// ====================================

// 獲取禁用顏色（根據模式動態改變）
function getDisabledColor() {
  const isInverseMode = mode === "Inverse";
  return isInverseMode ? '#606060' : '#D2D2D2'; // Inverse: 深灰色, Standard: 淺灰色
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
  const hasText = letters.length > 0;
  const isInverseMode = mode === "Inverse";
  const isWireframeMode = mode === "Wireframe";

  // 在 Wireframe 模式下，根據背景色決定使用黑色或白色 icon
  let suffix = "";
  let disableSuffix = "";

  if (isWireframeMode) {
    // 根據 wireframeStrokeColor 判斷是使用黑色還是白色 icon
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    suffix = isWhiteIcon ? "_Inverse" : "";
    // Wireframe 模式下 disabled icon 也跟隨邊框顏色（白色邊框用白色 icon，黑色邊框用黑色 icon）
    disableSuffix = isWhiteIcon ? "_Inverse" : "";
  } else {
    suffix = isInverseMode ? "_Inverse" : "";
    disableSuffix = isInverseMode ? "_Disable_Inverse" : "_Disable_Standard";
  }

  let iconSrc = '';
  let isPlayIcon = false;

  if (!hasText) {
    iconSrc = `Panel Icon/Rotate${disableSuffix}.svg`;
  } else if (isAutoRotateMode) {
    if (autoRotate) {
      iconSrc = `Panel Icon/Pause${suffix}.svg`;
    } else {
      iconSrc = `Panel Icon/Play${suffix}.svg`;
      isPlayIcon = true;
    }
  } else {
    // Custom 模式下，Rotate 按鈕使用 disabled 版本的 icon
    iconSrc = `Panel Icon/Rotate${disableSuffix}.svg`;
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

  // 在 Wireframe 模式下，根據背景色決定使用黑色或白色 icon
  let suffix = "";
  let disableSuffix = "";

  if (isWireframeMode) {
    // 根據 wireframeStrokeColor 判斷是使用黑色還是白色 icon
    const isWhiteIcon = wireframeStrokeColor && red(wireframeStrokeColor) > 128;
    suffix = isWhiteIcon ? "_Inverse" : "";
    // Wireframe 模式下 disabled icon 也跟隨邊框顏色（白色邊框用白色 icon，黑色邊框用黑色 icon）
    disableSuffix = isWhiteIcon ? "_Inverse" : "";
  } else {
    suffix = isInverseMode ? "_Inverse" : "";
    disableSuffix = isInverseMode ? "_Disable_Inverse" : "_Disable_Standard";
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

  // Custom 圖標
  let customIconSrc;
  if (!hasText) {
    customIconSrc = `Panel Icon/Custom${disableSuffix}.svg`;
  } else if (isAutoRotateMode) {
    customIconSrc = `Panel Icon/Custom${disableSuffix}.svg`;
  } else {
    customIconSrc = `Panel Icon/Custom${suffix}.svg`;
  }

  // Download 圖標
  const downloadIconSrc = hasText ? `Panel Icon/Download${suffix}.svg` : `Panel Icon/Download${disableSuffix}.svg`;

  // Random 和 Reset 圖標
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
