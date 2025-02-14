const turndownService = new TurndownService()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertToMarkdown') {
    const elementType = request.elementType
    const elementId = request.elementId
    let element

    // 根据 elementType 选择是用 ID 还是 class
    if (elementType === 'class') {
      element = document.querySelector('.' + elementId) // 使用 class 查找
    } else {
      element = document.getElementById(elementId) // 使用 ID 查找
    }

    if (element) {
      // 删除 <style> 标签
      turndownService.addRule('remove-style', {
        filter: 'style',
        replacement: () => '',
      })

      // 添加自定义规则删除 class 为 'code-block-extension-header' 的标签
      turndownService.addRule('remove-code-block-header', {
        filter: (node) => node.nodeType === 1 && node.classList.contains('code-block-extension-header'),
        replacement: () => '',
      })

      // 处理 <code> 标签，将其转换为 Markdown 格式的代码块
      turndownService.addRule('code-block', {
        filter: (node) => {
          // 只匹配 <code> 标签，且它的父元素是 <pre>
          return node.nodeName === 'CODE' && node.parentNode && node.parentNode.nodeName === 'PRE'
        },
        replacement: (content, node) => {
          // 获取 class 属性中的语言信息
          const languageClass = Array.from(node.classList).find((className) => className.startsWith('language-'))
          let language = ''
          if (languageClass) {
            language = languageClass.replace('language-', '')
          }

          const codeContent = content.replace(/\n/g, '  \n')
          if (language) {
            return '```' + language + '\n' + codeContent + '\n```'
          } else {
            return '```\n' + codeContent + '\n```'
          }
        },
      })

      const htmlContent = element.innerHTML
      const markdown = turndownService.turndown(htmlContent)

      // 获取页面标题
      const pageTitleElement = document.querySelector('.article-title')
      const pageTitle = pageTitleElement ? pageTitleElement.innerText : 'document'

      sendResponse({ markdown: markdown, pageTitle: pageTitle })
    } else {
      sendResponse({ error: '元素不存在时' })
    }
  }
  return true
})
