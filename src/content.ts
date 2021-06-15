import * as ejs from 'ejs';

declare var content;

// firefox needs another fetch, see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
const compatFetch = (content && content.fetch) || fetch;

chrome.storage.sync.get('bitbucketBaseUrl', items => {
    const matcher = new RegExp(escapeRegExp(items.bitbucketBaseUrl) + '/projects/\\S+/repos/\\S+/browse[^/]*');
    if (matcher.test(window.location.href)) {
        injectUploadSlideOut();
    }
});

function injectUploadSlideOut() {
    const slideOutBox = <HTMLDivElement>(document.createElement('div'));

    const template = `
<div id="box">
    <div id="boxcontent">
        <div id="uploadzone">Drop file to upload here</div>
        <span id="progress">Progress: 0%</span>
    </div>
    <div id="boxbutton"></div>
</div>
`;

    const html = ejs.render(template);
    slideOutBox.innerHTML = html;
    document.body.appendChild(slideOutBox);
    const box = document.getElementById('box');
    document.getElementById('boxbutton').addEventListener('click', () => {
        if (!box.classList.contains('moveboxchanger')) {
            box.classList.add('moveboxchanger');
        } else {
            box.classList.remove('moveboxchanger');
        }
    });
}

function createTargetUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('bitbucketBaseUrl', items => {
            const url = items.bitbucketBaseUrl + '/rest/api/1.0' + window.location.pathname + '?type=true';

            compatFetch(url, {credentials: 'include'}).then(response => response.json()).then(value => {
                if (value.type === 'DIRECTORY') {
                    resolve(url);
                } else {
                    reject(Error('Current window location is not pointing to a bitbucket directory'));
                }
            }).catch(reason => reject(Error('There was a network error')));
        });
    });
}

function uploadFileToBitbucket() {
    const targetUrl$: Promise<string> = createTargetUrl();

    targetUrl$.then(url => {
            // TODO create new commit and branch and then create pull request
            console.log(url);
        }
    ).catch(err => {
        console.log('ERROR! ' + err);
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
