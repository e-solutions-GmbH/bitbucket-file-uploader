const xhr = new XMLHttpRequest();

xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            // Typical action to be performed when the document is ready:
            console.log('SUCCESS!\n' + xhr.responseText);
        } else {
            console.log('ERROR!\n' + xhr.responseText);
        }
    }
};
xhr.open('GET', 'https://my.local.bitbucket/rest/api/1.0/projects/my-project/repos/development/browse/how-tos', true);
xhr.send();
console.log('sending xhr request');
