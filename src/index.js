const hammer = require('hammerjs');
const axios = require('axios');
var THREE = window.THREE = require('three');

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 10);

var light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 20, 10);
scene.add(light);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
window.document.body.appendChild(renderer.domElement);

var globalSpeed = 1;
const landSpeed = 0.88;
const landWidth = 1.3;
const Pi = Math.PI;

var gameOverFlag = false;

var TextureLoader = new THREE.TextureLoader();
TextureLoader.load("./resource/images/sky.jpg", texture =>scene.background = texture);

var domData = new Proxy({}, {
  get: function (target, key, receiver) {
    return Reflect.get(target, key, receiver);
  },
  set: function (target, key, value, receiver) {
			const scoreDom = document.getElementById(key);
			scoreDom.innerHTML = value;
			return Reflect.set(target, key, value, receiver);
  }
});

domData.score = 0;

(function loadModels(){
	require('three/examples/js/loaders/GLTFLoader');
	var gLTFLoader = new THREE.GLTFLoader();
	const loadGltf = gltfFile => new Promise((res, rej) => gLTFLoader.load(gltfFile, res));
	Promise.all([
		axios('resource/models/jump.glb', {
			onDownloadProgress: function (progressEvent) {
				// console.log('🐔'.repeat(Math.floor(progressEvent.loaded * 10 / progressEvent.total)));
				domData.start = '🐔'.repeat(Math.floor(progressEvent.loaded * 10 / progressEvent.total) + 1);
			}
		}),
		axios('resource/models/tree.glb'),
		axios('resource/models/land.glb'),
		axios('resource/models/coin.glb')
	]).then(()=>
	Promise.all([
			loadGltf('resource/models/jump.glb'),
			loadGltf('resource/models/tree.glb'),
			loadGltf('resource/models/land.glb'),
			loadGltf('resource/models/coin.glb')
		]))
		.then(([chickenModel, treeModel, landModel, coinModel]) => {
				domData.start = 'start game➡️'
			const chicken = chickenModel.scene;
			chicken.rotation.y = -Pi / 2;
			const tree = treeModel.scene;
			const land = landModel.scene;
			const coin = coinModel.scene;

			(function initTouchActions(){
				const cvs = new hammer(renderer.domElement);
				let startPosition = 0;
				cvs.on('pan', ev => {
					if(gameOverFlag == true) return;
					let newPosition = startPosition + ev.deltaX / window.innerHeight * 16;
					chicken.position.x = newPosition> 7.5 ? 7.5: (newPosition < -7.5? -7.5 : newPosition);
				});
				cvs.on('panstart', ev =>{
					startPosition = chicken.position.x;
				})
			})();

			const coinAnimation = coinModel.animations[0];
			const clock = new THREE.Clock();
			
			let coinMixArray = [];

			const createRowGroup = (lineIndex) => {
				let rowGroup = new THREE.Group();
				let coinIndex = Math.floor(Math.random() * 15);
				const getObjectPosition = index=> [index - 7, landWidth * lineIndex, -landWidth * lineIndex - 0.3];
				let treeExistarray = Array.from({length: 15}).map((a, index) => {
					if(index == coinIndex){
						let coinInRow = coin.clone();
						coinInRow.position.set(...getObjectPosition(index));
						rowGroup.add(coinInRow);
						let mixer = new THREE.AnimationMixer(coinInRow);
						mixer.clipAction(coinAnimation).play();
						coinMixArray.push([mixer, coinInRow]);
						return 2;
					}
					if (Math.random() > 0.4 || lineIndex == 0 || lineIndex == 1) {
					
						return 0;
					}
					let treeInRow = tree.clone()
					treeInRow.position.set(...getObjectPosition(index));
					rowGroup.add(treeInRow);
					return 1;
				});
				let rowLand = land.clone();
				rowLand.position.y = landWidth * (lineIndex - 1);
				rowLand.position.z = -landWidth * (lineIndex + 1);
				lineIndex == 4 && rowGroup.scale.set(0.5,0.5,0.5);
				rowGroup.add(rowLand);
				return [rowGroup, treeExistarray];
			}
			
			var landGroup = Array.from({length: 5}).map((a, index) => {
				let rowGroup, treeExistarray
				[rowGroup, treeExistarray] = createRowGroup(index);
				scene.add(rowGroup);
				return [rowGroup, treeExistarray];
			})

			scene.add(chicken);
			const startSpeed = 0.5;
			var speed = startSpeed;
			var a = -0.02 * globalSpeed;


			const chickenOnLand = ()=>{
				coinMixArray = coinMixArray.slice(1)
				speed = startSpeed;
				if(landGroup[1][1][Math.round(chicken.position.x) + 7] == 1){
					chicken.rotation.x = -Pi / 2;
					// chicken.position.z += landWidth /2;
					document.getElementById('over').style.display = 'block';
					gameOverFlag = true;
					return false;
				}else if(landGroup[1][1][Math.round(chicken.position.x) + 7] == 2){
					landGroup[1][0].remove(coinMixArray[0][1]);
					domData.score += 10;
				}
				scene.remove(landGroup[0][0]);
				landGroup = landGroup.slice(1);
				let newTreeGroup = createRowGroup( 4 );
				scene.add(newTreeGroup[0]);
				landGroup.push(newTreeGroup);
				return true;
			}
			const landAndChickenAnimation = ()=>{
				landGroup.forEach(treeRowGroup => {
					treeRowGroup[0].position.y = treeRowGroup[0].position.y - 0.032 * landSpeed * globalSpeed;
					treeRowGroup[0].position.z = treeRowGroup[0].position.z + 0.032 * landSpeed * globalSpeed;
				})
				chicken.position.y += speed;
				speed = speed + a;
			}
			const coinRotateAnimation = ()=> {
				const delta = clock.getDelta();
				coinMixArray.forEach(cm=>cm[0].update(delta));
			}
			const animate = function () {
				let scaleRate = landGroup[landGroup.length - 1][0].scale.x;
				scaleRate < 1 && landGroup[landGroup.length - 1][0].scale.set(scaleRate + 0.1 , scaleRate + 0.1, scaleRate + 0.1)
				
				if(gameOverFlag === false){
					chicken.position.y < 0 && !chickenOnLand();
					landAndChickenAnimation();
				}
				coinRotateAnimation();
				requestAnimationFrame(animate);
				renderer.render(scene, camera);
			};
			renderer.render(scene, camera);

			const startButton = document.getElementById('start');
			startButton.onclick = ()=>{
				startButton.style.display = 'none';
				animate();
			}
		});
})();