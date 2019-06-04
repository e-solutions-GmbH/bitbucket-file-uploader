import Dropzone from 'dropzone';
import * as ejs from 'ejs';

declare var content;

Dropzone.autoDiscover = false;

// firefox needs another fetch, see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
const compatFetch = (content && content.fetch) || fetch;

(function () {
    // only injecting upload slide out when url points to a bitbucket directory
    const locationPathApiUrls = getLocationPathApiUrlsOrNull();
    if (locationPathApiUrls) {
        getIsLocationDirectory$(locationPathApiUrls.locationPathUrl)
            .then(isCurrLocationDirectory => isCurrLocationDirectory && injectUploadSlideOut());
    }
}());

function injectUploadSlideOut() {
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
            this.options.url = getLocationPathApiUrls().locationPathUrl + '/' + file.name;
        },
        sending: function (file, xhr, formData): void {
            formData.append('branch', createBranchNameFromFileName(file.name));
            formData.append('message', 'added ' + file.name + ' to directory');
        },
        complete: function (file): void {
            this.removeFile(file);
        },
        success(file, response): void {
            createPullRequest(getLocationPathApiUrls().repositoryUrl, createBranchNameFromFileName(file.name), file.name);
        }
    });
}

function createBranchNameFromFileName(filename: string): string {
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

function getLocationPathApiUrlsOrNull(): any | null {
    const pathFragmentsMatch = window.location.pathname.match(/(\/projects\/[^/]*\/repos\/[^/]*)(\/browse\/?.*)/);
    if (!pathFragmentsMatch) {
        return null;
    }

    return {
        bitbucketApiUrl: window.location.origin + '/rest/api/1.0',
        repositoryFragment: pathFragmentsMatch[1],
        locationFragment: pathFragmentsMatch[2],
        repositoryUrl: window.location.origin + '/rest/api/1.0' + pathFragmentsMatch[1],
        locationPathUrl: window.location.origin + '/rest/api/1.0' + pathFragmentsMatch[1] + pathFragmentsMatch[2]
    };
}

function getLocationPathApiUrls() {
    const locationPathApiUrls = getLocationPathApiUrlsOrNull();
    if (locationPathApiUrls) {
        return locationPathApiUrls;
    }
    throw new Error('should not happen!');
}

function getIsLocationDirectory$(locationUrl: string): Promise<boolean | null> {
    return new Promise((resolve, reject) => {
        compatFetch(
            locationUrl + '?type=true',
            {credentials: 'include'}).then(response => response.json()).then(value => {
            if (value.type === 'DIRECTORY') {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch(reason => reject(Error('There was a network error when trying to get location type')));
    });
}
