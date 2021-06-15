chrome.runtime.onInstalled.addListener(function () {
    let bitbucketBaseUrl: URL = new URL('https://my.local.bitbucket');

    chrome.storage.sync.set({bitbucketHost: 'https://my.local.bitbucket'});
    chrome.storage.sync.get('bitbucketHost', data => {
        console.log('baseUrl is ' + data.bitbucketHost);
        bitbucketBaseUrl = new URL(data.bitbucketHost);
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        const regex = bitbucketBaseUrl.hostname.replace(/\./g, '\\.') + '/projects/\\S+/repos/\\S+/browse[^/]*';
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {urlMatches: regex},
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' && new URL(tab.url).hostname === bitbucketBaseUrl.hostname) {
            chrome.tabs.executeScript(tabId, {file: 'content.js'});
        }
    });
});
