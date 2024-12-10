/**
 * 使用介绍
 * <link rel='stylesheet' href='./animation-background-square.css' />
 * <script src="./animation-background-square.js"></script>
 */

function initAnimationBackgroundSquireStyle(childCnt=10) {
  let id = "animation-background-square-style"
  let styleDom = document.head.querySelector('#' + id)
  if (styleDom) {
    return
  }
  styleDom = document.createElement('style')
  styleDom.id = id
  let content=''
  let randInt=function(bound){
    return Math.round(Math.random()*bound)
  }
  for (let i = 0; i < childCnt; i++) {
    let rate=Math.round(i*10000/childCnt)/100+randInt(5)
    let delay=randInt(500)/100+3
    let duration=randInt(900)/100+3
    let bgColor=`rgb(${randInt(56)+200},${randInt(56)+200},${randInt(56)+200})`
    content+='\n' +
      `.animation-background-square >li:nth-child(${i}){\n` +
      `  left: ${rate}%;\n `  +
      `  animation-delay: -${delay}s;\n  ` +
      `  animation-duration: ${duration}s;\n` +
      `  background-color: ${bgColor};\n` +
      `}\n`
  }
  styleDom.innerHTML=content
  document.head.append(styleDom)
}

function initAnimationBackgroundSquireElement(childCnt=10){
  let domList = document.querySelectorAll('.animation-background-square')
  for (let i = 0; i < domList.length; i++) {
    let dom=domList[i]
    let childrenNodes=dom.childNodes
    for (let j = childrenNodes.length; j < childCnt; j++) {
      let childDom = document.createElement('li')
      dom.appendChild(childDom)
    }
  }
}

function initAnimationBackgroundSquireInterval(childCnt){
  let timerId='initAnimationBackgroundSquireInterval_timer'
  if(window[timerId]){
    return
  }
  if(!childCnt){
    let width=window.innerWidth
    childCnt=Math.round((width/1080)*24)
  }
  let callback=()=>{
    initAnimationBackgroundSquireStyle(childCnt)
    initAnimationBackgroundSquireElement(childCnt)
  }

  callback()
  window[timerId]=setInterval(()=>{
    callback()
  },300)
}

initAnimationBackgroundSquireInterval()
