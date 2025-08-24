class Terrain {
    MAP_WIDTH = 100
    MAP_SEGMENTS = 10000

    WATER_LEVEL = 2.5
    
    dictionary = new Map();

    constructor(scene) {

        // LAND //
        const geometry = new THREE.PlaneGeometry(this.MAP_WIDTH, this.MAP_WIDTH, this.MAP_WIDTH, this.MAP_SEGMENTS);
        this.simplex = new SimplexNoise();

        this.positionAttribute = geometry.attributes.position;
        for (let i = 0; i < this.positionAttribute.count; i++) {
            const x = this.positionAttribute.getX(i);
            const y = this.positionAttribute.getY(i);
            const z = this.simplex.noise2D(x/25, y/25 ) * 10;
            this.positionAttribute.setZ(i, z);

            this.dictionary.set(`${x},${y}`, z);
        }


        geometry.computeVertexNormals();

        //const material = new THREE.MeshLambertMaterial({ color: 0xFCE177, wireframe: false })

        const texture = textureLoader.load('textures/sand.jpeg', function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(10, 10); // Ajusta los valores para repetir la textura más veces
        });
        const material = new THREE.MeshStandardMaterial({ map: texture })

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // WATER //
        const waterGeometry = new THREE.PlaneGeometry(this.MAP_WIDTH, this.MAP_WIDTH);
        const waterMaterial = new THREE.MeshBasicMaterial({
            color: 0x7777ff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);

        waterMesh.position.z = this.WATER_LEVEL;


        
        this.mesh.add(waterMesh);

        scene.add(this.mesh)

    }


    isBellowTerrain(position) {
        return this.dictionary.get(`${Math.floor(position.x)},${Math.floor(-position.z)}`) > position.y;
        /*
        // Escala de ruido utilizada para generar el terreno
        const noiseScale = 20;
        const terrainHeightScale = 10;

        // Calcular la altura del terreno en la posición actual usando el mismo ruido simplex
        const terrain_y = this.simplex.noise2D(position.x / noiseScale, position.z / noiseScale) * terrainHeightScale;

        // Retornar verdadero si la posición está por debajo de la altura del terreno
        return position.y < terrain_y;
        */
    }


    getWaterLevel() {
        return this.WATER_LEVEL;
    }


    getSpawnPoints() {
        const MIN_DEPTH = -6
        const BORDER = 10

        let spawnPoints = [];

        const mapLengthHalf = Math.floor(this.MAP_WIDTH / 2);

        for (let x= -mapLengthHalf+BORDER; x < mapLengthHalf-BORDER; x++) {
            for (let z = -mapLengthHalf+BORDER; z < mapLengthHalf-BORDER; z++) {

                const position = this.dictionary.get(`${x},${z}`);

                if (position < MIN_DEPTH){
                    spawnPoints.push({x:x, z:z});
                }

            }
        }

        return spawnPoints;

    }

}