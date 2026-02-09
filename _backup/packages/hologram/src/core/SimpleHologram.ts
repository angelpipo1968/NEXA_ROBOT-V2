import * as THREE from 'three';

export class SimpleHologram {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private hologramMesh: THREE.Mesh | null = null;

    constructor(canvas: HTMLCanvasElement) {
        // 1. Escena básica
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        // 2. Cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // 3. Renderizador
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        // 4. Crear holograma simple (esfera)
        this.createSimpleHologram();

        // 5. Luces básicas
        this.setupBasicLighting();

        // 6. Iniciar animación
        this.animate();
    }

    private createSimpleHologram(): void {
        // Geometría simple
        const geometry = new THREE.SphereGeometry(1, 32, 32);

        // Material holográfico simple
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.7,
            emissive: 0x004444,
            shininess: 100,
            side: THREE.DoubleSide
        });

        this.hologramMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.hologramMesh);

        // Añadir wireframe para efecto holográfico
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        // @ts-ignore - LineBasicMaterial works fine here
        line.material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });
        this.hologramMesh.add(line);
    }

    private setupBasicLighting(): void {
        // Luz principal
        const mainLight = new THREE.PointLight(0x00ffff, 1, 100);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);

        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x004444, 0.3);
        this.scene.add(ambientLight);
    }

    private animate = (): void => {
        requestAnimationFrame(this.animate);

        // Rotación simple
        if (this.hologramMesh) {
            this.hologramMesh.rotation.x += 0.01;
            this.hologramMesh.rotation.y += 0.01;
        }

        this.renderer.render(this.scene, this.camera);
    }

    // Método público para verificar funcionamiento
    public isWorking(): boolean {
        return !!this.renderer && this.renderer.getContext() !== null;
    }

    public getStatus(): string {
        const gl = this.renderer.getContext();
        if (!gl) return "❌ WebGL no disponible";

        const vendor = gl.getParameter(gl.VENDOR);
        const renderer = gl.getParameter(gl.RENDERER);

        return `✅ WebGL funcionando\nVendor: ${vendor}\nRenderer: ${renderer}`;
    }

    public setEmotion(emotion: string) {
        if (!this.hologramMesh) return;

        const material = (this.hologramMesh as any).material;
        if (!material) return;

        switch (emotion) {
            case 'happy':
                this.setColor(0x00ff00);
                break;
            case 'sad':
                this.setColor(0x0000ff);
                break;
            case 'angry':
                this.setColor(0xff0000);
                break;
            case 'neutral':
            default:
                this.setColor(0x00ffff);
                break;
        }
    }

    public pulse(intensity: number) {
        if (!this.hologramMesh) return;
        const scale = 1 + (intensity * 0.5);
        this.hologramMesh.scale.set(scale, scale, scale);
    }

    public setShape(shape: 'sphere' | 'cube' | 'torus' | 'pyramid') {
        if (!this.hologramMesh) return;

        // Dispose old geometry
        this.hologramMesh.geometry.dispose();

        // Create new geometry
        let geometry;
        switch (shape) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
                break;
            case 'pyramid':
                geometry = new THREE.ConeGeometry(1, 1.5, 4);
                break;
            case 'sphere':
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
        }

        this.hologramMesh.geometry = geometry;

        // Update wireframe child
        const wireframeChild = this.hologramMesh.children.find(child => child.type === 'LineSegments') as THREE.LineSegments;
        if (wireframeChild) {
            wireframeChild.geometry.dispose();
            wireframeChild.geometry = new THREE.WireframeGeometry(geometry);
        }
    }

    public setColor(color: number | string) {
        if (!this.hologramMesh) return;

        const material = (this.hologramMesh as any).material;
        if (material) {
            material.color.set(color);
            // Derive emissive color (darker version)
            const emissive = new THREE.Color(color);
            emissive.multiplyScalar(0.3);
            material.emissive.copy(emissive);
        }

        // Update wireframe color too
        const wireframeChild = this.hologramMesh.children.find(child => child.type === 'LineSegments') as THREE.LineSegments;
        if (wireframeChild) {
            (wireframeChild.material as THREE.LineBasicMaterial).color.set(color);
        }
    }
}
