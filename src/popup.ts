const upload: HTMLElement = document.getElementById('upload');

upload.onclick = function (element) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        // new URL(tabs[0].url).pathname.split('/');
        chrome.tabs.sendMessage(
            tabs[0].id, {type: 'uploadRequest'}, xhrResp => {
                console.log('received response message');
                document.getElementById('response').style.visibility = 'visible';
                document.getElementById('responseText').innerText = xhrResp;
            });
    });
};
