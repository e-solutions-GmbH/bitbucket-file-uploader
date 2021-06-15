console.log('background script start');
// declarativeContent is not supported in Firefox extensions :(
/*
function declarePageChangedRules(bitbucketBaseUrl: URL) {
    console.log('#declarePageChangedRules: ' + bitbucketBaseUrl);
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        console.log('\tpage rules removed');
        const regex = bitbucketBaseUrl.hostname.replace(/\./g, '\\.') + '/projects/\\S+/repos/\\S+/browse[^/]*';
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {urlMatches: regex},
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
}

// we have to always refresh declared rules of onPageChanged events with new urlMatch pattern when bitbucket-base-url
// was changed by the user
chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log('#storage onChanged: ' + JSON.stringify(changes));

    if (areaName === 'sync' && 'bitbucketBaseUrl' in changes) {
        const url = new URL(changes.bitbucketBaseUrl.newValue);
        declarePageChangedRules(url);
    }
});
*/

// on installation we set a default value for the bitbucket-base-url
chrome.runtime.onInstalled.addListener(details => {
    console.log('#runtime onInstalled: ' + JSON.stringify(details));

    chrome.storage.sync.set({bitbucketBaseUrl: 'https://my.local.bitbucket'});
});

// register synchronously, see https://developer.chrome.com/extensions/background_pages#listeners
chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.storage.sync.get('bitbucketBaseUrl', items => {
        console.log('\tstorage get: ' + JSON.stringify(items));
        console.log('\ttab url: ' + details.url);
        if (items.bitbucketBaseUrl === undefined) {
            console.log('\tbitbucketBaseURL undefined');
        } else if (details.url && new URL(details.url).hostname === new URL(items.bitbucketBaseUrl).hostname) {
            console.log('\tbitbucketBaseURL set, injecting script');
            chrome.tabs.insertCSS(details.tabId, {file: 'box.css'});
            chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
        }
    });
});

console.log('background script stop');
