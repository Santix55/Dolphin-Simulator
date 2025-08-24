class EvilDolphin {

    SPEED = 0.1; // units/frame
    ROTATION_SPEED = 0.01
    HITBOX_RADIUS = 5

    constructor(scene) {

        this.mainMesh = new THREE.Mesh();

        model3DLoader.load('models/dolphin.gltf', (glb) => {
            const dolphin = glb.scene;

            dolphin.traverse((node) => {
                if (node.isMesh) {
                    const originalMaterial = node.material;

                    const newMaterial = new THREE.MeshStandardMaterial({
                        color: 0xFF0000,
                        map: originalMaterial.map,
                        normalMap: originalMaterial.normalMap,
                        wireframe: true
                    });

                    node.material = newMaterial;
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            const box = new THREE.Box3().setFromObject(dolphin);
            const size = new THREE.Vector3();
            box.getSize(size);

            const SCALE_FACTOR = 1/50
            dolphin.scale.set(SCALE_FACTOR, SCALE_FACTOR,  SCALE_FACTOR)

            dolphin.rotation.x = -Math.PI/2
            dolphin.position.y -= 2 

            this.model = dolphin  
            this.mainMesh.add(dolphin)

        });

        // LUZ NOCTURNA
        const object = new THREE.Object3D();
        object.position.set(0,0,1)
        this.mainMesh.add(object)

        this.light = new THREE.SpotLight(0xFF0000, 1);
        this.light.shadow.needsUpdate = true;
        this.light.shadow.mapSize.width = 1024;  // Ajusta la resolución
        this.light.shadow.mapSize.height = 1024; // Ajusta la resolución
        this.light.shadow.bias = -0.0001;        // Ajusta el bias para evitar manchas
        this.light.shadow.radius = 4;            // Suaviza las sombras
        this.light.target = object
        this.light.castShadow = true;

        this.light.distance = 50; // Distancia máxima en la que la luz tiene efecto
        this.light.decay = 10; // Cuánto se atenúa la luz con la distancia
        this.light.position.set(0,0,0)
        this.light.angle = Math.PI/5
        this.light.intensity = 10
        this.light.penumbra = 0.9
        this.mainMesh.add(this.light)

        scene.add(this.mainMesh);

        this.mainMesh.position.y = 40;

        
    }

    update (playerPosition) {
        // Obtener la posición del delfín malvado
        const dolphinWorldPosition = new THREE.Vector3();
        this.mainMesh.getWorldPosition(dolphinWorldPosition);

        // Calcular la dirección al jugaro
        const directionToPlayer = new THREE.Vector3().subVectors(playerPosition, dolphinWorldPosition).normalize();

        // Crear un cuaternion como objetivo de la rotación
        const targetQuaternion = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 0, 1); // mirando al eje Z
        targetQuaternion.setFromUnitVectors(up, directionToPlayer);

        // Interoilar suvatementa la rotación
        const currentQuaternion = this.mainMesh.quaternion;
        currentQuaternion.slerp(targetQuaternion, this.ROTATION_SPEED);

        // Move forward in local Z direction
        this.mainMesh.translateZ(this.SPEED);


        // COLISIONES //
        const dx = playerPosition.x - this.mainMesh.position.x
        const dy = playerPosition.y - this.mainMesh.position.y
        const dz = playerPosition.z - this.mainMesh.position.z
        return Math.sqrt(dx*dx + dy*dy + dz*dz) < this.HITBOX_RADIUS
    }

    spawn () {
        this.mainMesh.position.y = 40;
        this.mainMesh.visible = true;
    }

    despawn() {
        this.mainMesh.position.y = 40;
        this.mainMesh.visible = false;
    }

    
}