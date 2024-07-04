// 0.引入Three.js
import * as THREE from 'three'

// 13.引入轨道控制器，方便查看物体
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

import {FontLoader} from 'three/examples/jsm/loaders/FontLoader'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry'

// 添加gsap动画库
import gsap from 'gsap'

// 1.创建场景
const scene = new THREE.Scene()

// 2.创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

// 3.设置相机位置
camera.position.set(2.8, 0.8, 2.8)

// 4.添加相机到场景
scene.add(camera)

const group=new THREE.Group()
scene.add(group)

scene.position.y=-1
gsap.to(group.rotation,{y:Math.PI*2,duration:30,repeat:-1,yoyo:false,ease:'linear'})



// 添加一个地面
const flatGeometry = new THREE.BoxGeometry(5, 0.01, 5)
const flatMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(
        Math.random() * 0.3,
        Math.random() * 0.8,
        Math.random() * 0.3
    )
})
const flatCube = new THREE.Mesh(flatGeometry, flatMaterial)
flatCube.position.set(0, -0.01, 0)
flatCube.receiveShadow = true
group.add(flatCube)


function radian2angle(radian) {
    return radian / Math.PI * 180
}

function angle2radian(angle) {
    return angle / 180 * Math.PI
}

function D3SpherePoint(radius=0,alpha=0,beta=0){
    return {
        radius: radius, // 长度
        alpha: alpha, // 水平方向偏转角 φ
        beta: beta // 垂直方向偏转角 θ
    }
}

function D3RegularPoint(x=0,y=0,z=0){
    return {
        x: x,
        y: y,
        z: z
    }
}

function D3SpherePoint2RegularPoint(spherePoint){
    return D3RegularPoint(
        spherePoint.radius*Math.sin(spherePoint.beta)*Math.cos(spherePoint.alpha),
        spherePoint.radius*Math.sin(spherePoint.beta)*Math.sin(spherePoint.alpha),
        spherePoint.radius*Math.cos(spherePoint.beta)
    )
}

function D3RegularPoint2SpherePoint(regularPoint){
    let r=Math.sqrt(
        Math.pow(regularPoint.x,2)+
            Math.pow(regularPoint.y,2)+
            Math.pow(regularPoint.z,2)
    )
    return D3SpherePoint(
        r,
        Math.atan2(regularPoint.y,regularPoint.x),
        Math.acos(regularPoint.z/r)
    )
}

function D3VectorPoint(regularPoint1,regularPoint2){
    return D3RegularPoint(
        regularPoint2.x-regularPoint1.x,
        regularPoint2.y-regularPoint1.y,
        regularPoint2.z-regularPoint1.z
    )
}



Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds() //秒
    };
    if (/(y+)/.test(fmt)){ //根据y的长度来截取年
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o){
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
    return fmt;
}



function D3Tree(params = {}, rootColor = {}, boleColor = {}, flowerColor = {},leafColor={}, point = {}, size = {}, rotate = {}) {
    return {
        config: {
            // 基本参数
            params: Object.assign({
                // 树的递归层次
                level: Math.round(Math.random() * 5 + 5),
                // 树的每个分支的最大分支数量
                branches: Math.round(Math.random() * 3 + 1),
                // 树的最大增加灯光数量
                lights: 5,
                // 是否适用阴影
                shadow: true,
                // 树干是否适用圆柱
                useCylinder: true,
                // 树干连接处是否需要圆滑处理
                useLink: true,
                // 是否需要添加端点的花
                useFlower: true,
                // 裁枝率
                cutOffRate: 0.1,
                // 花朵颜色的偏差率
                flowerColorDiffRate: 0.3,
                // 花朵的相对偏移距离
                flowerDistanceDiffRate: 1,
                // 花朵在每个节点的最大花瓣数量
                flowerCount: 3,
                // 生成花朵的概率
                flowerRate: 0.5,
                // 使用球形花瓣
                useSphereFlower: true,
                // 树叶颜色的偏差率
                leafColorDiffRate: 0.3,
                // 是否需要添加树叶
                useLeaf: true,
                // 叶子在每个节点的最大花瓣数量
                leafCount: 2,
                // 最大的叶子数量
                leafs: 500,
                // 叶子出现的概率
                leafRate: 0.08
            }, params),
            // 主干参数
            bole: {
                // 树干从哪个坐标长出来
                point: Object.assign({
                    x: 0,
                    y: 0,
                    z: 0
                }, point),
                // 树干的初始尺寸
                size: Object.assign({
                    // 长度
                    h: 1,
                    // 底端粗度
                    rb: 0.01,
                    // 顶端粗度
                    re: 0.01 * 0.85
                }, size),
                // 树干的旋转
                rotate: Object.assign({
                    alpha: angle2radian(Math.random() * 120 + 30),
                    beta: angle2radian(Math.random() * 120 + 30)
                }, rotate)
            },
            // 树的颜色设置
            color: {
                // 树根的颜色
                root: Object.assign({
                    r: Math.random() * 0.8 + 0.2,
                    g: Math.random() * 0.5 + 0.2,
                    b: Math.random() * 0.5
                }, rootColor),
                // 树枝的颜色
                bole: Object.assign({
                    r: Math.random() * 0.3,
                    g: Math.random() * 0.5 + 0.5,
                    b: Math.random() * 0.8
                }, boleColor),
                // 花朵的参考颜色
                flower: Object.assign({
                    r: Math.random() * 0.3 + 0.7,
                    g: Math.random() * 0.3,
                    b: Math.random() * 1
                }, flowerColor),
                // 叶子的参考颜色
                leaf: Object.assign({
                    r: Math.random() * 1,
                    g: Math.random() * 0.7 + 0.3,
                    b: Math.random() * 0.2
                }, leafColor)
            }
        },
        data: {
            lights: 0,
            leafs: 0
        },
        tree:[{
            type: 'bole', // bole/link/flower/light
            cube: {},
            bole: {},
            level: 0,
            rate: 0
        }],
        show(sence){
            for(let i=0;i<this.tree.length;i++){
                sence.add(this.tree[i].cube)
            }
        },
        buildTree() {
            let config = this.config
            this.data = {
                lights: config.params.lights,
                leafs: config.params.leafs
            }
            this.tree=[]
            this.buildTreeNext(
                config.bole,
                config.params.level
            )
        },
        buildTreeNext(bole, level) {
            let config = this.config
            let data = this.data
            if (level <= 0) {
                return
            }
            let rate = level * 1.0 / config.params.level
            this.addBole(bole, level)

            let cnt = Math.round(Math.random() * config.params.branches) + 1

            // 计算终点坐标
            let sp=D3SpherePoint(bole.size.h,bole.rotate.alpha,bole.rotate.beta)
            let dp = D3SpherePoint2RegularPoint(sp);
            let dx=dp.x
            let dy=dp.y
            let dz=dp.z

            let diffAngle = 60
            if(rate<0.7){
                if (Math.random() < 0.3) {
                    diffAngle = Math.random() * 120 + 10
                }
            }
            for (let i = 0; i < cnt; i++) {

                if(rate<0.7){
                    if (Math.random() < config.params.cutOffRate) {
                        continue
                    }
                }


                let nextBole = {
                    point: {
                        x: bole.point.x + dx,
                        y: bole.point.y + dy,
                        z: bole.point.z + dz
                    },
                    size: {
                        h: bole.size.h * (1 - Math.random() * 0.3),
                        rb: bole.size.re,
                        re: bole.size.re * (1 - Math.random() * 0.5)
                    },
                    rotate: {
                        alpha: bole.rotate.alpha + angle2radian(Math.random() * diffAngle - diffAngle/2),
                        beta: bole.rotate.beta + angle2radian(Math.random() * diffAngle - diffAngle/2)
                    }
                }

                this.buildTreeNext(nextBole, level - 1)
            }
        },
        addBole(bole, level) {
            let config = this.config
            let data = this.data

            let rate = level * 1.0 / config.params.level

            // 计算终点坐标
            let sp=D3SpherePoint(bole.size.h,bole.rotate.alpha,bole.rotate.beta)
            let dp = D3SpherePoint2RegularPoint(sp);
            let dx=dp.x
            let dy=dp.y
            let dz=dp.z

            let bcolor = {
                r: config.color.root.r * rate + config.color.bole.r * (1 - rate),
                g: config.color.root.g * rate + config.color.bole.g * (1 - rate),
                b: config.color.root.b * rate + config.color.bole.b * (1 - rate),
            }

            if (config.params.useCylinder) {
                let geometry = new THREE.CylinderGeometry(bole.size.re, bole.size.rb, bole.size.h);
                // 应用变换矩阵
                // 由于默认是中心点为原点，移动到底端为原点
                geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, bole.size.h / 2, 0));
                // 由于默认是顺着Y轴，变换为顺着Z轴
                geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));

                let material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(bcolor.r, bcolor.g, bcolor.b)
                });

                const cube = new THREE.Mesh(geometry, material)
                cube.position.set(bole.point.x, bole.point.y, bole.point.z)
                // 使得Z轴方向指向目标点
                cube.lookAt(bole.point.x + dx, bole.point.y + dy, bole.point.z + dz)

                if (config.params.shadow) {
                    cube.castShadow = true
                    cube.receiveShadow = true
                }
                this.tree.push({
                    type: 'bole',
                    cube:cube,
                    bole: bole,
                    level: level,
                    rate: rate
                })
            } else {
                const material = new THREE.LineBasicMaterial({
                    color: new THREE.Color(
                        bcolor.r, bcolor.g, bcolor.b
                    )
                });

                const points = []
                points.push(new THREE.Vector3(bole.point.x, bole.point.y, bole.point.z))
                points.push(new THREE.Vector3(bole.point.x + dx, bole.point.y + dy, bole.point.z + dz))

                const geometry = new THREE.BufferGeometry().setFromPoints(points)
                const line = new THREE.Line(geometry, material)
                if (config.params.shadow) {
                    line.castShadow = true
                    line.receiveShadow = true
                }
                this.tree.push({
                    type: 'bole',
                    cube:line,
                    bole: bole,
                    level: level,
                    rate: rate
                })
            }

            if (config.params.useLink) {
                let geometry = new THREE.SphereGeometry(bole.size.re * 1.2)
                let material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(bcolor.r, bcolor.g, bcolor.b),
                    shininess: 1
                })
                let cube = new THREE.Mesh(geometry, material)
                cube.position.set(bole.point.x, bole.point.y, bole.point.z)
                if (config.params.shadow) {
                    cube.castShadow = true
                    cube.receiveShadow = true
                }
                this.tree.push({
                    type: 'link',
                    cube:cube,
                    bole: bole,
                    level: level,
                    rate: rate
                })

            }

            if (config.params.lights > 0 && Math.random() < 0.03 && data.lights > 0) {
                const light = new THREE.PointLight(new THREE.Color(
                    Math.random()*0.5+0.5,
                    Math.random(),
                    Math.random()*0.5+0.5
                ),1,2,1)
                light.position.set(bole.point.x, bole.point.y, bole.point.z)
                if (config.params.shadow) {
                    light.castShadow = true
                    light.shadow.mapSize.width = 512
                    light.shadow.mapSize.height = 512
                    light.shadow.camera.near = 0.5
                    light.shadow.camera.far = 500
                }
                this.tree.push({
                    type: 'light',
                    cube:light,
                    bole: bole,
                    level: level,
                    rate: rate
                })

                data.lights -= 1;
            }

            if (config.params.useFlower) {
                let flowerColorDiffRate = config.params.flowerColorDiffRate
                let flowerDistanceDiffRate = config.params.flowerDistanceDiffRate
                let useSphereFlower = config.params.useSphereFlower
                let flowerRate=config.params.flowerRate
                if (rate < 0.5 && Math.random() < flowerRate) {
                    let cnt = Math.round(Math.random() * config.params.flowerCount + 1);
                    for (let i = 0; i < cnt; i++) {
                        if (useSphereFlower) {
                            let geometry = new THREE.SphereGeometry(Math.max(bole.size.re * 1.8, 0.02))
                            let material = new THREE.MeshStandardMaterial({
                                color: new THREE.Color(
                                    bcolor.r * rate + config.color.flower.r * (1 - rate) + (Math.random() * flowerColorDiffRate - flowerColorDiffRate/2),
                                    bcolor.g * rate + config.color.flower.g * (1 - rate) + (Math.random() * flowerColorDiffRate - flowerColorDiffRate/2),
                                    bcolor.b * rate + config.color.flower.b * (1 - rate) + (Math.random() * flowerColorDiffRate - flowerColorDiffRate/2),
                                ),
                                metalness: 0,
                                roughness: 0.5
                            })
                            let cube = new THREE.Mesh(geometry, material)
                            cube.position.set(
                                bole.point.x + dx + (bole.size.re * 2) * flowerDistanceDiffRate * (Math.random() - 0.5),
                                bole.point.y + dy + (bole.size.re * 2) * flowerDistanceDiffRate * (Math.random() - 0.5),
                                bole.point.z + dz + (bole.size.re * 2) * flowerDistanceDiffRate * (Math.random() - 0.5)
                            )
                            if (config.params.shadow) {
                                cube.castShadow = true
                                cube.receiveShadow = true
                            }
                            this.tree.push({
                                type: 'flower',
                                cube:cube,
                                bole: bole,
                                level: level,
                                rate: rate
                            })
                        } else {
                            let geometry = new THREE.CircleGeometry(Math.max(bole.size.re * 1.8, 0.03))
                            let material = new THREE.MeshStandardMaterial({
                                color: new THREE.Color(
                                    bcolor.r * rate + config.color.flower.r * (1 - rate) + (Math.random() * flowerColorDiffRate - flowerColorDiffRate/2),
                                    bcolor.g * rate + config.color.flower.g * (1 - rate) + (Math.random() * flowerColorDiffRate - flowerColorDiffRate/2),
                                    bcolor.b * rate + config.color.flower.b * (1 - rate) + (Math.random() * flowerColorDiffRate - flowerColorDiffRate/2),
                                ),
                                metalness: 0,
                                roughness: 0.5,
                                side: THREE.DoubleSide
                            })
                            let cube = new THREE.Mesh(geometry, material)
                            cube.position.set(
                                bole.point.x + dx + (bole.size.re * 2) * flowerDistanceDiffRate * (Math.random() - 0.5),
                                bole.point.y + dy + (bole.size.re * 2) * flowerDistanceDiffRate * (Math.random() - 0.5),
                                bole.point.z + dz + (bole.size.re * 2) * flowerDistanceDiffRate * (Math.random() - 0.5)
                            )
                            cube.rotation.set(
                                Math.random() * Math.PI * 2,
                                Math.random() * Math.PI * 2,
                                Math.random() * Math.PI * 2
                            )
                            if (config.params.shadow) {
                                cube.castShadow = true
                                cube.receiveShadow = true
                            }
                            this.tree.push({
                                type: 'flower',
                                cube:cube,
                                bole: bole,
                                level: level,
                                rate: rate
                            })

                        }
                    }
                }
            }

            if (config.params.useLeaf) {
                let leafColorDiffRate = config.params.leafColorDiffRate
                let leafRate=config.params.leafRate
                if (Math.random() < leafRate) {
                    let cnt = Math.round(Math.random() * config.params.leafCount + 1);
                    for (let i = 0; i < cnt; i++) {
                        if(data.leafs<0){
                            continue
                        }
                        data.leafs--
                        let lr=Math.max(bole.size.re * 1.5,0.01)
                        let geometry = new THREE.CircleGeometry(lr)
                        let material = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(
                                bcolor.r * rate + config.color.leaf.r * (1 - rate) + (Math.random() * leafColorDiffRate - leafColorDiffRate / 2),
                                bcolor.g * rate + config.color.leaf.g * (1 - rate) + (Math.random() * leafColorDiffRate - leafColorDiffRate / 2),
                                bcolor.b * rate + config.color.leaf.b * (1 - rate) + (Math.random() * leafColorDiffRate - leafColorDiffRate / 2),
                            ),
                            metalness: 0,
                            roughness: 0.5,
                            side: THREE.DoubleSide
                        })
                        let cube = new THREE.Mesh(geometry, material)
                        let lrate=Math.random()
                        let srate=Math.random()*1.7+1.3
                        cube.position.set(
                            bole.point.x + dx*lrate+lr*srate,
                            bole.point.y + dy*lrate+lr*srate,
                            bole.point.z + dz*lrate
                        )
                        cube.scale.x=srate
                        cube.rotation.set(
                            Math.random() * Math.PI * 2+lr,
                            Math.random() * Math.PI * 2+lr,
                            Math.random() * Math.PI * 2
                        )
                        if (config.params.shadow) {
                            cube.castShadow = true
                            cube.receiveShadow = true
                        }
                        this.tree.push({
                            type: 'leaf',
                            cube: cube,
                            bole: bole,
                            level: level,
                            rate: rate
                        })

                    }
                }
            }
        }
    }
}

if(true){
    const loader = new FontLoader();
    loader.load("fonts/gentilis_regular.typeface.json", function (res) {
        const geometry = new TextGeometry("threejs", {
            font: res,
            size: 0.1,
            height: 0.01
        })

        geometry.computeBoundingBox(); // 运行以后设置font的boundingBox属性对象，如果不运行无法获得。

        const material = new THREE.MeshLambertMaterial({color:0xff00ff,side:THREE.DoubleSide});

        const cube = new THREE.Mesh(geometry,material);

        cube.castShadow = true
        cube.receiveShadow = true
        //设置位置
        cube.position.x = 2-(geometry.boundingBox.max.x - geometry.boundingBox.min.x)/2; //计算出整个模型的宽度的一半
        cube.position.y = 0;
        cube.position.z = 2;

        cube.rotateY(angle2radian(45))

        group.add(cube);
    })
}


if(Math.random()<0.33){
    let grassCnt=Math.round(Math.random()*500)

    for(let i=0;i<grassCnt;i++){
        let glass= D3Tree()
        glass.config.bole.size.h=0.1
        glass.config.params.lights=0
        glass.config.params.level = Math.round(Math.random()*2+1)
        glass.config.params.branches=2
        glass.config.params.leafCount=5
        glass.config.params.leafRate=0.5
        glass.config.params.useCylinder = false
        glass.config.params.useLink=false
        glass.config.params.useFlower=Math.random()<0.5
        glass.config.params.useSphereFlower=Math.random()<0.5
        glass.config.params.flowerRate=0.3
        glass.config.bole.point={
            x: Math.random()*5-5/2,
            y: 0,
            z: Math.random()*5-5/2
        }
        glass.buildTree()
        glass.show(group)

    }
}

let d3tree = D3Tree();

function rebuildTree(){
    d3tree.config.bole.size.rb=Math.random()*0.1+0.005
    d3tree.config.bole.size.re=d3tree.config.bole.size.rb*(Math.random()*0.3+0.6)
    d3tree.config.bole.size.h=Math.max(Math.random()*1,0.3)
    let amount=12
    let level= Math.round(Math.random()*5+4)
    d3tree.config.params.level = level
    d3tree.config.params.branches= Math.round(Math.random()*(amount-level)+2)
    d3tree.config.params.useCylinder = true
    d3tree.config.params.useSphereFlower = false
    d3tree.buildTree()
}

rebuildTree()


// d3tree.show(group)
let cidx=0
let flowerCnt=0
let downFlowerCnt=0

function makeAnimate(){

    if(cidx<d3tree.tree.length){
        let item=d3tree.tree[cidx]
        let cube=item.cube

        group.add(cube)

        cube.scale.set(0,0,0)
        if(item.type=='bole'){
            gsap.to(cube.scale,{x:1,y:1,z:1,duration:Math.random()*(2*item.rate),repeat:0,yoyo:false,ease:'power1.inOut',onComplete:()=>{
                    cidx=cidx+1
                    makeAnimate()
                }})
        }else if(item.type=='leaf'){
            gsap.to(cube.scale,{x:1,y:1,z:1,duration:Math.random()*(2*item.rate),repeat:0,yoyo:false,ease:'power1.out',onComplete:()=>{
                    if(Math.random()<0.3){
                        gsap.to(cube.rotation,{y:angle2radian(Math.random()*60),duration:Math.random()*10+1,repeat:-1,yoyo:true})
                    }
                    gsap.to(cube.scale,{x:0,y:0,z:0,duration:Math.random()*20+10,repeat:0,ease:'power1:out',onComplete:()=>{
                        group.remove(cube)
                        }})

                }})
            cidx=cidx+1
            makeAnimate()
        }else if(item.type=='flower'){
            flowerCnt++
            gsap.to(cube.scale,{x:1,y:1,z:1,duration:Math.random()*10+5,repeat:0,yoyo:false,ease:'power1.inOut',onComplete:()=>{
                    setTimeout(()=>{
                        gsap.to(cube.rotation,{x:Math.PI*2,duration:Math.random()*10+1,repeat:-1})
                        gsap.to(cube.rotation,{y:Math.PI*2,duration:Math.random()*10+1,repeat:-1})
                        gsap.to(cube.rotation,{z:Math.PI*2,duration:Math.random()*10+1,repeat:-1})

                        let my=Math.min(cube.position.y,3)
                        let mx=cube.position.x+Math.random()*my-my/2
                        let mz=cube.position.z+Math.random()*my-my/2

                        gsap.to(cube.position,{y:0,x:mx,z:mz,duration:Math.random()*10+15,repeat:0,yoyo:false,ease:'power1.inOut',onComplete:()=>{
                                setTimeout(()=>{
                                    group.remove(cube)
                                    downFlowerCnt++
                                    // makeAnimate()
                                    if(flowerCnt==downFlowerCnt){
                                        while(cidx>0){
                                            if(cidx<d3tree.tree.length){
                                                group.remove(d3tree.tree[cidx].cube)
                                            }
                                            cidx--
                                        }
                                        rebuildTree()
                                        flowerCnt=0
                                        downFlowerCnt=0
                                        makeAnimate()
                                    }
                                },10*1000)
                                let wts=10
                                let wmx=Math.random()*2-2/2
                                let wmz=Math.random()*2-2/2
                                let wts1=Math.random()*6+1
                                wts-=wts1
                                gsap.to(cube.position,{
                                    z:cube.position.z+wmz*0.6,
                                    x:cube.position.x+wmx*0.6,
                                    y:Math.random()*0.3,
                                    duration:wts1,repeat:0,
                                    ease:'power1.in',
                                    onComplete:()=>{
                                        let wts2=Math.random()*4+1
                                        wts-=wts2
                                        gsap.to(cube.position,{
                                            z:cube.position.z+wmz*0.4,
                                            x:cube.position.x+wmx*0.4,
                                            y:0,
                                            ease:'power1.out',
                                            duration:wts2,repeat:0,
                                            onComplete:()=>{
                                                if(wts>0){
                                                     gsap.to(cube.scale,{
                                                         z:0,
                                                         x:0,    
                                                         y:0,
                                                         ease:'power1.out',
                                                         duration:wts,repeat:0,
                                                     })
                                                }
                                            }
                                        })
                                    }
                                })

                            }})
                    },5*1000)
                }})
            cidx=cidx+1
            makeAnimate()
        }else if(item.type=='link'){
            gsap.to(cube.scale,{x:1,y:1,z:1,duration:Math.random()*(2*item.rate),repeat:0,yoyo:false,ease:'power1.inOut',onComplete:()=>{
                    cidx=cidx+1
                    makeAnimate()
                }})
        }else{
            cube.scale.set(1,1,1)
            cidx=cidx+1
            makeAnimate()
        }

    }

}


makeAnimate()


function CubeLookAt(cube,vectorPoint){
    cube.lookAt(vectorPoint.x,vectorPoint.y,vectorPoint.z)
}

function testLookAt(){
    let material = new THREE.MeshLambertMaterial({
        color: 0xff0000
    });

    let ballGeometry=new THREE.SphereGeometry(0.1)
    let ball=new THREE.Mesh(ballGeometry,material)
    function randomBallPosition(){
        ball.position.x=Math.random()*5-2.5
        ball.position.y=Math.random()*3
        ball.position.z=Math.random()*5-2.5
    }
    randomBallPosition()
    group.add(ball)

    setInterval(function(){
        randomBallPosition()
    },5*1000)

    let cnt=Math.round(Math.random()*3)
    for(let i=0;i<cnt;i++){
        let arrow=new THREE.Group()
        let bp=D3RegularPoint(
            Math.random()*5-2.5,
                Math.random()*3,
                Math.random()*5-2.5
        )
        let ep=D3RegularPoint(
            Math.random()*5-2.5,
            Math.random()*3,
            Math.random()*5-2.5
        )
        let vp=D3VectorPoint(bp,ep)
        let sp=D3RegularPoint2SpherePoint(vp)

        let h=0.5
        let r=0.01
        let bodyGeometry = new THREE.CylinderGeometry(r, r, h)
        // 应用变换矩阵
        // 由于默认是中心点为原点，移动到底端为原点
        bodyGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -h/2, 0));
        // 由于默认是顺着Y轴，变换为顺着Z轴
        bodyGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));

        const bodyCube = new THREE.Mesh(bodyGeometry, material)
        bodyCube.position.set(0,0,0)
        arrow.add(bodyCube)

        let headGemometry=new THREE.ConeBufferGeometry(r*3,r*12)
        // 由于默认是顺着Y轴，变换为顺着Z轴
        headGemometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        const headCube=new THREE.Mesh(headGemometry,material)
        headCube.position.set(0,0,0)
        arrow.add(headCube)

        arrow.applyMatrix4(new THREE.Matrix4().makeTranslation(0, h/2, 0));
        CubeLookAt(arrow,vp)

        arrow.position.set(
            Math.random()*5-2.5,
            Math.random()*3,
            Math.random()*5-2.5
        )

        scene.add(arrow)

        setInterval(function(){
            let vec=D3VectorPoint(
                D3RegularPoint(arrow.position.x,arrow.position.y,arrow.position.z),
                D3RegularPoint(ball.position.x,ball.position.y,ball.position.z)
            )
            let svp=D3RegularPoint2SpherePoint(vec)
            svp.radius=Math.random()*0.05
            let dp=D3SpherePoint2RegularPoint(svp)
            arrow.position.set(arrow.position.x+dp.x,arrow.position.y+dp.y,arrow.position.z+dp.z)
            CubeLookAt(arrow,ball.position)
        },60)
    }


}

if(Math.random()<0.25){
    testLookAt()
}

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
const light = new THREE.PointLight(0xffffff)
light.position.set(-5, 8, 0)
light.castShadow = true // 开启阴影
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default
scene.add(light)

gsap.to(light.position,{x:5,duration:10,repeat:-1,yoyo:true,ease:'power1.inOut'})

// 23.添加环境光
const ambient = new THREE.AmbientLight('#444')
scene.add(ambient)

// 24.设置背景色
renderer.setClearColor(0x444444, 1);

// 开启阴影渲染
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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