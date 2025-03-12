const canvas = document.getElementById('glCanvas'); 
const gl = canvas.getContext('webgl2'); 

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

canvas.width = 500;
canvas.height = 500;

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1.0);

// Start rendering
render();

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    const colors = [
        [0.0, 0.0, 1.0, 1.0], // Blue
        [1.0, 1.0, 0.0, 1.0],  // Yellow
        [1.0, 0.0, 0.0, 1.0], // Red
        [0.0, 1.0, 0.0, 1.0], // Green
    ];

    const w = canvas.width / 2;
    const h = canvas.height / 2;

    for (let i = 0; i < 4 ; i++ ) {
        const x = ( i % 2 ) * w
        const y = Math.floor(i/2)*h;

        gl.scissor(x, y, w, h);
        gl.enable(gl.SCISSOR_TEST);
        gl.clearColor(...colors[i]);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.disable(gl.SCISSOR_TEST);


}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, size, size);
    render();
});

