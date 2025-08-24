class Ring {
    minHeight = -4.0
    maxHeight = +7.0
    
    EVIL_SPAWN_SCORE = 3

    constructor(scene, spawnPoints) {
        this.spawnPoints = spawnPoints;

        // Crear la geometría del toro
        const radius = 1;
        const tube = 0.25; // Radio exterior - radio interior
        const radialSegments = 16;
        const tubularSegments = 100;
        const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);

        // Crear el material metálico
        const material = new THREE.MeshStandardMaterial({
            color: 0xff7777,
            metalness: 1,
            roughness: 0.5
        });

        // Crear mesh y añadirlo a la escena
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true; // Añadir esta línea

        // Añadir giro en el eje Y para desincronizarlo
        this.mesh.rotation.y = Math.random() * 2 * Math.PI;
    }

    teleport() {
        // Selects a random valid spawn point
        const spawnPoint_xz = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];

        // Selects a random height between the minimum and maximum heights
        const height = this.minHeight + Math.random() * (this.maxHeight - this.minHeight);

        this.mesh.position.set(spawnPoint_xz.x, height, -spawnPoint_xz.z);

    }

    // Devuelve si tiene que invocar al delfín malvado
    update(dolphin) {
        this.mesh.rotation.y += 0.1

        const dolphin_x = dolphin.getPosition().x
        const dolphin_y = dolphin.getPosition().y
        const dolphin_z = dolphin.getPosition().z

        const diff_x = dolphin_x - this.mesh.position.x
        const diff_y = dolphin_y - this.mesh.position.y
        const diff_z = dolphin_z - this.mesh.position.z

        const distance = Math.sqrt(diff_x * diff_x + diff_y * diff_y + diff_z * diff_z)

        if (distance < 1.5) {
            dolphin.score++;
            document.getElementById('score').innerHTML = dolphin.score;
            this.teleport();

            return dolphin.score == this.EVIL_SPAWN_SCORE;
        }
        
        return false;
    }
}