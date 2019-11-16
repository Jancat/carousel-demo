/* 
  图片轮播：自动无缝循环、手动切换、指示灯
  原理：
    1. 将需要轮播的一排图片放到固定宽度的容器中，溢出容器外的图片将被隐藏，每次只显示一张图片
    2. 通过逐渐改变容器的偏移量来切换显示图片，实现轮播的假象
    3. 首尾图片都有替补图片来实现无缝轮播，即第一个 img 是最后一张图片，最后一个 img 是第一张图片
*/

const IMAGE_WIDTH = 600
const IMAGE_COUNT = 5
const STAY_TIME = 2 * 1000 // 图片停留时间ms
const TRANSITION_TIME = 0.4 * 1000 // 图片切换过渡时间ms，太大会造成动画不连续
const INTERVAL = 10 // 图片偏移间隔ms，太长会造成动画不连续
const SPEED = IMAGE_WIDTH / (TRANSITION_TIME / INTERVAL) // 在图片切换过程中的偏移速率
console.log('SPEED - %dpx offset each time', SPEED)

// 偏移方向
const RIGHT = 1
const LEFT = -1

let imgaeIndex = 1 // 当前图片顺序
let animated = false

// 点亮当前图片指示灯
function showIndicator(indicators) {
  for (const indicator of indicators.children) {
    indicator.classList.remove('on')
  }
  indicators.children[imgaeIndex - 1].classList.add('on')
}

// 偏移到指定图片位置
function imageTransition(gallery, offset, transition = true) {
  const newLeft = parseInt(gallery.style.left, 10) + offset
  // 连续调整图片偏移量，造成动画的视觉假象
  // 如果不要求无缝切换，则可以使用 CSS3 的 transition 属性，让偏移形成过渡动画
  function go() {
    if (
      (offset > 0 && parseInt(gallery.style.left, 10) < newLeft) ||
      (offset < 0 && parseInt(gallery.style.left, 10) > newLeft)
    ) {
      // 使用 requestAnimationFrame 使偏移动画顺畅，否则会卡顿
      window.requestAnimationFrame(() => {
        gallery.style.left =
          parseInt(gallery.style.left, 10) + Math.sign(offset) * SPEED + 'px'
        setTimeout(go, INTERVAL)
      })
    } else {
      // 图片切换完成
      animated = false
      gallery.style.left = newLeft + 'px'
      // 切换第一张图片的上一张图片，即排列顺序在第一位的最后一张图片的替补，向左偏移到最后一张图片的位置（无缝轮播，视觉假象）
      if (newLeft > -IMAGE_WIDTH) {
        gallery.style.left = -IMAGE_WIDTH * IMAGE_COUNT + 'px'
      } else if (newLeft < -IMAGE_WIDTH * IMAGE_COUNT) {
        // 切换最后一张图片的下一张图片，即排列顺序在最后一位的第一张图片的替补，向左偏移到第一张图片的位置（无缝轮播，视觉假象）
        gallery.style.left = -IMAGE_WIDTH + 'px'
      }
    }
  }

  // 顺序切换图片(过渡)或者通过点击指示灯切换到指定图片(不过渡)
  if (!transition) {
    gallery.style.left = newLeft + 'px'
  } else {
    animated = true
    go()
  }
}

// 点击指示灯展示对应图片
function indicatorsHandler(indicators, gallery) {
  // 事件代理
  indicators.addEventListener('click', event => {
    const eventTarget = event.target
    if (eventTarget.tagName === 'SPAN') {
      // 忽略当前焦点图片切换
      if (eventTarget.className === 'on') return
      const indicatorIndex = parseInt(eventTarget.dataset.index, 10)
      const offset = -IMAGE_WIDTH * (indicatorIndex - imgaeIndex)
      if (!animated) {
        imageTransition(gallery, offset, false)
      }
      imgaeIndex = indicatorIndex
      showIndicator(indicators)
    }
  })
}

window.onload = function() {
  const prev = document.getElementById('prev')
  const next = document.getElementById('next')
  const gallery = document.getElementById('gallery')
  const indicators = document.getElementById('indicators')
  const container = document.getElementById('container')

  container.addEventListener('mouseover', stop)
  container.addEventListener('mouseout', play)
  prev.addEventListener('click', previousHandler)
  next.addEventListener('click', nextHandler)

  let timer
  function play() {
    timer = setInterval(nextHandler, STAY_TIME)
  }
  function stop() {
    clearInterval(timer)
  }

  function previousHandler() {
    // 如果在图片切换过程中，则忽略该次点击切换，防止冲突
    if (animated) return

    if (imgaeIndex === 1) {
      imgaeIndex = 5
    } else {
      imgaeIndex -= 1
    }
    showIndicator(indicators)
    // 上一张图片，向右偏移
    imageTransition(gallery, RIGHT * IMAGE_WIDTH)
  }
  function nextHandler() {
    // 如果在图片切换过程中，则忽略该次点击切换，防止冲突
    if (animated) return

    if (imgaeIndex === 5) {
      imgaeIndex = 1
    } else {
      imgaeIndex += 1
    }
    showIndicator(indicators)
    // 下一张图片，向左偏移
    imageTransition(gallery, LEFT * IMAGE_WIDTH)
  }

  indicatorsHandler(indicators, gallery)
  play()
}
