// Pyramid.js
class Pyramid {
    constructor() {
      this.type = 'pyramid';
      this.color = [1.0, 1.0, 1.0, 1.0];  // base color
      this.matrix = new Matrix4();       // local transform
    }

    render() {
      // Pass the matrix
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      // Pass the color
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

      // Two triangles to cover the square base
      drawTriangle3D([
        -0.5, 0.0, -0.5,
         0.5, 0.0, -0.5,
         0.5, 0.0,  0.5
      ]);
      drawTriangle3D([
        -0.5, 0.0, -0.5,
         0.5, 0.0,  0.5,
        -0.5, 0.0,  0.5
      ]);

      // Face 1
      gl.uniform4f(u_FragColor, this.color[0]*0.9, this.color[1]*0.9, this.color[2]*0.9, this.color[3]);
      drawTriangle3D([
        -0.5, 0.0, -0.5,
         0.5, 0.0, -0.5,
         0.0, 1.0,  0.0
      ]);

      // Face 2
      gl.uniform4f(u_FragColor, this.color[0]*0.8, this.color[1]*0.8, this.color[2]*0.8, this.color[3]);
      drawTriangle3D([
         0.5, 0.0, -0.5,
         0.5, 0.0,  0.5,
         0.0, 1.0,  0.0
      ]);

      // Face 3
      gl.uniform4f(u_FragColor, this.color[0]*0.7, this.color[1]*0.7, this.color[2]*0.7, this.color[3]);
      drawTriangle3D([
         0.5, 0.0,  0.5,
        -0.5, 0.0,  0.5,
         0.0, 1.0,  0.0
      ]);

      // Face 4
      gl.uniform4f(u_FragColor, this.color[0]*0.6, this.color[1]*0.6, this.color[2]*0.6, this.color[3]);
      drawTriangle3D([
        -0.5, 0.0,  0.5,
        -0.5, 0.0, -0.5,
         0.0, 1.0,  0.0
      ]);

      // Reset color if needed
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    }
}
