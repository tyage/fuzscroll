const injectScript = (file) => {
    const script = document.createElement('script')
    script.setAttribute('src', file)
    document.body.appendChild(script)
}
injectScript(chrome.extension.getURL('content_script.js'));
