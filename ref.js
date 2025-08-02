let letters = []; // 儲存輸入的字母（已移除空格和換行）
let font; // 儲存載入的字體
let showCircle = false; // 是否顯示中央圓圈的標誌
let autoRotate = false; // 是否自動旋轉的標誌
let mode = "Standard"; // 當前顏色模式 ("Standard" 或 "Inverse")
let targetMode = "Standard"; // 用於模式轉換的目標顏色模式
let circleX, circleY; // 中央圓圈/Logo 的位置 (在 setup/draw 中計算)
let circleRadius, circleShrinking; // 用於圓圈動畫的變數 (半徑現在在 drawLogo 中固定)
let fadeAmount; // 用於背景模式轉換的漸變量
let circleAlpha = 0; // 用於中央圓圈淡入淡出的透明度

let inputBox; // 輸入文字的 textarea 元素
let rotateButton, customButton, resetButton; // 控制按鈕 (resetButton 是圖片)
let rSlider, gSlider, bSlider; // RGB 角度調整滑桿
let standardButton, inverseButton, saveButton, randomButton; // 其他功能按鈕 (random, reset, save 是圖片)

// 狀態變數
let isAutoRotateMode = false; // 當 "Automatic" 啟用時為 true (即使旋轉暫停也可能為 true)
let circleFillTimeout = null; // 用於自動填色計時器
let isEasterEggActive = false; // 彩蛋模式狀態

// 用於 Logo/彩蛋圖片切換的淡入淡出變數
let isFading = false;      // 是否正在淡入淡出
let fadeStartTime = 0;     // 淡入淡出開始時間
const fadeDuration = 400;  // 淡入淡出持續時間 (毫秒)
let logoAlpha = 255;       // 動態 Logo 的目標透明度
let easterEggAlpha = 0;    // 彩蛋圖片的目標透明度

let originalRotationAngles = []; // 儲存設定文字時的基礎角度 (通常是 0)
let rotationAngles = []; // 當前用於動畫/顯示的角度
let rRotationOffset = 0, gRotationOffset = 0, bRotationOffset = 0; // 滑桿的手動偏移量
let rotationFactor = 0; // 用於平滑自動旋轉啟動/停止的插值因子

let rAngleLabel, gAngleLabel, bAngleLabel; // 顯示滑桿數值的標籤元素

// 用於儲存分隔線位置的全域變數
let line1XPos = 0;
let line2XPos = 0;

// 用於測量文字高度的隱藏 div
let hiddenMeasurer;

// 彩蛋圖片變數
let sccdBlackImg, sccdWhiteImg;

// 定義 R, G, B 三組的顏色
const colors = [ [255, 68, 138], [0, 255, 128], [38, 188, 255] ];
// 定義 R, G, B 三組的基礎旋轉速度 (度/幀)
const baseSpeeds = [0.5, -0.5, 1];
// 字體大小
const defaultFontSize = '70px';
const smallerFontSize = '55px';
// 定義禁用顏色
const disabledColor = '#E0E0E0';
// 定義彩蛋觸發字串 (大寫無空格)
const easterEggString = "SHIHCHIENCOMMUNICATIONSDESIGN";


// --- 預載入 ---
function preload() {
  font = loadFont("Inter-Medium.ttf");
  loadImage('random_black.svg'); loadImage('random_white.svg'); loadImage('random_gray.svg');
  loadImage('reset_black.svg'); loadImage('reset_white.svg'); loadImage('reset_gray.svg');
  loadImage('save_black.svg'); loadImage('save_white.svg'); loadImage('save_gray.svg');
  sccdBlackImg = loadImage('sccd_black.png');
  sccdWhiteImg = loadImage('sccd_white.png');
}

// --- 初始化設定 ---
function setup() {
  createCanvas(windowWidth, windowHeight); frameRate(60);
  textFont(font); textSize(300); textAlign(CENTER, CENTER); imageMode(CENTER); // 設定 imageMode 為 CENTER

  // --- 輸入區域 ---
  let inputBoxWidth = min(500, windowWidth * 0.35); let inputBoxHeight = min(265, windowHeight * 0.35);
  inputBox = createElement("textarea"); inputBox.attribute("placeholder", "PLEASE TYPE AND ENTER");
  inputBox.elt.maxLength = 40; inputBox.size(inputBoxWidth, inputBoxHeight);
  inputBox.style("font-size", defaultFontSize); inputBox.style("resize", "none"); inputBox.style("overflow-y", "hidden");
  inputBox.style("white-space", "pre-wrap"); inputBox.style("border", "none"); inputBox.style("outline", "none");

  // 創建隱藏的 div 用於測量文字高度
  hiddenMeasurer = createDiv(''); hiddenMeasurer.size(inputBoxWidth, AUTO);
  hiddenMeasurer.style('font-family', inputBox.style('font-family')); hiddenMeasurer.style('font-size', inputBox.style('font-size'));
  hiddenMeasurer.style('white-space', 'pre-wrap'); hiddenMeasurer.style('word-wrap', 'break-word');
  hiddenMeasurer.style('visibility', 'hidden'); hiddenMeasurer.style('position', 'absolute');
  hiddenMeasurer.style('top', '-9999px'); hiddenMeasurer.style('left', '-9999px');

  // 輸入框內容改變時的處理函數
  inputBox.input(() => {
    let previousEasterEggState = isEasterEggActive; // 儲存改變前的狀態
    let rawInput = inputBox.value().toUpperCase(); let validInput = rawInput.replace(/[^A-Z \n]/g, "");
    validInput = validInput.replace(/ {2,}/g, ' ');
    let lines = validInput.split("\n"); if (lines.length > 3) { validInput = lines.slice(0, 3).join("\n"); }
    inputBox.value(validInput);
    let normalizedInput = validInput.toUpperCase().replace(/[\s\n]/g, "");
    if (normalizedInput === easterEggString) { isEasterEggActive = true; } else { isEasterEggActive = false; }
    if (isEasterEggActive !== previousEasterEggState) { isFading = true; fadeStartTime = millis(); }
    letters = validInput.replace(/[\s\n]/g, "").split("");
    if (rRotationOffset !== 0 || gRotationOffset !== 0 || bRotationOffset !== 0) { resetRotationOffsets(); rotationAngles = new Array(letters.length).fill(0); originalRotationAngles = [...rotationAngles]; }
    else { rotationAngles = new Array(letters.length).fill(0); originalRotationAngles = [...rotationAngles]; }
    if (!isEasterEggActive) { autoRotate = false; isAutoRotateMode = false; }
    layoutUIElements(); // 先重新佈局
    if (!isEasterEggActive) {
        let currentFontSize = inputBox.style('font-size'); hiddenMeasurer.style('font-size', currentFontSize);
        let htmlContent = inputBox.value().replace(/\n/g, '<br>'); hiddenMeasurer.html(htmlContent);
        let currentFontSizePx = parseFloat(currentFontSize); let estimatedLineHeight = currentFontSizePx * 1.2;
        let overflows = hiddenMeasurer.elt.scrollHeight > 3 * estimatedLineHeight + 5;
        let lessThanThreeLines = hiddenMeasurer.elt.scrollHeight <= 2 * estimatedLineHeight + 5;
        if (overflows) { if (currentFontSize !== smallerFontSize) { inputBox.style("font-size", smallerFontSize); hiddenMeasurer.style('font-size', smallerFontSize); } }
        else if (lessThanThreeLines) { if (currentFontSize !== defaultFontSize) { inputBox.style("font-size", defaultFontSize); hiddenMeasurer.style('font-size', defaultFontSize); } }
    } else { if (inputBox.style('font-size') !== defaultFontSize) { inputBox.style("font-size", defaultFontSize); } }
    if (circleFillTimeout) { clearTimeout(circleFillTimeout); circleFillTimeout = null; }
    if (!isEasterEggActive) {
        if (letters.length >= 10) { if (previousEasterEggState === true && isEasterEggActive === false) { showCircle = true; circleAlpha = 255; circleShrinking = false; }
            else if (!showCircle && !circleShrinking) { circleFillTimeout = setTimeout(() => { showCircle = true; circleShrinking = false; circleAlpha = 0; circleFillTimeout = null; }, 500); } }
        else { if (circleFillTimeout) { clearTimeout(circleFillTimeout); circleFillTimeout = null; } if (showCircle) { circleShrinking = true; } }
    } else { showCircle = false; circleShrinking = false; circleAlpha = 0; if (circleFillTimeout) { clearTimeout(circleFillTimeout); circleFillTimeout = null; } }
    updateUIStyles(); // 最後更新樣式
  });

  // --- 按鈕 ---
  function createManagedButton(label, onClick, className) { let button = createButton(label); button.mousePressed(onClick); if (className) { button.class(className); } return button; }
  rotateButton = createManagedButton( "Automatic 自動旋轉", () => { if (!isEasterEggActive && letters.length > 0) { isAutoRotateMode = true; autoRotate = !autoRotate; if (autoRotate) { resetRotationOffsets(); } layoutUIElements(); updateUIStyles(); } }, "custom-button-rotate" );
  customButton = createManagedButton( "Custom 自訂角度", () => { if (!isEasterEggActive && letters.length > 0) { isAutoRotateMode = false; autoRotate = false; rotationFactor = 0; resetRotationOffsets(); rotationAngles = [...originalRotationAngles]; layoutUIElements(); updateUIStyles(); } }, "custom-button-custom" );
  randomButton = createImg('random_gray.svg', 'Random Icon'); randomButton.addClass('image-button random-button');
  randomButton.mousePressed(() => { let hasAnyLetters = letters.length > 0; let customControlsEnabled = hasAnyLetters && !isAutoRotateMode; if (!isEasterEggActive && customControlsEnabled) { autoRotate = false; rotationFactor = 0; randomizeRotation(); updateUIStyles(); } });
  resetButton = createImg('reset_gray.svg', 'Reset Icon'); resetButton.addClass('image-button reset-button');
  resetButton.mousePressed(() => { let hasAnyLetters = letters.length > 0; let customControlsEnabled = hasAnyLetters && !isAutoRotateMode; if (!isEasterEggActive && customControlsEnabled) { autoRotate = false; rotationFactor = 0; resetRotationOffsets(); rotationAngles = [...originalRotationAngles]; updateUIStyles(); } });
  standardButton = createManagedButton( "Standard 標準版", () => { targetMode = "Standard"; fadeAmount = 0; }, "custom-button-standard" ); // 移除 if
  inverseButton = createManagedButton( "Inverse 反色版", () => { targetMode = "Inverse"; fadeAmount = 0; }, "custom-button-inverse" ); // 移除 if
  saveButton = createImg('save_gray.svg', 'Save Icon'); saveButton.addClass('image-button save-button');
  saveButton.mousePressed(() => { let hasAnyLetters = letters.length > 0; if (hasAnyLetters) { saveTransparentPNG(); } });

  // --- 滑桿 ---
  function createRGBSlider(changeCallback) { let slider = createSlider(-360, 360, 0, 1); slider.input(changeCallback); slider.class("custom-slider"); return slider; }
  rSlider = createRGBSlider(() => { if (!isEasterEggActive && !isAutoRotateMode) { autoRotate = false; rotationFactor = 0; rRotationOffset = rSlider.value(); updateUIStyles(); } });
  gSlider = createRGBSlider(() => { if (!isEasterEggActive && !isAutoRotateMode) { autoRotate = false; rotationFactor = 0; gRotationOffset = gSlider.value(); updateUIStyles(); } });
  bSlider = createRGBSlider(() => { if (!isEasterEggActive && !isAutoRotateMode) { autoRotate = false; rotationFactor = 0; bRotationOffset = bSlider.value(); updateUIStyles(); } });

  // --- 滑桿標籤 ---
   function createAngleLabel(colorValue) { let label = createP("0"); label.style("font-size", "14px"); label.style("color", colorValue); return label; }
   rAngleLabel = createAngleLabel(`rgb(${colors[0].join(',')})`); gAngleLabel = createAngleLabel(`rgb(${colors[1].join(',')})`); bAngleLabel = createAngleLabel(`rgb(${colors[2].join(',')})`);

  // --- 初始狀態設定 ---
  fadeAmount = 0; circleX = width * 0.7; circleY = height * 0.4;
  layoutUIElements(); updateUIStyles();
}

// --- 佈局 UI 元素的函數 --- (同 V23)
function layoutUIElements() {
    inputBox.position(width * 0.15, height * 0.25);
    let yRow1 = height * 0.75; let rowHeight = 45; let yRow2 = yRow1 + rowHeight;
    let standardButtonWidth = 150; let saveButtonWidth = 35;

    if (isEasterEggActive) {
        let gapModeToLine2 = 40; let gapLine2ToSave = 30;
        let totalWidth = standardButtonWidth + gapModeToLine2 + 1 + gapLine2ToSave + saveButtonWidth;
        let startX = (width / 2) - (totalWidth / 2);
        let xCol4_egg = startX;
        line2XPos = xCol4_egg + standardButtonWidth + gapModeToLine2;
        let xCol5_egg = line2XPos + 1 + gapLine2ToSave;
        standardButton.position(xCol4_egg, yRow1); inverseButton.position(xCol4_egg, yRow2);
        let saveButtonY = yRow1 + (rowHeight / 2); // 使用者指定的 Y 座標
        saveButton.position(xCol5_egg, saveButtonY);
        line1XPos = -1000; // 確保第一條線移出畫面
    } else {
        let xCol1 = width * 0.15; let rotateButtonWidth = 150;
        let imgButtonWidth = 35; let lineGap = 30; let gapLine1ToCol4 = 40;
        if (!isAutoRotateMode && letters.length > 0) {
            let xCol2Base = width * 0.3; let sliderWidth = 300;
            let gap1 = 80; let gap3 = 65;
            let xCol3Base = xCol2Base + sliderWidth + gap1; let xCol3 = xCol3Base - 12;
            let imgButtonY1 = yRow1 + (35 - imgButtonWidth) / 2; let imgButtonY2 = yRow2 + (35 - imgButtonWidth) / 2;
            line1XPos = xCol3 + imgButtonWidth + lineGap;
            let xCol4 = line1XPos + gapLine1ToCol4;
            let xCol5 = xCol4 + standardButtonWidth + gap3;
            rotateButton.position(xCol1, yRow1); customButton.position(xCol1, yRow2);
            randomButton.position(xCol3, imgButtonY1); resetButton.position(xCol3, imgButtonY2);
            let sliderX = xCol2Base;
            rSlider.position(sliderX, yRow1 + 6); gSlider.position(sliderX, yRow1 + 36); bSlider.position(sliderX, yRow1 + 66);
            rSlider.size(sliderWidth); gSlider.size(sliderWidth); bSlider.size(sliderWidth);
            let labelX = sliderX + sliderWidth + 15;
            rAngleLabel.position(labelX, yRow1 - 16); gAngleLabel.position(labelX, yRow1 + 14); bAngleLabel.position(labelX, yRow1 + 44);
            standardButton.position(xCol4, yRow1); inverseButton.position(xCol4, yRow2);
            let saveButtonY = yRow1 + (rowHeight / 2); // 使用者指定的 Y 座標
            saveButton.position(xCol5, saveButtonY);
            line2XPos = xCol4 + standardButtonWidth + lineGap;
        } else {
            let gap3 = 65;
            line1XPos = xCol1 + rotateButtonWidth + lineGap; // 計算收合時 line1 的位置
            let xCol4 = line1XPos + gapLine1ToCol4;
            let xCol5 = xCol4 + standardButtonWidth + gap3;
            rotateButton.position(xCol1, yRow1); customButton.position(xCol1, yRow2);
            standardButton.position(xCol4, yRow1); inverseButton.position(xCol4, yRow2);
            let saveButtonY = yRow1 + (rowHeight / 2); // 使用者指定的 Y 座標
            saveButton.position(xCol5, saveButtonY);
            line2XPos = xCol4 + standardButtonWidth + lineGap;
        }
    }
}


// --- 繪圖迴圈 --- (同 V23)
function draw() {
  let targetColorVal = targetMode === "Inverse" ? 0 : 255; let currentColorVal = mode === "Inverse" ? 0 : 255;
  let bgColor = lerpColor(color(currentColorVal), color(targetColorVal), fadeAmount); background(bgColor);
  if (mode !== targetMode) { if (fadeAmount < 1) { fadeAmount += 0.05; } else { mode = targetMode; updateUIStyles(); } }
  push(); stroke('#cccccc'); strokeWeight(1);
  let lineTopY = height * 0.75; let lineBottomY = height * 0.75 + 80;
  if (!isEasterEggActive && line1XPos > 0) { line( line1XPos, lineTopY, line1XPos, lineBottomY ); }
  line( line2XPos, lineTopY, line2XPos, lineBottomY ); pop();
  let currentLogoAlpha = logoAlpha; let currentEasterEggAlpha = easterEggAlpha;
  if (isFading) {
      let elapsedTime = millis() - fadeStartTime; let fadeProgress = constrain(elapsedTime / fadeDuration, 0, 1);
      if (isEasterEggActive) { currentLogoAlpha = lerp(255, 0, fadeProgress); currentEasterEggAlpha = lerp(0, 255, fadeProgress); }
      else { currentLogoAlpha = lerp(0, 255, fadeProgress); currentEasterEggAlpha = lerp(255, 0, fadeProgress); }
      if (fadeProgress === 1) { isFading = false; logoAlpha = currentLogoAlpha; easterEggAlpha = currentEasterEggAlpha; }
  } else { currentLogoAlpha = isEasterEggActive ? 0 : 255; currentEasterEggAlpha = isEasterEggActive ? 255 : 0; logoAlpha = currentLogoAlpha; easterEggAlpha = currentEasterEggAlpha; }
  if (currentEasterEggAlpha > 0) {
      push(); tint(255, currentEasterEggAlpha);
      let imgToShow = (mode === 'Inverse') ? sccdWhiteImg : sccdBlackImg;
      if (imgToShow && imgToShow.width > 0) { let imgSize = 300; image(imgToShow, circleX, circleY, imgSize, imgSize); }
      noTint(); pop();
  }
  if (!isEasterEggActive) {
      if (showCircle) {
           if (circleShrinking) { circleAlpha = lerp(circleAlpha, 0, 0.15); if (circleAlpha < 1) { circleAlpha = 0; showCircle = false; circleShrinking = false; } }
           else { circleAlpha = lerp(circleAlpha, 255, 0.1); }
           drawCentralCircle(this, circleAlpha, circleX, circleY);
      } else { circleShrinking = false; circleAlpha = 0; }
  }
  if (currentLogoAlpha > 0 && letters.length > 0 && !isEasterEggActive) {
       let alphaMultiplier = currentLogoAlpha / 255.0;
       drawLogo(this, alphaMultiplier, circleX, circleY);
  }
}

// --- 核心 Logo 繪製邏輯 --- (同 V11)
function drawLogo(pg, alphaMultiplier = 1, cx = circleX, cy = circleY) {
  let totalLetters = letters.length; if (totalLetters === 0) return;
  let angleStep = 360 / totalLetters;
  let sectionSize = floor(totalLetters / 3); let remainder = totalLetters % 3;
  let rCount = sectionSize + (remainder > 0 ? 1 : 0); let gCount = sectionSize + (remainder > 1 ? 1 : 0);
  pg.push(); pg.translate(cx, cy);
  pg.blendMode(mode === "Inverse" ? SCREEN : MULTIPLY);
  if (autoRotate) { rotationFactor = lerp(rotationFactor, 1, 0.1); }
  else { rotationFactor = lerp(rotationFactor, 0, 0.035); }
  rotationFactor = constrain(rotationFactor, 0, 1);
  for (let i = 0; i < totalLetters; i++) {
    let letter = letters[i]; let bounds = font.textBounds(letter, 0, 0, 300);
    let offsetY = bounds.y + bounds.h / 2; let colorIndex; let currentManualOffset;
    if (i < rCount) { colorIndex = 0; currentManualOffset = rRotationOffset; }
    else if (i < rCount + gCount) { colorIndex = 1; currentManualOffset = gRotationOffset; }
    else { colorIndex = 2; currentManualOffset = bRotationOffset; }
    let [r, g, b] = colors[colorIndex]; let rotationSpeed = baseSpeeds[colorIndex] * rotationFactor;
    if (rotationAngles[i] !== undefined) { rotationAngles[i] += rotationSpeed; } else { rotationAngles[i] = 0; }
    pg.fill(r, g, b, 255 * alphaMultiplier); pg.noStroke(); // 應用 alpha 乘數
    pg.push();
    let finalAngle = radians( i * angleStep + rotationAngles[i] + currentManualOffset - (totalLetters > 0 ? (totalLetters - 1) * angleStep : 0) );
    pg.rotate(finalAngle);
    if (letter === 'W') { pg.scale(0.85); } // 'W' 縮放
    pg.text(letter, 0, -offsetY);
    pg.pop();
  }
  pg.blendMode(BLEND); pg.pop();
}

// --- 繪製中央圓圈的函數 --- - 移除 alphaMultiplier
function drawCentralCircle(pg, baseAlpha, cx = circleX, cy = circleY) { // 移除 alphaMultiplier
    pg.push(); pg.translate(cx, cy);
    pg.fill(mode === "Inverse" ? 255 : 0, baseAlpha); // 直接使用 baseAlpha
    pg.noStroke();
    pg.circle(0, 0, 200); pg.pop();
}


// --- 更新 UI 樣式的函數 --- - 修改 Save 按鈕顯隱邏輯
function updateUIStyles() {
  let hasAnyLetters = letters.length > 0;
  let isStandardTarget = (targetMode === "Standard"); let isInverseTarget = (targetMode === "Inverse");
  let activeColor = (mode === "Inverse" ? "white" : "black"); let activeBorder = (mode === "Inverse" ? "2px solid white" : "2px solid black");

  inputBox.style("color", mode === "Inverse" ? "white" : "black");

  if (isEasterEggActive) {
      rotateButton.hide(); customButton.hide();
      rSlider.hide(); gSlider.hide(); bSlider.hide();
      rAngleLabel.hide(); gAngleLabel.hide(); bAngleLabel.hide();
      randomButton.hide(); resetButton.hide();
      standardButton.show(); inverseButton.show(); saveButton.show(); // 彩蛋模式下顯示 Save
      standardButton.elt.disabled = isStandardTarget; standardButton.style("color", isStandardTarget ? activeColor : disabledColor);
      standardButton.style("border", isStandardTarget ? activeBorder : "none"); standardButton.style("cursor", isStandardTarget ? "default" : "pointer");
      inverseButton.elt.disabled = isInverseTarget; inverseButton.style("color", isInverseTarget ? activeColor : disabledColor);
      inverseButton.style("border", isInverseTarget ? activeBorder : "none"); inverseButton.style("cursor", isInverseTarget ? "default" : "pointer");
      let saveSrc = mode === "Inverse" ? 'save_white.svg' : 'save_black.svg'; saveButton.style('cursor', 'pointer'); saveButton.attribute('src', saveSrc);
  } else {
      rotateButton.show(); customButton.show();
      rotateButton.elt.disabled = !hasAnyLetters; let isRotateButtonActive = isAutoRotateMode;
      rotateButton.style("color", !hasAnyLetters ? disabledColor : isRotateButtonActive ? activeColor : disabledColor);
      rotateButton.style("border", !hasAnyLetters ? "none" : isRotateButtonActive ? activeBorder : "none");
      rotateButton.style("cursor", !hasAnyLetters ? 'not-allowed' : "pointer");
      customButton.elt.disabled = !hasAnyLetters; let isCustomButtonActive = !isAutoRotateMode;
      customButton.style("color", !hasAnyLetters ? disabledColor : isCustomButtonActive ? activeColor : disabledColor);
      customButton.style("border", !hasAnyLetters ? "none" : isCustomButtonActive ? activeBorder : "none");
      customButton.style("cursor", !hasAnyLetters ? 'not-allowed' : isCustomButtonActive ? "default" : "pointer");
      standardButton.show(); inverseButton.show(); // 正常模式也顯示 Standard/Inverse
      standardButton.elt.disabled = isStandardTarget; standardButton.style("color", isStandardTarget ? activeColor : disabledColor);
      standardButton.style("border", isStandardTarget ? activeBorder : "none"); standardButton.style("cursor", isStandardTarget ? "default" : "pointer");
      inverseButton.elt.disabled = isInverseTarget; inverseButton.style("color", isInverseTarget ? activeColor : disabledColor);
      inverseButton.style("border", isInverseTarget ? activeBorder : "none"); inverseButton.style("cursor", isInverseTarget ? "default" : "pointer");
      let customControlsEnabled = hasAnyLetters && !isAutoRotateMode;
      let randomSrc, resetSrc;
      if (customControlsEnabled) { randomSrc = mode === "Inverse" ? 'random_white.svg' : 'random_black.svg'; resetSrc = mode === "Inverse" ? 'reset_white.svg' : 'reset_black.svg'; randomButton.style('cursor', 'pointer'); resetButton.style('cursor', 'pointer'); }
      else { randomSrc = 'random_gray.svg'; resetSrc = 'reset_gray.svg'; randomButton.style('cursor', 'not-allowed'); resetButton.style('cursor', 'not-allowed'); }
      randomButton.attribute('src', randomSrc); resetButton.attribute('src', resetSrc);
      let slidersEnabled = hasAnyLetters && !isAutoRotateMode;
      if (slidersEnabled) {
          rSlider.show(); gSlider.show(); bSlider.show();
          rAngleLabel.show(); gAngleLabel.show(); bAngleLabel.show();
          rSlider.elt.style.setProperty("--track-color", `rgb(${colors[0].join(',')})`); rSlider.elt.style.setProperty("--thumb-color", `rgb(${colors[0].join(',')})`);
          gSlider.elt.style.setProperty("--track-color", `rgb(${colors[1].join(',')})`); gSlider.elt.style.setProperty("--thumb-color", `rgb(${colors[1].join(',')})`);
          bSlider.elt.style.setProperty("--track-color", `rgb(${colors[2].join(',')})`); bSlider.elt.style.setProperty("--thumb-color", `rgb(${colors[2].join(',')})`);
          rAngleLabel.style("color", `rgb(${colors[0].join(',')})`); gAngleLabel.style("color", `rgb(${colors[1].join(',')})`); bAngleLabel.style("color", `rgb(${colors[2].join(',')})`);
      } else {
          rSlider.hide(); gSlider.hide(); bSlider.hide();
          rAngleLabel.hide(); gAngleLabel.hide(); bAngleLabel.hide();
      }
      rSlider.elt.disabled = !slidersEnabled; gSlider.elt.disabled = !slidersEnabled; bSlider.elt.disabled = !slidersEnabled;
      rAngleLabel.html((rSlider.value() > 0 ? "+" : "") + Math.round(rSlider.value())); gAngleLabel.html((gSlider.value() > 0 ? "+" : "") + Math.round(gSlider.value())); bAngleLabel.html((bSlider.value() > 0 ? "+" : "") + Math.round(bSlider.value()));
      if (customControlsEnabled) { randomButton.show(); resetButton.show(); }
      else { randomButton.hide(); resetButton.hide(); }

      // --- 修改：Save 按鈕顯隱與樣式 ---
      let saveSrc;
      if (hasAnyLetters) { // 只要有文字就顯示 Save
          saveSrc = mode === "Inverse" ? 'save_white.svg' : 'save_black.svg';
          saveButton.style('cursor', 'pointer');
          saveButton.show(); // 顯示
      } else { // 沒有文字時
          saveSrc = 'save_gray.svg';
          saveButton.style('cursor', 'not-allowed');
          saveButton.show(); // <--- 修改：初始無文字時也顯示
      }
      saveButton.attribute('src', saveSrc);
  }
}


// --- 輔助函數 --- (同 V10)
function resetRotationOffsets() { rRotationOffset = 0; gRotationOffset = 0; bRotationOffset = 0; rSlider.value(0); gSlider.value(0); bSlider.value(0); rAngleLabel.html("0"); gAngleLabel.html("0"); bAngleLabel.html("0"); }
function randomizeRotation() { isAutoRotateMode = false; rRotationOffset = Math.round(random(-360, 360)); gRotationOffset = Math.round(random(-360, 360)); bRotationOffset = Math.round(random(-360, 360)); rSlider.value(rRotationOffset); gSlider.value(gRotationOffset); bSlider.value(bRotationOffset); }

// --- 儲存函數 --- (同 V11)
function saveTransparentPNG() {
  if (isEasterEggActive) {
      let imgToSave = (mode === 'Inverse') ? sccdWhiteImg : sccdBlackImg;
      if (imgToSave) { let pg = createGraphics(imgToSave.width, imgToSave.height); pg.image(imgToSave, 0, 0); pg.save("sccd_logo.png"); }
  } else {
      let pg = createGraphics(windowWidth, windowHeight); pg.textFont(font); pg.textSize(300); pg.textAlign(CENTER, CENTER);
      let centerX = pg.width / 2; let centerY = pg.height / 2;
      if (showCircle) { drawCentralCircle(pg, 255, centerX, centerY); } // 儲存時 alpha 為 1 (移除 multiplier)
      drawLogo(pg, 1, centerX, centerY); pg.save("logo.png"); // 儲存時 alpha 為 1
  }
}

// --- 鍵盤輸入處理 --- (同 V18)
function keyPressed() {
  if (keyCode === ENTER) {
      if (!isEasterEggActive && letters.length > 0) { isAutoRotateMode = true; autoRotate = true; resetRotationOffsets(); layoutUIElements(); updateUIStyles(); }
      return false;
  }
  else if (keyCode === BACKSPACE) {
    autoRotate = false; isAutoRotateMode = false;
    resetRotationOffsets(); rotationAngles = [...originalRotationAngles];
    if (circleFillTimeout) { clearTimeout(circleFillTimeout); circleFillTimeout = null; }
    // inputBox.input() 會在之後觸發
    updateUIStyles(); // 只需更新樣式，佈局由 input 觸發
  }
}

// --- 視窗大小調整 --- (同 V10)
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    circleX = width * 0.7; circleY = height * 0.4;
    layoutUIElements();
}
