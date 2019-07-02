const webgl = document.getElementById('webgl');
const gl = webgl.getContext('webgl');
if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
}
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const Coords = {
    pointCoords: [
      // Front face
      [-1.0, -1.0,  1.0],
      [ 1.0, -1.0,  1.0],
      [ 1.0,  1.0,  1.0],
      [-1.0,  1.0,  1.0],
      
      // Back face
      [-1.0, -1.0, -1.0],
      [-1.0,  1.0, -1.0],
      [ 1.0,  1.0, -1.0],
      [ 1.0, -1.0, -1.0],
      
      // Top face
      [-1.0,  1.0, -1.0],
      [-1.0,  1.0,  1.0],
      [ 1.0,  1.0,  1.0],
      [ 1.0,  1.0, -1.0],
      
      // Bottom face
      [-1.0, -1.0, -1.0],
      [ 1.0, -1.0, -1.0],
      [ 1.0, -1.0,  1.0],
      [-1.0, -1.0,  1.0],
      
      // Right face
      [ 1.0, -1.0, -1.0],
      [ 1.0,  1.0, -1.0],
      [ 1.0,  1.0,  1.0],
      [ 1.0, -1.0,  1.0],
      
      // Left face
      [-1.0, -1.0, -1.0],
      [-1.0, -1.0,  1.0],
      [-1.0,  1.0,  1.0],
      [-1.0,  1.0, -1.0]
    ],
    colors: [
      [1.0,  1.0,  1.0,  1.0],[1.0,  1.0,  1.0,  1.0],[1.0,  1.0,  1.0,  1.0],[1.0,  1.0,  1.0,  1.0],    // Front face: white
      [1.0,  0.0,  0.0,  1.0],[1.0,  0.0,  0.0,  1.0],[1.0,  0.0,  0.0,  1.0],[1.0,  0.0,  0.0,  1.0],    // Back face: red
      [0.0,  1.0,  0.0,  1.0],[0.0,  1.0,  0.0,  1.0],[0.0,  1.0,  0.0,  1.0],[0.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  0.0,  1.0,  1.0],[0.0,  0.0,  1.0,  1.0],[0.0,  0.0,  1.0,  1.0],[0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
      [1.0,  1.0,  0.0,  1.0],[1.0,  1.0,  0.0,  1.0],[1.0,  1.0,  0.0,  1.0],[1.0,  1.0,  0.0,  1.0],    // Right face: yellow
      [1.0,  0.0,  1.0,  1.0],[1.0,  0.0,  1.0,  1.0],[1.0,  0.0,  1.0,  1.0],[1.0,  0.0,  1.0,  1.0]     // Left face: purple
    ]
}

const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23    // left
];


const vShaderSource = `
		attribute vec4 aPosition;
        attribute vec4 aColor;
        varying vec4 uFragColor;
        uniform mat4 uMvpMatrix;

		void main(){
		    gl_Position = uMvpMatrix * aPosition;
            uFragColor = aColor;
		}
	`;
const fShaderSouce = `
        precision mediump float;
        varying vec4 uFragColor;

		void main(){
			gl_FragColor = uFragColor;
		}
	`;

/**
 * 创建指定类型的着色器，上传source源码并编译
 */
function loadShader(gl, type, source) {
    const shader = gl.createShader(type); // 创建一个新的着色器
    gl.shaderSource(shader, source); // 将源代码发送到着色器
    gl.compileShader(shader); // 编译源代码

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
/**
 * 初始化着色器程序，让WebGL知道如何绘制我们的数据
 */
function initShaderProgram(gl, vShaderSource, fShaderSouce) {
    const vShader = loadShader(gl, gl.VERTEX_SHADER, vShaderSource);
    const fShader = loadShader(gl, gl.FRAGMENT_SHADER, fShaderSouce);

    const shaderProgram = gl.createProgram(); // 创建着色器程序
    gl.attachShader(shaderProgram, vShader);
    gl.attachShader(shaderProgram, fShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}
/**
 * 创建纹理对象
 */

function initBuffers(gl, coords, indices, mvpMatrix, n) {
    let vertices = new Float32Array(coords);
    let CubeIndices = new Unit8Array(indices);
    const FSIZE = vertices.BYTES_PER_ELEMENT;

    let verticesBuffer = gl.createBuffer(); // 创建缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer); // 将缓冲区对象绑定目标
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);   // 向缓冲区填充数据
    let cubeVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, CubeIndices, gl.STATIC_DRAW);    //注意第一个参数

    gl.vertexAttribPointer(programInfo.attribLocations.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.aPosition);
    gl.vertexAttribPointer(programInfo.attribLocations.aColor, 3, gl.FLOAT, false, 0, 3*n*FSIZE);
    gl.enableVertexAttribArray(programInfo.attribLocations.aTexCoord);
    gl.uniformMatrix4fv( programInfo.uniformLocations.uMvpMatrix, false, uMvpMatrix);
}
/**
 * 创建场景
 */
function getMvpMatrix(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix,     // destination matrix
                     modelViewMatrix,     // matrix to translate
                     [-0.0, 0.0, -6.0]);  // amount to translate

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

    const mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, modelViewMatrix, projectionMatrix);

    return mvpMatrix;
}

const shaderProgram = initShaderProgram(gl, vShaderSource, fShaderSouce);
gl.useProgram(shaderProgram);
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        aPosition: gl.getAttribLocation(shaderProgram, 'aPosition'),
        aColor: gl.getAttribLocation(shaderProgram, 'aColor')
    },
    uniformLocations: {
        uFragColor: gl.getUniformLocation(shaderProgram, 'uFragColor'),
        uMvpMatrix: gl.getUniformLocation(shaderProgram, 'uMvpMatrix')
    }
};
const flatCoords = Object.values(Coords).flat(Infinity);
const N = Object.values(Coords).flat(1).length/Object.keys(Coords).length;

initBuffers(gl, flatCoords, indices, getMvpMatrix(gl), N);
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);