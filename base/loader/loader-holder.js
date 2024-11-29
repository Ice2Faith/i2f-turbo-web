(function () {

  const cacheKey = 'loader-holder-background-image'

  if (cacheKey) {
    let backgroundImage = localStorage.getItem(cacheKey)
    if (backgroundImage) {
      let maxCount = 50
      let checkCall = () => {
        let dom = document.querySelector('.loader-holder')
        if (dom) {
          dom.style.backgroundImage = backgroundImage
          return
        }
        maxCount--
        if (maxCount > 0) {
          setTimeout(() => {
            checkCall()
          }, 30)
        }
      }

      checkCall()
    }
  }

  if (cacheKey) {
    let maxCount = 50
    let storeCall = () => {
      if(document.body){
        let backgroundImage = window.getComputedStyle(document.body, null)['background-image']
        if (backgroundImage && backgroundImage != 'none') {
          localStorage.setItem(cacheKey, backgroundImage)
        }
        maxCount--
      }
      if (maxCount > 0) {
        setTimeout(() => {
          storeCall()
        }, 300)
      }
    }

    storeCall()
  }


})();
