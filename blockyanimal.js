//Vertex & Fragment Shaders//
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
 
  void main() {
    // Apply global rotation first, then the local ModelMatrix
    gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
 
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

//Global WebGL Variables //
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotation;

//Camera Angles //
let g_CamAngleX = 30;   // pitch
let g_CamAngleY = 30;   // yaw
let g_CamAngleZ = 0;    // roll if desired

//Cat Joint Angles (Sliders)//
let g_HeadAngleX = 0;
let g_HeadAngleY = 0;
let g_HeadAngleZ = 0;

let g_FrontLeftLegUpper = 10;   
let g_FrontLeftLegLower = 0;
let g_FrontRightLegUpper = 10;
let g_FrontRightLegLower = 0;

let g_FrontLeftLegPaw   = 0; 

let g_BackLeftLegUpper  = -20;
let g_BackLeftLegLower  = 40;
let g_BackRightLegUpper = -20;
let g_BackRightLegLower = 40;

// *** Paw angles for each leg ***
let g_FrontLeftPawAngle  = 0;
let g_FrontRightPawAngle = 0;
let g_BackLeftPawAngle   = 0;   
let g_BackRightPawAngle  = 0;   

//Animation Toggles & Variables //
let g_AnimationOn = false;
let g_PokeAnimation = false;  
let g_TailAngle = 0;          // wagging tail angle
let g_EarWiggleAngle = 0;     // ear-wiggle angle
let g_BodyBob = 0; 
let g_WhiskerSway = 0;   

//Time-Based Animation //
let g_startTime = 0;
let g_seconds   = 0;

//========== Mouse-Drag Variables ==========//
let g_isDragging = false;
let g_lastX = 0;
let g_lastY = 0;


//========== MAIN ENTRY POINT ==========//
function main() {
  const canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl');
  if (!gl) {
    console.log('Failed to get WebGL context.');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to init shaders.');
    return;
  }

  a_Position       = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor      = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix    = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');

  if (a_Position < 0 || !u_FragColor || !u_ModelMatrix || !u_GlobalRotation) {
    console.log('Failed to get shader variable locations.');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

  initEventHandlers();

  g_startTime = performance.now() / 1000.0;
  requestAnimationFrame(tick);
}


//========== EVENT HANDLERS ==========//
function initEventHandlers() {
  // Sliders
  document.getElementById('h-slider-x').oninput = function() {
    g_HeadAngleX = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('h-slider-y').oninput = function() {
    g_HeadAngleY = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('h-slider-z').oninput = function() {
    g_HeadAngleZ = parseFloat(this.value);
    renderScene();
  };

  document.getElementById('front-left-leg-upper-slider').oninput = function() {
    g_FrontLeftLegUpper = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('front-left-leg-lower-slider').oninput = function() {
    g_FrontLeftLegLower = parseFloat(this.value);
    renderScene();
  };

  document.getElementById('front-right-leg-upper-slider').oninput = function() {
    g_FrontRightLegUpper = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('front-right-leg-lower-slider').oninput = function() {
    g_FrontRightLegLower = parseFloat(this.value);
    renderScene();
  };

  document.getElementById('back-left-leg-upper-slider').oninput = function() {
    g_BackLeftLegUpper = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('back-left-leg-lower-slider').oninput = function() {
    g_BackLeftLegLower = parseFloat(this.value);
    renderScene();
  };

  document.getElementById('back-right-leg-upper-slider').oninput = function() {
    g_BackRightLegUpper = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('back-right-leg-lower-slider').oninput = function() {
    g_BackRightLegLower = parseFloat(this.value);
    renderScene();
  };

  document.getElementById('front-left-leg-paw-slider').oninput = function() {
    g_FrontLeftPawAngle = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('front-right-leg-paw-slider').oninput = function() {
    g_FrontRightPawAngle = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('back-left-leg-paw-slider').oninput = function() {
    g_BackLeftPawAngle = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('back-right-leg-paw-slider').oninput = function() {
    g_BackRightPawAngle = parseFloat(this.value);
    renderScene();
  };

  document.getElementById('cam-angle-x').oninput = function() {
    g_CamAngleX = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('cam-angle-y').oninput = function() {
    g_CamAngleY = parseFloat(this.value);
    renderScene();
  };
  document.getElementById('cam-angle-z').oninput = function() {
    g_CamAngleZ = parseFloat(this.value);
    renderScene();
  };

  // Buttons
  document.getElementById('toggle-animation').onclick = function() {
    g_AnimationOn = !g_AnimationOn; 
  };
  document.getElementById('toggle-shift').onclick = function() {
    g_PokeAnimation = !g_PokeAnimation;
  };

  // Mouse Events 
  const canvas = document.getElementById('webgl');
  canvas.onmousedown = function(ev) {
    g_isDragging = true;
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;

    if (ev.shiftKey) {
      g_PokeAnimation = !g_PokeAnimation;
    }
  };
  canvas.onmouseup = function(ev) {
    g_isDragging = false;
  };
  canvas.onmousemove = function(ev) {
    if (g_isDragging) {
      const dx = ev.clientX - g_lastX;
      const dy = ev.clientY - g_lastY;
      g_CamAngleX += dy * 0.5; // pitch
      g_CamAngleY += dx * 0.5; // yaw
      g_lastX = ev.clientX;
      g_lastY = ev.clientY;
      renderScene();
    }
  };
}


//========== ANIMATION LOOP ==========//
function tick() {
  // Update global time
  g_seconds = performance.now()/1000.0 - g_startTime;

  // If animation is on, update angles
  if (g_AnimationOn) {
    updateAnimationAngles();
  }

  // Render
  renderScene();

  // Next frame
  requestAnimationFrame(tick);
}


//========== UPDATE ANIMATION ANGLES ==========//
function updateAnimationAngles() {
  g_TailAngle = 30 * Math.sin(4 * g_seconds);
  g_BodyBob   = 0.05 * Math.sin(2 * g_seconds);
  g_EarWiggleAngle = 10 * Math.sin(5 * g_seconds);

  const speed = 3 * g_seconds;
  const walkCycle = 20 * Math.sin(speed);
  const kneeCycle = 15 * Math.sin(speed + Math.PI / 2);

  // head
  g_HeadAngleX =  20 * Math.sin(2 * g_seconds); 
  // g_HeadAngleY =  20 * Math.sin(2 * g_seconds);
  // g_HeadAngleZ =  20 * Math.sin(2 * g_seconds);

  // front left
  g_FrontLeftLegUpper = walkCycle;
  g_FrontLeftLegLower = kneeCycle;

  // front right
  g_FrontRightLegUpper = -walkCycle;
  g_FrontRightLegLower = -kneeCycle;

  // back left
  g_BackLeftLegUpper  = -walkCycle;
  g_BackLeftLegLower  = kneeCycle;

  // back right
  g_BackRightLegUpper = walkCycle;
  g_BackRightLegLower = -kneeCycle;

  g_WhiskerSway = 0.05 * Math.sin(6 * g_seconds);

  //  If poke mode is on => do a jump + head shake
  if (g_PokeAnimation) {
    // jump
    g_BodyBob += 0.1 * Math.abs(Math.sin(5 * g_seconds));
    // head shake
    g_HeadAngleY = 20 * Math.sin(10 * g_seconds);
  }
}


//========== RENDER SCENE ==========//
function renderScene() {
  const start_time = performance.now();

  // Build global rotation from camera angles
  let globalRotMat = new Matrix4();
  globalRotMat.rotate(g_CamAngleY, 0, 1, 0);   
  globalRotMat.rotate(-g_CamAngleX, 1, 0, 0);  
  globalRotMat.rotate(g_CamAngleZ, 0, 0, 1);   

  // Pass the global rotation matrix to the shader
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

  gl.clearColor(1.0, 0.8, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //================= BODY =================//
  let body = new Cube();
  body.color = [1.0, 0.6, 0.0, 1.0];
  //body.matrix.translate(0, -0.15 + g_BodyBob, 0); 
  body.matrix.translate(0, 0.01 + g_BodyBob, 0); 
  body.matrix.scale(0.5, 0.3, 0.8);
  body.render();
  let bodyMatrix = new Matrix4(body.matrix);

  //================= NECK =================//
  let neck = new Cylinder();
  neck.color = [1.0, 0.6, 0.0, 1.0]; 
  neck.matrix.translate(0.0, 0.2, -0.3); 
  neck.matrix.rotate(g_HeadAngleX, 1, 0, 0);
  neck.matrix.rotate(g_HeadAngleY, 0, 1, 0);
  neck.matrix.rotate(g_HeadAngleZ, 0, 0, 1);
  let neckMat = new Matrix4(neck.matrix);
  neck.matrix.scale(0.1, 0.2, 0.1);
  neck.matrix.translate(0, 0.05, -1 );
  neck.render();

  //================= HEAD =================//
  let head = new Cylinder();
  head.color = [1.0, 0.6, 0.0, 1.0];
  head.matrix = neckMat;
  head.matrix.translate(-0.125, 0.45, -0.35);
  head.matrix.scale(0.3, 0.3, 0.35);
  head.matrix.translate(0.5, -0.9, 0.5);
  head.render();

  let headMat = new Matrix4(head.matrix);

  //================= EARS =================//
  let earL = new Pyramid();
  earL.color = [1.0, 0.6, 0.0, 1.0]; 
  earL.matrix = new Matrix4(headMat);
  earL.matrix.translate(-0.25, 0.45, 0.2);
  earL.matrix.rotate(15, 0, 0, 1);
  earL.matrix.scale(0.19, 0.40, 0.12);
  earL.render();

  let earR = new Pyramid();
  earR.color = [1.0, 0.6, 0.0, 1.0];
  earR.matrix = new Matrix4(headMat);
  earR.matrix.translate(0.25, 0.45, 0.2);
  earR.matrix.rotate(-15, 0, 0, 1);
  earR.matrix.scale(0.19, 0.40, 0.12);
  earR.render();

  //================= EYES  =================//
  let eyeL = new Cube();
  eyeL.color = [0.0, 0.0, 1.0, 1.0];
  eyeL.matrix = new Matrix4(headMat);
  eyeL.matrix.translate(0.3, 0.18, -0.4);
  eyeL.matrix.scale(0.09, 0.09, 0.09);
  eyeL.render();

  let eyeR = new Cube();
  eyeR.color = [0.0, 0.0, 1.0, 1.0];
  eyeR.matrix = new Matrix4(headMat);
  eyeR.matrix.translate(-0.3, 0.18, -0.4);
  eyeR.matrix.scale(0.09, 0.09, 0.09);
  eyeR.render();

  //================= SNOUT =================//
  let snout = new Cube();
  snout.color = [.0, 0.0, 0.0, 1.0]; 
  snout.matrix = new Matrix4(headMat);
  snout.matrix.translate(0.0, 0.05, -0.55);
  snout.matrix.scale(0.06, 0.06, 0.1);
  snout.render();

  // RIGHT SIDE WHISKERS
  let whiskerR1 = new Cube();
  whiskerR1.color = [0, 0, 0, 1];
  whiskerR1.matrix = new Matrix4(headMat);
  whiskerR1.matrix.translate(0.01, 0.09, -0.6);
  whiskerR1.matrix.rotate(-6, 0, 0, 1);
  whiskerR1.matrix.scale(0.2, 0.008, 0.008);
  whiskerR1.matrix.translate(-0.5, -0.5, -0.5);
  whiskerR1.render();

  let whiskerR2 = new Cube();
  whiskerR2.color = [0, 0, 0, 1];
  whiskerR2.matrix = new Matrix4(headMat);
  whiskerR2.matrix.translate(0.01, 0.042, -0.6);
  whiskerR2.matrix.rotate(6, 0, 0, 1);
  whiskerR2.matrix.scale(0.2, 0.008, 0.008);
  whiskerR2.matrix.translate(-0.5, -0.5, -0.5);
  whiskerR2.render();

  // LEFT SIDE WHISKERS
  let whiskerL1 = new Cube();
  whiskerL1.color = [0, 0, 0, 1];
  whiskerL1.matrix = new Matrix4(headMat);
  whiskerL1.matrix.translate(-0.01, 0.09, -0.6);
  whiskerL1.matrix.rotate(6, 0, 0, 1);
  whiskerL1.matrix.scale(0.2, 0.008, 0.008);
  whiskerL1.matrix.translate(0.5, -0.5, -0.5);
  whiskerL1.render();

  let whiskerL2 = new Cube();
  whiskerL2.color = [0, 0, 0, 1];
  whiskerL2.matrix = new Matrix4(headMat);
  whiskerL2.matrix.translate(-0.01, 0.042, -0.6);
  whiskerL2.matrix.rotate(-6, 0, 0, 1);
  whiskerL2.matrix.scale(0.2, 0.008, 0.008);
  whiskerL2.matrix.translate(0.5, -0.5, -0.5);
  whiskerL2.render();

  //================= TAIL ================//
  let tail = new Cube();
  tail.color = [1.0, 0.6, 0.0, 1.0]; 
  tail.matrix.translate(0.0, 0.16, 0.38);
  tail.matrix.rotate(57, 1, 0, 0);
  tail.matrix.rotate(g_TailAngle, 0, 1, 0);
  tail.matrix.scale(0.06, 0.05, 0.5);
  tail.matrix.translate(-0.7, -0.4, -0.5);
  tail.render();

  //================= TAIL PUFF =================//
  let tailPuffMat = new Matrix4(tail.matrix);
  let tailPuff = new Cylinder();
  tailPuff.color = [0.9, 0.4, 0.0, 1.0];
  tailPuff.matrix = tailPuffMat;
  tailPuff.matrix.translate(-0.07, 0.007, -0.5);
  tailPuff.matrix.rotate(90, 1, 0, 0);
  tailPuff.matrix.scale(1.5, 0.09, 1.8);
  tailPuff.render();


  //================= LEGS  =================//
  let fl1 = new Cylinder();
  fl1.color = [1.0, 0.6, 0.0, 1.0];
  fl1.matrix.translate(0.24, 0., -0.35);
  fl1.matrix.rotate(g_FrontLeftLegUpper, 1, 0, 0);
  fl1.matrix.scale(0.08, 0.3, 0.08);
  fl1.matrix.translate(-0.5, -0.65, -0.5);
  fl1.render();

  let fl2 = new Cylinder();
  fl2.color = [1.0, 0.6, 0.0, 1.0];
  fl2.matrix.translate(0.24, 0.0, -0.35);
  fl2.matrix.rotate(g_FrontLeftLegUpper, 1, 0, 0);
  fl2.matrix.translate(0, -0.3, 0);
  fl2.matrix.rotate(g_FrontLeftLegLower, 1, 0, 0);
  fl2.matrix.scale(0.08, 0.16, 0.08);
  fl2.matrix.translate(-0.5, -0.65, -0.5);
  fl2.render();

  let fl2MatrixCopy = new Matrix4(fl2.matrix);

  let flPaw = new Cube(); 
  flPaw.color = [0.9, 0.4, 0.0, 1.0];
  flPaw.matrix = fl2MatrixCopy;
  flPaw.matrix.translate(-0.002, -0.5, -0.24);
  flPaw.matrix.rotate(g_FrontLeftPawAngle, 1, 0, 0);
  flPaw.matrix.scale(1, 0.3, 1);
  flPaw.render();

  //
  // FRONT RIGHT LEG (3 segments: fr1, fr2, frPaw)
  //
  let fr1 = new Cylinder();
  fr1.color = [1.0, 0.6, 0.0, 1.0];
  fr1.matrix.translate(-0.16, 0.0, -0.35);
  fr1.matrix.rotate(g_FrontRightLegUpper, 1, 0, 0);
  fr1.matrix.scale(0.08, 0.3, 0.08);
  fr1.matrix.translate(-0.5, -0.65, -0.5);
  fr1.render();

  let fr2 = new Cylinder();
  fr2.color = [1.0, 0.6, 0.0, 1.0];
  fr2.matrix.translate(-0.16, 0.0, -0.35);
  fr2.matrix.rotate(g_FrontRightLegUpper, 1, 0, 0);
  fr2.matrix.translate(0, -0.3, 0);
  fr2.matrix.rotate(g_FrontRightLegLower, 1, 0, 0);
  fr2.matrix.scale(0.08, 0.16, 0.08);
  fr2.matrix.translate(-0.5, -0.65, -0.5);
  fr2.render();

  let fr2MatrixCopy = new Matrix4(fr2.matrix);

  let frPaw = new Cube();
  frPaw.color = [0.9, 0.4, 0.0, 1.0];
  frPaw.matrix = fr2MatrixCopy;
  frPaw.matrix.translate(-0.002, -0.5, -0.24);
  frPaw.matrix.rotate(g_FrontRightPawAngle, 1, 0, 0);
  frPaw.matrix.scale(1, 0.3, 1);
  frPaw.render();


  //
  // BACK LEFT LEG 
  let bl1 = new Cylinder();
  bl1.color = [1.0, 0.6, 0.0, 1.0];
  bl1.matrix.translate(0.24, 0.0, 0.35);
  bl1.matrix.rotate(g_BackLeftLegUpper, 1, 0, 0);
  bl1.matrix.scale(0.08, 0.3, 0.08);
  bl1.matrix.translate(-0.5, -0.55, -0.5);
  bl1.render();

  let bl2 = new Cylinder();
  bl2.color = [1.0, 0.6, 0.0, 1.0];
  bl2.matrix.translate(0.24, -0.01, 0.35);
  bl2.matrix.rotate(g_BackLeftLegUpper, 1, 0, 0);
  bl2.matrix.translate(0, -0.3, 0);
  bl2.matrix.rotate(g_BackLeftLegLower, 1, 0, 0);
  bl2.matrix.scale(0.08, 0.17, 0.08);
  bl2.matrix.translate(-0.5, -0.55, -0.5);
  bl2.render();

  let bl2MatrixCopy = new Matrix4(bl2.matrix);

  let blPaw = new Cube();
  blPaw.color = [0.9, 0.4, 0.0, 1.0];
  blPaw.matrix = bl2MatrixCopy;
  blPaw.matrix.translate(-0.002, -0.5, -0.23);
  blPaw.matrix.rotate(g_BackLeftPawAngle, 1, 0, 0);
  blPaw.matrix.scale(1, 0.3, 1);
  blPaw.render();

  //
  // BACK RIGHT LEG (3 segments: br1, br2, brPaw)
  //
  let br1 = new Cylinder();
  br1.color = [1.0, 0.6, 0.0, 1.0];
  br1.matrix.translate(-0.16, 0.0, 0.35);
  br1.matrix.rotate(g_BackRightLegUpper, 1, 0, 0);
  br1.matrix.scale(0.08, 0.3, 0.08);
  br1.matrix.translate(-0.5, -0.55, -0.5);
  br1.render();

  let br2 = new Cylinder();
  br2.color = [1.0, 0.6, 0.0, 1.0];
  br2.matrix.translate(-0.16, -0.01, 0.35);
  br2.matrix.rotate(g_BackRightLegUpper, 1, 0, 0);
  br2.matrix.translate(0, -0.3, 0);
  br2.matrix.rotate(g_BackRightLegLower, 1, 0, 0);
  br2.matrix.scale(0.08, 0.17, 0.08);
  br2.matrix.translate(-0.5, -0.55, -0.5);
  br2.render();

  let br2MatrixCopy = new Matrix4(br2.matrix);

  let brPaw = new Cube();
  brPaw.color = [0.9, 0.4, 0.0, 1.0];
  brPaw.matrix = br2MatrixCopy;
  brPaw.matrix.translate(-0.002, -0.5, -0.23);
  brPaw.matrix.rotate(g_BackRightPawAngle, 1, 0, 0);
  brPaw.matrix.scale(1, 0.3, 1);
  brPaw.render();


  //================= PERFORMANCE / FPS =================//
  const duration = performance.now() - start_time;
  const fps = (duration > 0) ? (1000.0 / duration).toFixed(1) : "???";
  document.getElementById('performance-display').innerHTML =
    `Frame time: ${duration.toFixed(1)} ms | FPS: ${fps}`;
}
