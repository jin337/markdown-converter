document.getElementById('convertButton').addEventListener('click', () => {
  // 获取用户选择的 element 类型：ID 或 class
  const elementType = document.querySelector('input[name="elementType"]:checked').value

  // 获取用户输入的 element ID 或 class
  const elementInput = document.getElementById('elementId').value.trim()

  // 确保输入不为空
  if (!elementInput) {
    alert('请输入 ID 或 class')
    return
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'convertToMarkdown', elementType: elementType, elementId: elementInput },
      (response) => {
        if (response) {
          if (response.markdown) {
            const blob = new Blob([response.markdown], { type: 'text/markdown' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${response.pageTitle}.md`
            link.click()
          } else {
            alert('Error: ' + response.error)
          }
        } else {
          console.log('脚本内容没有响应')
        }
      }
    )
  })
})

// 设置默认值
document.querySelectorAll('input[name="elementType"]').forEach((input) => {
  input.addEventListener('change', () => {
    const elementInput = document.getElementById('elementId')
    if (document.getElementById('idOption').checked) {
      // 如果选择了 ID，设置默认值为 'article-root'
      elementInput.value = 'article-root'
      document.getElementById('titleKey').innerText = 'ID'
    } else {
      // 如果选择了 class，设置默认值为 'markdown-body'
      elementInput.value = 'markdown-body'
      document.getElementById('titleKey').innerText = 'Class'
    }
  })
})

// 初始设置默认值
if (document.getElementById('idOption').checked) {
  document.getElementById('elementId').value = 'article-root'
  document.getElementById('titleKey').innerText = 'ID'
} else {
  document.getElementById('elementId').value = 'markdown-body'
  document.getElementById('titleKey').innerText = 'Class'
}
