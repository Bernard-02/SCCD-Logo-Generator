// ====================================
// 全域變數管理模塊
// ====================================

// --- 文字與字體相關 ---
let letters = [];
let font;

// --- Canvas 相關 ---
let canvasContainer;

// --- 動畫與視覺效果變數 ---
let showCircle = false;
let circleAlpha = 0;
let circleShrinking = false;
let circleFillTimeout = null;

// --- 旋轉相關變數 ---
let autoRotate = false;
let rotationFactor = 0;
let rotationAngles = [];
let originalRotationAngles = [];
let shouldResetToZero = false;
let resetEaseSpeed = 0.035;
const baseSpeeds = [0.125, -0.125, 0.25]; // R, G, B 各自的基礎旋轉速度
const placeholderBaseSpeeds = [0.125, -0.125, 0.25]; // Placeholder SVG 的旋轉速度

// --- 字體大小設定 ---
const extraLargeFontSize = '180px';  // 1-3 字
const largeFontSize = '120px';       // 4-15 字
const mediumFontSize = '90px';       // 16-30 字
const smallFontSize = '60px';        // 31-40 字

// --- 彩蛋相關 ---
const easterEggString = "SHIHCHIENCOMMUNICATIONSDESIGN";
let isEasterEggActive = false;
let sccdBlackImg, sccdWhiteImg; // 用於下載
let sccdBlackWireframeImg, sccdWhiteWireframeImg; // 用於下載
let sccdBlackImg_2, sccdWhiteImg_2; // 用於顯示
let sccdBlackWireframeImg_2, sccdWhiteWireframeImg_2; // 用於顯示

// --- 淡入淡出動畫 ---
let isFading = false;
let fadeStartTime = 0;
const fadeDuration = 400; // ms (彩蛋切換)
const modeTransitionDuration = 1000; // ms (模式切換時 logo 文字的 fade 時長)
let isModeTransition = false; // 是否為模式切換的淡入淡出
let logoAlpha = 255;
let easterEggAlpha = 0;

// --- UI 狀態與模式 ---
let mode = "Standard"; // "Standard", "Inverse", "Wireframe"
let targetMode = "Standard";
let previousMode = "Standard"; // 追蹤上一次的模式
let isAutoRotateMode = false;
let isCustomMode = false;

// --- 旋轉偏移 ---
let rRotationOffset = 0, gRotationOffset = 0, bRotationOffset = 0;
let targetRRotationOffset = 0, targetGRotationOffset = 0, targetBRotationOffset = 0;
let isEasingCustomRotation = false;
let customEaseSpeed = 0.08;

// --- Slider 動畫 ---
let currentRSliderValue = 0, currentGSliderValue = 0, currentBSliderValue = 0;
let targetRSliderValue = 0, targetGSliderValue = 0, targetBSliderValue = 0;
let isEasingSlider = false;

// --- Slider Hover 狀態 ---
// let hoveredSlider = null; // 'r', 'g', 'b', or null

// --- DOM 元素 ---
let inputBox, inputBoxMobile;
let rotateButton, customButton, colormodeButton, colormodeBox;
let randomButton, resetButton, saveButton, saveButtonMobile, saveBox;
let rSlider, gSlider, bSlider;
let rAngleLabel, gAngleLabel, bAngleLabel;
let randomImg, resetImg, saveImg, saveImgMobile, rotateIcon;
let customIcon, colormodeIcon;
let mobileRandomImg, mobileResetImg, mobileRotateIcon, mobileCustomIcon;

// --- 色彩選擇器相關變數 ---
let colorPickerCanvas;
let colorPickerContainer;
let selectedHue = 0; // 選擇的色相 (0-360)
let wireframeColor; // Wireframe 模式下的填充顏色
let wireframeStrokeColor; // Wireframe 模式下的描邊顏色
let colorPickerIndicatorX = 0; // 指示器 X 位置 (0-1)
let colorPickerIndicatorY = 0.5; // 指示器 Y 位置 (0-1)
let colorPickerDragging = false;

// --- Color Wheel 動畫相關 ---
let isColorWheelRotating = false; // Color wheel 是否正在旋轉
let colorWheelPlayButton; // Play/Pause 按鈕元素
let colorWheelPlayIcon; // Play/Pause icon 元素

// --- 禁用顏色 ---
let disabledColor = 'rgba(0, 0, 0, 0.25)'; // 黑色25%不透明度

// --- 響應式相關 ---
let isMobileMode = false;

// --- 下載相關 ---
let downloadNotification;
let isDownloading = false;

// --- 打字機動畫變數 ---
let typewriterActive = false;
let typewriterLines = [];
let typewriterCurrentLine = 0;
let typewriterCurrentChar = 0;
let typewriterStartTime = 0;
const typewriterDuration = 1200; // ms
let typewriterTotalChars = 0;

// --- Logo 繪製相關常數 ---
const colors = [ [255, 68, 138], [0, 255, 128], [38, 188, 255] ];

// --- Placeholder SVG 變數 ---
let placeholderR, placeholderG, placeholderB;
let placeholderR_white, placeholderG_white, placeholderB_white;
let placeholderRotations = [0, 0, 0];
let placeholderAlpha = 255;
let targetPlaceholderAlpha = 255;

// --- 頁面載入動畫變數 ---
let pageLoadStartTime = 0;
let inputBoxOpacity = 0;
let logoOpacity = 0;
let controlPanelOpacity = 0;
const fadeInDuration = 500; // ms
const fadeInDelay = 300; // ms
