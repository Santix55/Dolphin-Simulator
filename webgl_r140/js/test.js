// ejemplo loader

var loader;
var renderer, scene;
var cameraControls;

const FRAME_TIME = 1/60
const clock = new THREE.Clock();

var terrain;
var dolphin, evilDolphin;

var currentCamera, dolphinCamera,  camera;
var pause = true;

var miniMapCamera, miniMapRenderer;

var textureLoader
var model3DLoader

var sunLight, ambientLight
var day = true;

init();
render();

function loadMiniMap() {
  const miniMap = document.getElementById('minimap');
   miniMapRenderer = new THREE.WebGLRenderer();
  miniMapRenderer.setSize(miniMap.offsetWidth, miniMap.offsetHeight);
  miniMap.appendChild(miniMapRenderer.domElement);

  miniMapCamera = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 1000);
  miniMapCamera.position.set(0, 100, 0);
  miniMapCamera.lookAt(0, -1, 0);
  miniMapCamera.layers.mask = 3 

  scene.add(miniMapCamera);

}

function init()
{
  textureLoader = new THREE.TextureLoader();
  model3DLoader = new THREE.GLTFLoader();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0x77AAFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();
  world = new CANNON.World();
  world.gravity.set(0, 0, 0);

  loadMiniMap();

  loadScene();

  // CAMARA DE PAUSA //
  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 1, 1000 );
  camera.position.set( 100, 150, 200 );
  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );
  camera.layers.mask = 3;
  currentCamera = camera;

  /* // LUZ FOCAL //
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(50, 50, 50);
  scene.add(light);
  */

  // LUZ SOLAR //
  sunLight = new THREE.DirectionalLight(0xffff77, 1);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true; // Habilitar sombras si es necesario
  scene.add(sunLight);
  
  // O también una luz ambiental para afectar a todos los objetos de manera uniforme
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  ambientLight.castShadow = true;

  window.addEventListener('resize', updateAspectRatio );

  const moonLight = new THREE.DirectionalLight(0xffff77, 1);
  const moonAmbientLight = new THREE.AmbientLight(0xffffff, 0.3);

}



function radians(n) {
  return n*(Math.PI / 180.0)
}

var spawnPoints;
var rings;

function loadScene() {
  //const axesHelper = new THREE.AxesHelper(5);
  //axesHelper.position.set(0, 5 , 0);
  //scene.add(axesHelper);

  terrain = new Terrain(scene);
  spawnPoints = terrain.getSpawnPoints();

  dolphin = new Dolphin(scene, spawnPoints);

  dolphinCamera = dolphin.getCamera();

  rings = [];
  for(i=0; i<20; i++) {
    ring = new Ring(scene, spawnPoints);
    ring.teleport();
    rings.push(ring)
  }

  dolphin.lanternOff();

  evilDolphin = new EvilDolphin(scene);
  evilDolphin.despawn();

}



function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  currentCamera.aspect = window.innerWidth / window.innerHeight;
  currentCamera.updateProjectionMatrix();

  miniMapCamera.aspect = window.innerWidth / window.innerHeight;
  miniMapCamera.updateProjectionMatrix();
}


function update()
{
  if (pause) {
    currentCamera = camera;
    cameraControls.update();
  } else {
    dolphin.update(terrain.getWaterLevel());
    chased = evilDolphin.update(dolphin.getPosition())
    currentCamera = dolphinCamera;

    miniMapCamera.position.x = dolphin.getPosition().x;
    miniMapCamera.position.z = dolphin.getPosition().z;

    HALF_MAP = terrain.MAP_WIDTH * 0.5;

    if (terrain.isBellowTerrain(dolphin.getPosition()) 
      || dolphin.getPosition().x > HALF_MAP  || dolphin.getPosition().z > HALF_MAP
      || dolphin.getPosition().x < -HALF_MAP || dolphin.getPosition().z < -HALF_MAP
      || chased) {
      pause = true;

      document.getElementById('banner').style.display = 'block';
      document.getElementById('banner').innerHTML = "🐬 ¡PERDISTE! <br> Tu puntuación es " + dolphin.score ;

      dolphin.respawn();
      evilDolphin.despawn();
    }
  }

  spawnEvil = false;
  for (ring of rings) { spawnEvil |= ring.update(dolphin) }
  if (spawnEvil) {
    setNigth()
    evilDolphin.spawn()
  }

  

}



function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, currentCamera );
  miniMapRenderer.render( scene, miniMapCamera)
}


window.addEventListener('keydown', (event) => {
  if (pause && event.key === ' ') {
    if (document.getElementById('banner').style.display != 'none') {
      setDay()
    }
    document.getElementById('banner').style.display = 'none'; 
  }

  if (event.key === ' ') {
      pause = !pause
  } else if (event.key === 'r') {
      dolphin.reverseControl();
  }

  if (event.key === 'n') {
    if(day){
      setNigth()
      
    }
    else{
      setDay()
      
    }
    day = !day
  }

  if (!pause && event.key == '3') {
    setNigth();
    evilDolphin.spawn();
  }


});


function setNigth() {
  sunLight.intensity = 0.3;
  ambientLight.intensity = 0.2;
  renderer.setClearColor( new THREE.Color(0x280f40) );
  dolphin.lanternOn()
}

function setDay() {
  sunLight.intensity = 1;
  ambientLight.intensity = 0.5;
  renderer.setClearColor( new THREE.Color(0x77AAFF) );
  dolphin.lanternOff()
}

