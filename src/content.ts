function createTargetUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('bitbucketBaseUrl', items => {
            const url = items.bitbucketBaseUrl + '/rest/api/1.0' + window.location.pathname + '?type=true';
            fetch(url).then(response => response.json()).then(value => {
                if (value.type === 'DIRECTORY') {
                    resolve(url);
                } else {
                    reject(Error('Current window location is not pointing to a bitbucket directory'));
                }
            }).catch(reason => reject(Error('There was a network error')));
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'uploadRequest') {
        const targetUrl$: Promise<string> = createTargetUrl();

        targetUrl$.then(url => {
            // TODO create new commit and branch and then create pull request
            console.log(url);
            sendResponse(url);
        }).catch(err => {
            console.log('ERROR! ' + err);
            sendResponse('ERROR! ' + err);
        });

        /*
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // Typical action to be performed when the document is ready:
                    console.log('SUCCESS!\n' + xhr.responseText);
                } else {
                    console.log('ERROR!\n' + xhr.responseText);
                }
                sendResponse(xhr.responseText);
            }
        };
        xhr.open('GET', 'https://my.local.bitbucket/rest/api/1.0/projects/my-project/repos/development/browse/how-tos', true);
        xhr.send();
        console.log('sending xhr request');
        */

        // must return true to indicate that response will be sent async
        return true;
    }
});

