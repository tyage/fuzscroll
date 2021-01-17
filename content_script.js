// create viewer element
const createViewer = () => {
  const renderer = document.querySelector('#renderer')
  const viewer = document.createElement('div')
  viewer.style = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: white;
`
  renderer.appendChild(viewer)
  const leftCover = document.createElement('div')
  leftCover.style = `
    position: fixed;
    top: 0;
    bottom: 0;
    background: black;
    z-index: 100;
    left: 0;
    right: 78.4%;
`
  const rightCover = document.createElement('div')
  rightCover.style = `
    position: fixed;
    top: 0;
    bottom: 0;
    background: black;
    z-index: 100;
    left: 78.4%;
    right: 0;
`
  viewer.appendChild(leftCover)
  viewer.appendChild(rightCover)
  return viewer
}
// copy image from original canvas
const loadCanvas = (viewer, viewport) => {
  const originalCanvas = viewport.querySelector('canvas')
  const transformLength = ['-21.6%', '21.6%']
  for (let i = 0; i < 2; ++i) {
    const newCanvas = originalCanvas.cloneNode()
    viewer.appendChild(newCanvas)
    newCanvas.getContext('2d').drawImage(originalCanvas, 0, 0)
    newCanvas.style.transform = `translateX(${transformLength[i]})`
  }
}
let startPageIndex
const appendCanvas = (viewer, pageIndex) => {
  const viewport0 = document.querySelector('#viewport0')
  const viewport1 = document.querySelector('#viewport1')
  // viewport1 -> viewport0 -> viewport1 ...
  const activeViewport = (pageIndex % 2 === startPageIndex % 2) ? viewport1 : viewport0
  loadCanvas(viewer, activeViewport)
}

// scroll down to load next image
const scrollLoad = (viewer) => {
  // copy image when RENDER_FINISH event triggered
  $('#renderer').one(NFBR.a6G.Event.RENDER_FINISH, (e) => {
    appendCanvas(viewer, e.renderedPage.index)
    $(viewer).on('scroll', onScroll)
  })
  
  // trigger next page event
  const e  = $.Event(NFBR.a6G.Event.CLICK)
  e.pageX = 0
  e.pageY = 200
  $('#viewer').trigger(e)
}
const onScroll = (e) => {
  const viewer = e.target
  if (viewer.scrollTop + viewer.offsetHeight * 2 > viewer.scrollHeight) {
    $(viewer).off('scroll', onScroll)
    scrollLoad(viewer)
  }
}

// wait until renderer element visible
const waitLoadingFinish = async () => {
  const waitLoader = () => new Promise(resolve => {
   const observer = new MutationObserver(mutations => {
      for (mutation of mutations) {
        if (!mutation.addedNodes) {
          return
        }
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          if (mutation.addedNodes[i].id === 'loaderStatusDialog') {
            resolve()
          }
        }
      }
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
  const waitLoaderHide = () => new Promise(resolve => {
    const loader = document.querySelector('#loaderStatusDialog')
    const observer = new MutationObserver(mutations => {
      for (mutation of mutations) {
        if (mutation.attributeName === 'style' && mutation.target.style.display === 'none') {
          resolve()
        }
      }
    })
    observer.observe(loader, { attributes: true })
  })

  if (document.querySelector('#loaderStatusDialog') === null) {
    await waitLoader()
  }
  await waitLoaderHide()
}
const init = async () => {
  const initViewer = (e) => {
    const viewer = createViewer()
    startPageIndex = e.renderedPage.index
    appendCanvas(viewer, e.renderedPage.index)
    $(viewer).on('scroll', onScroll)
    $('#renderer').on('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        $(viewer).scrollTop($(viewer).scrollTop() + $(viewer).height() / 4);
      }
      if (e.key === 'ArrowUp') {
        $(viewer).scrollTop($(viewer).scrollTop() - $(viewer).height() / 4);
      }
    })
  }
  await waitLoadingFinish()
  // wait until page rendering
  $('#renderer').one(NFBR.a6G.Event.RENDER_FINISH, (e) => {
    if ($('#spread_true').is(':checked')) {
      // turn off spread view
      $('#settingSpread label[for=spread_false]').click()
      $('#renderer').one(NFBR.a6G.Event.RENDER_FINISH, (e) => {
        initViewer(e)
      })
    } else {
      initViewer(e)
    }
  })
  $('#renderer').on(NFBR.a6G.Event.RENDER_FINISH, (e) => console.log(e))
}
init()
