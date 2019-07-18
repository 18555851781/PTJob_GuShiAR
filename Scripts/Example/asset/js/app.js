//             别间隔时间(毫秒), 识别服务地址, 认证token
const webAR = new WebAR(1000, 'https://cn1-crs.easyar.com:8443/search', 'mk5HpNPpTTs6/iL1RFiOeO2svsFEL86V7erut5HQolqVATfBntApxg6ktMeX3yX6sUqlf1g2Jh4ADNa1ruDFhA==');
// Threejs简单使用类
const threeHelper = new ThreeHelper();

let scene,camera,render,control,light_1,video;
let cloud;
let mixer1,mixer2;
let clock = new THREE.Clock();

//  页面打开时进行识别
function OpenCam()
{
    const videoSelect = document.querySelector('#videoDevice');
    webAR.listCamera(videoSelect)
        .then(msg => {
            // 隐藏"打开摄像头"按钮
            this.style.display = 'none';
            document.querySelector('#start').style.display = 'none';
            document.querySelector('#stop').style.display = 'none';
            videoSelect.style.display = 'none';
        })
        .catch(err => {
            // 没有找到摄像头
            console.info(err);
        });

    webAR.openCamera()
        .then(msg => {
            console.info(msg);
        }).catch(err => {
        console.info(err);
    });

    webAR.startRecognize((msg) => {
        console.info(msg);
        // 可以将 setting 作为meta上传到EasyAR的云识别，使用方法如下
        // const setting = {
        //     model: 'Example/asset/model/trex_v3.fbx',
        //     scale: 0.02,
        //     position: [0, 0, 0]
        // };
        // // threeHelper.loadObject(setting);
        reset();
        createPointCloud();
        LoadGLTF();
        Loadwater();
        animate();
    });
}

OpenCam();

//  刷新页面
function Refresh()
{
    window.location.reload();
}


function reset()
{
    scene = new THREE.Scene();

    video = document.getElementById("iv");

    camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,1000);
    camera.position.set(0,10,-50);
    camera.lookAt(scene);

    render = new THREE.WebGLRenderer({antialias:true,alpha: true});
    render.setSize(window.innerWidth,window.innerHeight);
    render.domElement.setAttribute('class', 'mainCanvas');
    render.domElement.style.display = "none";
    render.domElement.style.padding = "0px";
    render.domElement.style.margin = "0px";

    // render.setClearColor(0x000000);
    // render.domElement.
    document.body.appendChild(render.domElement);

    light_1 = new THREE.HemisphereLight("rgb(255,210,255)","rgb(255,213,170)",7);
    light_1.position.set(0,0,0);
    scene.add(light_1);

    // light_2 = new THREE.DirectionalLight(0xffffff,1);
    // light_2.lookAt(scene);
    // scene.add(light_2);

    control = new THREE.OrbitControls(camera);
    control.minDistance = 20;
    control.maxDistance = 50;
    control.enablePan = false;
}

function LoadGLTF()
{
    let loader = new THREE.GLTFLoader();
    loader.load("../Model/GLTF/Chunyexiyu/scene.gltf",function (obj) {
        scene.add(obj.scene);
        console.log(obj);
        render.domElement.style.display = "block";
        render.domElement.style.padding = "0";
        render.domElement.style.margin = "0";
    })

    let loader2 = new THREE.FBXLoader();
    loader2.load("../Model/GLTF/Chunyexiyu/xiaochuan.fbx",function (obj) {
        mixer1 =new THREE.AnimationMixer(obj);
        let action = mixer1.clipAction(obj.animations[0]);
        action.play();
        obj.position.set(-1,0.3,-2);
        //obj.children[0].children[0].visible = false;
        console.log(obj);
        scene.add(obj);
    })
    loader2.load("../Model/GLTF/Chunyexiyu/dachuan.fbx",function (obj) {
        mixer2 = new THREE.AnimationMixer(obj);
        let action = mixer2.clipAction(obj.animations[0]);
        action.play();
        obj.position.set(0,0,-2);
        //obj.children[0].children[0].visible = false;
        scene.add(obj);
    })
}

function Loadwater()
{
    let watergeomery = new THREE.CircleBufferGeometry(22,64);
    let water = new THREE.Water(watergeomery,{
        color : 0xffffff,
        scale : 0.5,
        flowDirection: new THREE.Vector2(0.5,0.5),
        textureWidth: 1024,
        textureHeight: 1024
    })
    water.position.set(-3.5,-0.5,-3.5);
    water.rotation.x=-Math.PI/2;
    scene.add(water);
}

function createPointCloud()
{

    let texture = THREE.ImageUtils.loadTexture("../Texture/Chunyexiyu/raindrop-1.png");
    let geom = new THREE.Geometry();

    let material = new THREE.ParticleBasicMaterial({
        size: 0.5,
        transparent: true,
        opacity: 0.4,
        map: texture,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        color: 0xffffff,
        needsUpdate: true,
        depthTest:false
    });


    let range = 40;
    for (let i = 0; i < 1500; i++) {
        let particle = new THREE.Vector3(
            Math.random() * range - range / 2,
            Math.random() * range * 1.5,
            Math.random() * range - range / 2);
        particle.velocityY = 0.1 + Math.random() / 5;
        particle.velocityX = (Math.random() - 0.5) / 3;
        geom.vertices.push(particle);
    }

    cloud = new THREE.ParticleSystem(geom, material);
    cloud.sortParticles = true;
    // cloud.traverse(function(child) {
    //
    //     if(child instanceof THREE.Mesh) {
    //         child.material.transparent=true;
    //     }
    // })

    scene.add(cloud);
}

function animate()
{
    cloud.position.y-=0.8;
    if(cloud.position.y <= -50)
    {
        cloud.position.y = 0;
    }
    requestAnimationFrame(animate);

    let time = clock.getDelta();
    if(mixer1) mixer1.update( time );
    if(mixer2) mixer2.update( time );

    render.render(scene,camera);
}


