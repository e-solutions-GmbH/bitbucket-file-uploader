const upload: HTMLElement = document.getElementById('upload');
const file: HTMLInputElement = (<HTMLInputElement>document.getElementById('file'));

upload.onclick = function (element) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        // new URL(tabs[0].url).pathname.split('/');
        chrome.tabs.sendMessage(
            tabs[0].id, {type: 'uploadRequest', file: file.files[0]}, xhrResp => {
                console.log('received response message');
                document.getElementById('response').style.visibility = 'visible';
                document.getElementById('responseText').innerText = xhrResp;
            });
    });
};
