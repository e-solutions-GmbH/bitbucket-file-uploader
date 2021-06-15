console.log('background script start');

function registerContentScriptInjector() {
    console.log('#registerContentScriptInjector');

    // can not use onComplete with event filters like suggested here https://developer.chrome.com/extensions/background_pages#filters
    // because it must be registered synchronously in the background script but the bitbucket-base-url is only available
    // asynchronously (because of sync storage api).
    // Why does it have to be registered synchronously? The problem only occurs when the background script is loaded
    // the first time after browser start (triggered by the declared rules for onPageChanged event whose listeners are
    // saved across browser restart, see https://developer.chrome.com/extensions/events#addingrules) on a page
    // where content script should be injected. In this case the "onComplete" event gets lost if the listener is not
    // registered synchronously, because it would be registered AFTER that page was loaded. The second time the script
    // is loaded after browser start that problem no longer exists because the onComplete listener would have been
    // registered at the first load of the background script and therefor BEFORE the page was loaded.
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete') {
            chrome.storage.sync.get('bitbucketBaseUrl', items => {
                console.log('\tstorage get: ' + JSON.stringify(items));
                console.log('\ttab url: ' + tab.url);
                if (items.bitbucketBaseUrl === undefined) {
                    console.log('\tbitbucketBaseURL undefined');
                } else if (tab.url && new URL(tab.url).hostname === new URL(items.bitbucketBaseUrl).hostname) {
                    console.log('\tbitbucketBaseURL set, injecting script');
                    chrome.tabs.executeScript(tabId, {file: 'content.js'});
                }
            });
        }
    });
}

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
registerContentScriptInjector();

console.log('background script stop');
