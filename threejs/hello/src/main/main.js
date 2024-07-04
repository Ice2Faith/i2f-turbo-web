// 0.引入Three.js
import * as THREE from 'three'

// 13.引入轨道控制器，方便查看物体
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

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

// 5.添加几何体
const geometry = new THREE.BoxGeometry(1, 1, 1)

// 6.给几何体添加材质
const material = new THREE.MeshLambertMaterial({color: 0xffffff})

// 7.将几何体和材质生成模型
const cube = new THREE.Mesh(geometry, material)

// 8.将模型添加到场景
scene.add(cube)

// 添加一个地面
const flatGeometry = new THREE.BoxGeometry(10, 0.01, 10)
const flatMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc})
const flatCube = new THREE.Mesh(flatGeometry, flatMaterial)
flatCube.position.set(0, -0.01, 0)
scene.add(flatCube)
// 将物体放到平面上
cube.position.y = 0.5

const circleGeometry = new THREE.SphereGeometry(0.3)
const circleMaterial = new THREE.MeshLambertMaterial({color: 0xff7755})
const circleCube = new THREE.Mesh(circleGeometry, circleMaterial)
circleCube.position.set(-0.5, 0.3, -0.5)
scene.add(circleCube)

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
const axesHelper = new THREE.AxesHelper(10)
scene.add(axesHelper)

// 22.添加光照
const light = new THREE.PointLight(0xff00ff)
light.position.set(0.5, 0.5, 1)
cube.add(light)

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
    gsap.to(cube.position, {x: 5, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});
    gsap.to(cube.scale, {x: 0, duration: 3, repeat: -1, yoyo: true})
    gsap.to(cube.scale, {y: 0, duration: 3, repeat: -1, yoyo: true})
    gsap.to(cube.scale, {z: 0, duration: 3, repeat: -1, yoyo: true})
    gsap.to(cube.rotation, {x: Math.PI * 2, duration: 1, repeat: -1, yoyo: true})

    gsap.to(light1.position, {x: 5, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});
    gsap.to(light2.position, {z: 5, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});
    gsap.to(light3.position, {z: 0, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});

    gsap.to(circleCube.position, {y: 5, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});

}

// 16.添加渲染方法
function render(tick) {
    // 19.添加一个动画
    if (animateType == 0) {
        // 方式一：通过直接回调
        // 这种动画方式收到浏览器请求帧的限制，因此动画常常不均匀
        // 向X轴移动
        cube.position.x += 0.05
        // 等比例缩小
        cube.scale.x *= 0.98
        cube.scale.y *= 0.98
        cube.scale.z *= 0.98
        // 围绕X轴旋转
        cube.rotation.x += 10 / 180 * Math.PI
    } else if (animateType == 1) {
        // 方式二：通过计算时间
        // 因此，一般是结合回调函数的时间来计算动画的
        // 这样才能达到真实的动画效果，但是可能会由于浏览器渲染原因
        // 导致动画不连贯
        // 这里就定义了5秒的动画，每秒移动1个单位
        let rate = tick / 1000 % 5;
        cube.position.x = rate * 1
        cube.scale.x = 1.0 - rate * 0.2
        cube.scale.y = 1.0 - rate * 0.2
        cube.scale.z = 1.0 - rate * 0.2
        cube.rotation.x = 2 * Math.PI - rate * 2 * Math.PI
    } else if (animateType == 2) {
        // 方式三：通过自定义时钟控制
        // 这种方式，原理上和方式二一样，但是时钟可控
        // 并且使用可以独立，具有更高的操作空间
        let rate = clock.getElapsedTime() % 5
        cube.position.x = rate * 1
        cube.scale.x = 1.0 - rate * 0.2
        cube.scale.y = 1.0 - rate * 0.2
        cube.scale.z = 1.0 - rate * 0.2
        cube.rotation.x = 2 * Math.PI - rate * 2 * Math.PI
    } else if (animateType == 3) {
        // 方式四：通过gsap动画库
        // 这种方式，实际上只需要渲染
        // 计算由动画库实现了
    }


    // 当移动到一定距离之后，重新恢复，以此实现重复
    if (cube.position.x > 5) {
        cube.position.x -= 5
        cube.scale.x = 1.0
        cube.scale.y = 1.0
        cube.scale.z = 1.0
        cube.rotation.x = 0
    }


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