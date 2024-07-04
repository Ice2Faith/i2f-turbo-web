// 0.引入Three.js
import * as THREE from 'three'

// 13.引入轨道控制器，方便查看物体
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

// 引入模型加载器
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'

// 添加gsap动画库
import gsap from 'gsap'

// 1.创建场景
const scene = new THREE.Scene()

// 2.创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

// 3.设置相机位置
camera.position.set(5, 8, 5)

// 4.添加相机到场景
scene.add(camera)

const gltfLoader = new GLTFLoader()
const fbxLoader = new FBXLoader()

// 加载模型的函数
const cache = {
    models: {}
}

function loadModelInit(loader,url, callback) {
    // 检查模型是否已被缓存
    if (cache.models[url]) {
        callback(cache.models[url])
        return
    }

    // 如果模型未被缓存，则进行加载
    loader.load(
        url,
        (obj) => {
            console.log('load callback',obj)
            obj.traverse((child) => {
                if (child.isMesh) {
                    // console.log(child.material)
                    child.material.emissive = child.material.color
                    child.material.emissiveMap = child.material.map
                    // child.material.transparent = true // 启用透明度
                    // child.material.opacity = 0.5 // 设置透明度为0.5（半透明）
                }
            })

            // 将模型存入缓存
            cache.models[url] = obj
            callback(obj)
        },
        undefined,
        (error) => {
            console.log('加载出错', error)
        }
    )

}

// 加载模型
function loadModel() {
    loadModelInit(fbxLoader,'./fbx/model.fbx', (model) => {
        // 8.将模型添加到场景
        console.log('load success',model)
        scene.add(model)
        // 将物体放到平面上
        model.position.y = 0.5
        // model.rotation.x=-3.14/2
    })

}

loadModel()


// 添加一个地面
const flatGeometry = new THREE.BoxGeometry(10, 0.01, 10)
const flatMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc})
const flatCube = new THREE.Mesh(flatGeometry, flatMaterial)
flatCube.position.set(0, -0.01, 0)
scene.add(flatCube)



// 9.创建渲染器
const renderer = new THREE.WebGLRenderer()

// 10.设置渲染的尺寸
renderer.setSize(window.innerWidth, window.innerHeight)

// 11.将渲染器绑定到DOM
document.body.appendChild(renderer.domElement)

// 12.使用渲染器通过相机渲染场景
// 到这里，已经可以显示物体了，只不过是静态的，不能旋转着看
// 下面使用轨道控制器进行查看，则此处的渲染就可以不用了
// renderer.render(scene,camera)

// 14.创建轨道控制器
// 为了能够进行鼠标拖动旋转着看物体
const controls = new OrbitControls(camera, renderer.domElement)
// 添加控制器的阻尼感
controls.enableDamping = true

// 15.更新控制器
controls.update()

// 18.添加坐标辅助器
const axesHelper = new THREE.AxesHelper(10000000)
scene.add(axesHelper)

// 22.添加光照
const light1 = new THREE.PointLight(0x0000ff)
light1.position.set(-4, 1, -4)
flatCube.add(light1)

const light2 = new THREE.PointLight(0x00ff00)
light2.position.set(4, 1, -4)
flatCube.add(light2)

const light3 = new THREE.PointLight(0xff0000)
light3.position.set(-4, 1, 4)
flatCube.add(light3)

// 23.添加环境光
const ambient = new THREE.AmbientLight('#444')
scene.add(ambient)


// 24.设置背景色
renderer.setClearColor(0x444444, 1);


// 定义动画类型：
// 0 浏览器帧控制
// 1 时间时刻控制
// 2 通过时钟控制
// 3 通过gsap动画库控制
const animateType = 3

// 添加时钟
const clock = new THREE.Clock()

if (animateType == 3) {
    // gsap动画的使用
    // 基本使用就是使用to方法
    // 方法参数
    // 第一个参数是被控制的对象，比如下面的cube.position
    // 第二个参数是动画的配置
    // 配置中，第一个是目标变量变化到的终止值，比如x:5
    // 其他常用配置：
    // duration，表示多长时间完成动画
    // repeat，表示动画的重复次数，-1表示永远不终止
    // yoyo，表示来回动画
    // ease，表示动画的变化曲线效果，也就是先慢后快等
    // delay，表示延迟开始动画的时间
    gsap.to(light1.position, {x: 5, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});
    gsap.to(light2.position, {z: 5, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});
    gsap.to(light3.position, {z: 0, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});

}

// 16.添加渲染方法
function render(tick) {

    // 更新控制器
    controls.update()
    // 渲染场景
    renderer.render(scene, camera)
    // 浏览器的下一帧回调
    requestAnimationFrame(render)
}

// 17.初始化渲染
render()

// 20.监听窗口大小变化，实现自适应
window.addEventListener('resize', () => {
    // 更新摄像头
    camera.aspect = window.innerWidth / window.innerHeight
    // 更新摄像头的投影矩阵
    camera.updateProjectionMatrix()
    // 更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    // 更新渲染器的像素比
    renderer.setPixelRatio(window.devicePixelRatio)
})

// 21.双击进行全屏切换
window.addEventListener('dblclick', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else {
        renderer.domElement.requestFullscreen()
    }
})
