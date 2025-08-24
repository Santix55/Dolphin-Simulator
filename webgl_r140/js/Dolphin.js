class Dolphin {
    score = 0;

    prevState = 0;

    UNDERWATER_STATE = 0;
    ABOVEWATER_STATE = 1;

    speed = 0.075                       // units/frames
    velocity = new THREE.Vector3();     // units/frames
    ACCELERATION = 0.01;               // units/frames^2

    BASE_SPEED = this.speed
    MIN_SPEED = this.speed/2;
    MAX_SPEED = this.speed*2;

    Z_ROTATION_SPEED =  0.02;
    X_ROTATION_SPEED =  0.02;  // radians/frames (VERTICAL)
    Y_ROTATION_SPEED =  0.02;  // radians/frames (HORIZONTAL)

    GRAVITY = 0.0015 ;    // units/frames^2

    FLOTABILITY = 0.003;  // units/frames^2

    underwaterTime = 99999;     // frames
    enterFallingVelocity = 0;   // units/frames

    constructor(scene, spawnPoints) {
        this.spawnPoints = spawnPoints;
        this.mainMesh = new THREE.Mesh();

        // GRAPHICS //
        /*
        const geometry = new THREE.BoxGeometry(1, 1, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material); 
        this.mainMesh.add(cube);

        const axesHelper = new THREE.AxesHelper(5);
        this.mainMesh.add(axesHelper);
        */
        scene.add(this.mainMesh)

        model3DLoader.load('models/dolphin.gltf', (glb) => {
            const dolphin = glb.scene;

            dolphin.traverse((node) => {
                if (node.isMesh) {
                    const originalMaterial = node.material;

                    const newMaterial = new THREE.MeshStandardMaterial({
                        color: 0xAACCFF,
                        map: originalMaterial.map,
                        normalMap: originalMaterial.normalMap,
                        roughness: 0.6,
                        metalness: 0.5
                    });

                    node.material = newMaterial;
                    node.castShadow = true;
                    node.receiveShadow = true;

                    node.layers.mask = 2
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

        // CAMARA //
        const FOV = 75;
        const aspectRatio = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 1000;

        this.camera = new THREE.PerspectiveCamera(FOV, aspectRatio, near, far);
        this.camera.position.set(0, 0, 0);
        this.camera.lookAt(0, 0, 1);
        this.mainMesh.add(this.camera);

        this.respawn();


        // LUZ NOCTURNA
        const object = new THREE.Object3D();
        object.position.set(0,0,1)
        this.mainMesh.add(object)

        this.light = new THREE.SpotLight(0xAAAAff, 1);
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
        this.light.intensity = 2
        this.light.penumbra = 0.9
        this.mainMesh.add(this.light)

    }

    getPosition() {
        return this.mainMesh.position;
    }


    getCamera() {
        return this.camera;
    }

    update(WATER_LEVEL) {
        // Calculate the direction of the camera
        const camera_d = new THREE.Vector3();   // global direction of the camera
        this.camera.getWorldDirection(camera_d);
        this.camera_u = camera_d.normalize();  // unitary gobal direction of the camera

        // X Axis rotation (vertical)
        if (pressedKeys[this.UP_KEY]) {
            this.mainMesh.rotateX(this.X_ROTATION_SPEED);
        }

        if (pressedKeys[this.DOWN_KEY]) {
            this.mainMesh.rotateX(-this.X_ROTATION_SPEED);
        }

        // Y Axis rotation (horizontal)
        if (pressedKeys['a'] || pressedKeys['j']) {
            this.mainMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), this.Y_ROTATION_SPEED);
        }

        if (pressedKeys['d'] || pressedKeys['l']) {
            this.mainMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -this.Y_ROTATION_SPEED);
        }


        // UNDERWATER //
        if(this.mainMesh.position.y < WATER_LEVEL) {

            // Enter underwater
            if(this.underwaterTime <= 0) {
                this.enterFallingVelocity = this.velocity.y;
            }

            // Accelerate until max speed
            if(pressedKeys['w']){
                if(this.speed < this.MAX_SPEED){
                    this.speed += this.ACCELERATION;
                }
            }
    
            // Decelerate until min speed
            if(pressedKeys['s']){
                if(this.speed > this.MIN_SPEED){
                    this.speed -= this.ACCELERATION;
                }
            }

            // Accelerate or decelerate until base speed
            if(!pressedKeys['w'] && !pressedKeys['s']) {
                if(this.speed > this.BASE_SPEED){
                    this.speed -= this.ACCELERATION;
                }
                else if(this.speed < this.BASE_SPEED){
                    this.speed += this.ACCELERATION;
                }
            }

            this.prevState = this.UNDERWATER_STATE;

            this.velocity.x = this.speed * this.camera_u.x;
            this.velocity.y = this.speed * this.camera_u.y; 
            this.velocity.z = this.speed * this.camera_u.z;

            this.enterFallingVelocity += this.FLOTABILITY;

            this.velocity.y += Math.min(this.enterFallingVelocity, 0);
            
            this.underwaterTime++;

        } 
        // ABOVEWATER //
        else {
            this.velocity.y -= this.GRAVITY;
            this.underwaterTime = 0;
        }
        
        this.mainMesh.position.x += this.velocity.x
        this.mainMesh.position.y += this.velocity.y
        this.mainMesh.position.z += this.velocity.z
    }


    respawn() {
        this.score = 0;
        document.getElementById('score').innerHTML = this.score;

        const spawnPoint_xz = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)]; 
        this.mainMesh.position.set(
            spawnPoint_xz.x,
            -1.0,
            -spawnPoint_xz.z
        )
    }

    UP_KEY = 'i';
    DOWN_KEY = 'k';
    reverseControl() {
        if(this.UP_KEY === 'i') {
            this.UP_KEY = 'k';
            this.DOWN_KEY = 'i';
        } else {
            this.UP_KEY = 'i';
            this.DOWN_KEY = 'k';
        }
    }

    lanternOff() {
        this.light.intensity = 0
    }

    lanternOn() {
        this.light.intensity = 2
    }

    
}