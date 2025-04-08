import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let axes;
let finalTransform;
let rotationAngle = 0;
let isAnimating = true;
let lastTime = 0;
let sunTransform;
let earthTransform;
let moonTransform;
let sunRotationAngle = 0;
let earthRevolutionAngle = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;

        // animate
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);

    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function setupBuffers() {
    const vertices = new Float32Array([
        -0.5, -0.5,
        0.5, -0.5,
        0.5, 0.5,
        -0.5, 0.5
    ]);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function getTransformMatrices() {
    const T = mat4.create();
    const R = mat4.create();
    const S = mat4.create();

    mat4.translate(T, T, [0.5, 0.5, 0]);  // translation by (0.5, 0.5)
    mat4.rotate(R, R, rotationAngle, [0, 0, 1]); // rotation about z-axis
    mat4.scale(S, S, [0.3, 0.3, 1]); // scale by (0.3, 0.3)

    return { T, R, S };
}

function applyTransform(type) {
    finalTransform = mat4.create();
    const { T, R, S } = getTransformMatrices();

    const transformOrder = {
        'TRS': [T, R, S],
        'TSR': [T, S, R],
        'RTS': [R, T, S],
        'RST': [R, S, T],
        'STR': [S, T, R],
        'SRT': [S, R, T]
    };

    /*
      type은 'TRS', 'TSR', 'RTS', 'RST', 'STR', 'SRT' 중 하나
      array.forEach(...) : 각 type의 element T or R or S 에 대해 반복
    */
    if (transformOrder[type]) {
        transformOrder[type].forEach(matrix => {
            mat4.multiply(finalTransform, matrix, finalTransform);
        });
    }
}

function animate(currentTime) {

    if (!lastTime) lastTime = currentTime; // if lastTime == 0
    // deltaTime: 이전 frame에서부터의 elapsed time (in seconds)
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (isAnimating) {
        // 2초당 1회전, 즉, 1초당 180도 회전
        rotationAngle += Math.PI * deltaTime;               // 180 degree/sec
        sunRotationAngle += Math.PI / 4 * deltaTime;        // 45 degree/sec
        earthRevolutionAngle += Math.PI / 6 * deltaTime;    // 30 degree/sec
        
        // applyTransform(currentTransformType);
    }
    render();

    requestAnimationFrame(animate);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // draw axes
    axes.draw(mat4.create(), mat4.create());

    // draw cube
    shader.use();
    shader.setMat4("u_model", finalTransform);
    gl.bindVertexArray(vao);


    // set sun transform
    setSunTransform();
    setEarthTransform();
    setMoonTransform();

    // draw Sun
    shader.setMat4("u_model", sunTransform);
    shader.setVec4("uColor", [1.0, 0.0, 0.0, 1.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // draw Earth
    shader.setMat4("u_model", earthTransform);
    shader.setVec4("uColor", [0.0, 1.0, 1.0, 1.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // draw Moon
    shader.setMat4("u_model", moonTransform);
    shader.setVec4("uColor", [1.0, 1.0, 0.0, 1.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        finalTransform = mat4.create();

        await initShader();

        setupBuffers();
        axes = new Axes(gl, 0.8);

        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}

function setSunTransform() {
    sunTransform = mat4.create();

    // size scaler
    const S = mat4.create();
    const R = mat4.create();
    mat4.scale(S, S, [0.2, 0.2, 1]);
    mat4.rotate(R, R, sunRotationAngle, [0, 0, 1]);

    // composite transform
    mat4.multiply(sunTransform, R, sunTransform);
    mat4.multiply(sunTransform, S, sunTransform);
}

function setEarthTransform() {
    earthTransform = mat4.create();

    // Calculate coordinates for 0.7 distance : 위치 반영 (0.7)
    const t = 0.7;
    const tx = t * Math.cos(earthRevolutionAngle);      // 공전 반영 (30 d/s)
    const ty = t * Math.sin(earthRevolutionAngle);      // 공전 반영 (30 d/s)

    // size scaler
    const S = mat4.create();
    const R = mat4.create(); 
    const T = mat4.create();

    mat4.rotate(R, R, rotationAngle, [0, 0, 1]);   // 자전 반영 (180 d/s)
    mat4.scale(S, S, [0.1, 0.1, 1]);                    // 크기 반영 (0.1)
    mat4.translate(T, T, [tx, ty, 0]);

    // Composite transform (RST with modified translation)
    mat4.multiply(earthTransform, R, earthTransform);
    mat4.multiply(earthTransform, S, earthTransform);
    mat4.multiply(earthTransform, T, earthTransform);

}

function setMoonTransform(){
    moonTransform = mat4.create();

    mat4.rotate(moonTransform, moonTransform, earthRevolutionAngle, [0, 0, 1]); //지구와 같은 속도로 태양 공전
    mat4.translate(moonTransform, moonTransform, [0.7, 0.0, 0]); // 지구 중심으로 이동 == 지구의 공전반경

    //지구를 공전
    mat4.rotate(moonTransform, moonTransform, 2*rotationAngle, [0, 0, 1]); // 지구 공전 반영
    mat4.translate(moonTransform, moonTransform, [0.2, 0.0, 0]); //지구 공전 반경만큼 이동

    mat4.rotate(moonTransform, moonTransform, rotationAngle, [0, 0, 1]); // 자구 자전 속도와 같게 한다.
    mat4.scale(moonTransform, moonTransform, [0.05, 0.05, 1]); // 크기 반영 (0.05)

}