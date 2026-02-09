
import * as THREE from 'three';

export class HologramGenerator {

    async generateCharacter(config: any): Promise<any> {
        // Mock generation for now - typically involves loading GLTF models
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = this.createHolographicMaterial({
            baseColor: config.appearance?.color || 0x00ffff,
            emission: 0.5,
            transparency: 0.3,
            fresnel: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Add particle system mock
        const particleSystem = this.createHologramParticles(mesh);

        return {
            model: mesh,
            particleSystem,
            scanSystem: null
        };
    }

    private createHolographicMaterial(options: any): THREE.Material {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(options.baseColor) },
                emissionStrength: { value: options.emission },
                transparency: { value: options.transparency },
                fresnelPower: { value: options.fresnel },
                scanSpeed: { value: 2.0 },
                noiseScale: { value: 10.0 }
            },
            vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform float emissionStrength;
        uniform float transparency;
        uniform float fresnelPower;
        uniform float scanSpeed;
        uniform float noiseScale;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        // Simple noise function
        float hash(float n) { return fract(sin(n) * 43758.5453); }
        float noise(vec3 x) {
          vec3 p = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          float n = p.x + p.y * 57.0 + 113.0 * p.z;
          return mix(mix(mix(hash(n), hash(n + 1.0), f.x),
                       mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                     mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                       mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
        }
        
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), fresnelPower);
          float scan = sin(vPosition.y * 10.0 + time * scanSpeed) * 0.5 + 0.5;
          float hologramNoise = noise(vPosition * noiseScale + time);
          
          vec3 color = baseColor;
          color *= (0.8 + 0.2 * scan);
          color *= (0.9 + 0.1 * hologramNoise);
          color += fresnel * emissionStrength;
          
          float alpha = transparency + fresnel * 0.3;
          alpha *= (0.7 + 0.3 * scan);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }

    createHologramParticles(model: THREE.Object3D): THREE.Points {
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        // For a simple box, we can just distribute randomly around center
        // In a real scenario, we'd use bounding box of the model

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

            colors[i * 3] = 0.0;
            colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i * 3 + 2] = 1.0;

            sizes[i] = Math.random() * 0.05;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(time + position.x * 10.0) * 0.02;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          if (length(uv) > 0.5) discard;
          gl_FragColor = vec4(vColor, 0.8);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return new THREE.Points(geometry, material);
    }
}
