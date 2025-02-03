// Cylinder.js
class Cylinder {
    constructor() {
      this.type = 'cylinder';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.segments = 12;  // how many slices around the circle
      this.vertexData = [];
      this.buffer = null;
  
      this.initVertices();
    }
  
    initVertices() {
      let r = 0.5;
      let yTop = 0.5;
      let yBot = -0.5;
  
      let thetaStep = (2.0 * Math.PI) / this.segments;
  
      for (let i = 0; i < this.segments; i++) {
        let theta1 = i * thetaStep;
        let theta2 = (i+1 === this.segments) ? 0 : (i+1)*thetaStep;
  
        let cx = 0, cy = yTop, cz = 0;
        let x1 = r * Math.cos(theta1);
        let z1 = r * Math.sin(theta1);
        let x2 = r * Math.cos(theta2);
        let z2 = r * Math.sin(theta2);
  
       
        this.vertexData.push(cx,cy,cz,  x1,yTop,z1,  x2,yTop,z2);
      }
  
      for (let i = 0; i < this.segments; i++) {
        let theta1 = i * thetaStep;
        let theta2 = (i+1 === this.segments) ? 0 : (i+1)*thetaStep;
  
        let cx = 0, cy = yBot, cz = 0;
        let x1 = r * Math.cos(theta1);
        let z1 = r * Math.sin(theta1);
        let x2 = r * Math.cos(theta2);
        let z2 = r * Math.sin(theta2);
  
        this.vertexData.push(cx,cy,cz,  x2,yBot,z2,  x1,yBot,z1);
      }
  
      for (let i = 0; i < this.segments; i++) {
        let theta1 = i * thetaStep;
        let theta2 = (i+1 === this.segments) ? 0 : (i+1)*thetaStep;
  
        let x1Top = r * Math.cos(theta1);
        let z1Top = r * Math.sin(theta1);
        let x2Top = r * Math.cos(theta2);
        let z2Top = r * Math.sin(theta2);
  
        let x1Bot = x1Top, z1Bot = z1Top;  // same as x1Top,z1Top but y= -0.5
        let x2Bot = x2Top, z2Bot = z2Top;  
  
        this.vertexData.push(
          x1Top, yTop, z1Top,
          x2Top, yTop, z2Top,
          x1Bot, yBot, z1Bot
        );
        this.vertexData.push(
          x2Top, yTop, z2Top,
          x2Bot, yBot, z2Bot,
          x1Bot, yBot, z1Bot
        );
      }
    }
  
    render() {
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
  
      if (!this.buffer) {
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
          console.log("Failed to create buffer for cylinder");
          return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.STATIC_DRAW);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      }
  
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
  
      let n = this.vertexData.length / 3;
      gl.drawArrays(gl.TRIANGLES, 0, n);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  }
  