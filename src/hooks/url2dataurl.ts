

export default () => {
  const urlToBase64 = (url: string) => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        // 将图片插入画布并开始绘制
        canvas.getContext('2d')?.drawImage(image, 0, 0)
        // result
        const result = canvas.toDataURL('image/png')
        resolve(result)
      }
      // CORS 策略，会存在跨域问题https://stackoverflow.com/questions/20424279/canvas-todataurl-securityerror
      image.setAttribute('crossOrigin', 'Anonymous')
      image.src = url
      // 图片加载失败的错误处理
      image.onerror = () => {
        reject(new Error('图片流异常'))
      }
    })
  }

  return {
    urlToBase64,
  }
}