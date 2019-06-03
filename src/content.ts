import Dropzone from 'dropzone';
import * as ejs from 'ejs';

declare var content;

Dropzone.autoDiscover = false;

// firefox needs another fetch, see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
const compatFetch = (content && content.fetch) || fetch;

chrome.storage.sync.get('bitbucketBaseUrl', items => {
    createTargetUrl().then(targetUrl => targetUrl && injectUploadSlideOut(targetUrl));
});

function injectUploadSlideOut(apiTarget) {
    const slideOutBox = <HTMLDivElement>(document.createElement('div'));

    const template = `
<div id="box">
    <div id="boxcontent">
        <div id="uploadzone">Drop file to upload here</div>
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

    const dropzone = new Dropzone('div#uploadzone', {
        url: '/',
        method: 'PUT',
        paramName: 'content',
        params: {
            sourceBranch: 'master'
        },
        processing: function (file) {
            this.options.url = apiTarget.locationPath + '/' + file.name;
        },
        sending: function (file, xhr, formData): void {
            formData.append('branch', createBranchnameFromFileName(file.name));
            formData.append('message', 'added ' + file.name + ' to directory');
        },
        complete: function (file): void {
            this.removeFile(file);
        },
        success(file, response): void {
            createPullRequest(apiTarget.repositoryPath, createBranchnameFromFileName(file.name), file.name);
        }
    });
}

function createBranchnameFromFileName(filename: string): string {
    return 'added_file_' + filename.replace(/[^a-z0-9]/gi, '_') + '_with_bitbucket_fileuploader_plugin';
}

function createPullRequest(respositoryUrl: string, branchName: string, fileName: string) {
    compatFetch(respositoryUrl + '/pull-requests', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'title': 'Uploaded file ' + fileName + ' with Bitbucket File Uploader',
            'description': 'Uploaded file ' + fileName + ' with Bitbucket File Uploader',
            'fromRef': {
                'id': 'refs/heads/' + branchName
            },
            'toRef': {
                'id': 'refs/heads/master'
            }
        })
    })
        .then(response => response.json())
        .then(value => {
            const pullRequestUrl: string = value.links.self[0].href;
            window.open(pullRequestUrl, '_blank');
        })
        .catch(reason => Error('There was a network error when creating new pull request'));
}

function createTargetUrl(): Promise<any | null> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('bitbucketBaseUrl', items => {
            const pathFragmentsMatch = window.location.pathname.match(/(\/projects\/[^/]*\/repos\/[^/]*)(\/browse\/?.*)/);
            if (!pathFragmentsMatch) {
                resolve(null);
                return;
            }

            const apiTarget = {
                bitbucketApiUrl: items.bitbucketBaseUrl + '/rest/api/1.0',
                repositoryFragment: pathFragmentsMatch[1],
                locationFragment: pathFragmentsMatch[2],
                repositoryPath: items.bitbucketBaseUrl + '/rest/api/1.0' + pathFragmentsMatch[1],
                locationPath: items.bitbucketBaseUrl + '/rest/api/1.0' + pathFragmentsMatch[1] + pathFragmentsMatch[2]
            }

            compatFetch(apiTarget.locationPath + '?type=true', {credentials: 'include'}).then(response => response.json()).then(value => {
                if (value.type === 'DIRECTORY') {
                    resolve(apiTarget);
                } else {
                    resolve(null);
                }
            }).catch(reason => reject(Error('There was a network error when trying to get location type')));
        });
    });
}
