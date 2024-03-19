const update = document.getElementById('update');
const bitbucketUrl = (<HTMLInputElement>document.getElementById('bitbucketUrl'));

chrome.storage.sync.get('bitbucketBaseUrl', items => {
    bitbucketUrl.value = items.bitbucketBaseUrl;
});

update.onclick = () => {
    chrome.storage.sync.set({bitbucketBaseUrl: bitbucketUrl.value}, () => {
        console.log('bitbucket url is now: ' + bitbucketUrl.value);
    });
};
