// Cube.js
class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];     // base color
        this.matrix = new Matrix4();          // each cube can have its own transform
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // --- FRONT  ---
        gl.uniform4f(u_FragColor,
                     this.color[0] * 0.9,
                     this.color[1] * 0.9,
                     this.color[2] * 0.9,
                     this.color[3]);
        drawTriangle3D([
            -0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5, -0.5, -0.5
        ]);
        drawTriangle3D([
            -0.5,  0.5, -0.5,
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5
        ]);

        // --- RIGHT  ---
        gl.uniform4f(u_FragColor,
                     this.color[0] * 0.75,
                     this.color[1] * 0.75,
                     this.color[2] * 0.75,
                     this.color[3]);
        drawTriangle3D([
             0.5, -0.5, -0.5,
             0.5,  0.5,  0.5,
             0.5, -0.5,  0.5
        ]);
        drawTriangle3D([
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5,  0.5,  0.5
        ]);

        // --- LEFT  ---
        drawTriangle3D([
            -0.5, -0.5, -0.5,
            -0.5,  0.5,  0.5,
            -0.5, -0.5,  0.5
        ]);
        drawTriangle3D([
            -0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5
        ]);

        // --- TOP  ---
        gl.uniform4f(u_FragColor,
                     this.color[0] * 1.0,
                     this.color[1] * 1.0,
                     this.color[2] * 1.0,
                     this.color[3]);
        drawTriangle3D([
            -0.5,  0.5, -0.5,
             0.5,  0.5,  0.5,
             0.5,  0.5, -0.5
        ]);
        drawTriangle3D([
            -0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5,
             0.5,  0.5,  0.5
        ]);

        // --- BOTTOM  ---
        gl.uniform4f(u_FragColor,
                     this.color[0] * 0.5,
                     this.color[1] * 0.5,
                     this.color[2] * 0.5,
                     this.color[3]);
        drawTriangle3D([
            -0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,
             0.5, -0.5, -0.5
        ]);
        drawTriangle3D([
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5
        ]);

        // --- BACK  ---
        gl.uniform4f(u_FragColor,
                     this.color[0] * 0.75,
                     this.color[1] * 0.75,
                     this.color[2] * 0.75,
                     this.color[3]);
        drawTriangle3D([
            -0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,
             0.5, -0.5,  0.5
        ]);
        drawTriangle3D([
            -0.5, -0.5,  0.5,
            -0.5,  0.5,  0.5,
             0.5, -0.5,  0.5
        ]);
    }
}

function drawTriangle3D(vertices) {
    const n = 3;
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object for drawTriangle3D');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
