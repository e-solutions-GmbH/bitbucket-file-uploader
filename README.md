# Table of content
1. [Introduction](#introduction)
1. [Building and installing locally](#building-and-installing-locally)
1. [Roadmap](#roadmap)

# Introduction
bitbucket-file-uploader is a Chrome & Firefox extension that adds file upload functionalities to bitbucket server web interface.

The web interface shipped with bitbucket server by default lacks this very useful feature and apparently it is not planned to be included by Atlassian, see https://bitbucket.org/site/master/issues/12656/upload-images-or-binary-files-to-the-repo. 

Currently the extension is not published in any public repository like Chrome Store or Firefox Add-ons, thus you have to build the extension yourself and manually activate it as an extension in your browser.

# Building and installing locally
Prerequisites:
* You need npm installed locally

```bash
git clone https://github.com/e-solutions-GmbH/bitbucket-file-uploader.git
cd bitbucket-file-uploader
npm install
npm run build
```

### Chrome
1. Navigate to `chrome://extensions`.
1. Check the box next to Developer Mode.
1. Choose "Load unpacked extension".
1. In the dialog, open the directory `bitbucket-file-uploader/dist/chrome`.
1. On the top right (next to the address bar) click on the bitbucket-file-uploader icon and choose "Options".
1. Input the base url of your Bitbucket (e.g. `https://bitbucket.mycompany.de`) and click "Update".

### Firefox
1. Navigate to `about:debugging#addons` to load add-on.
1. Click "Load Temporary Add-on".
1. In the dialog, open the directory `bitbucket-file-uploader/dist/ff` and select the `manifest.json` file.
1. Navigate to `about:addons` to open Add-ons Manager.
1. Choose "Options" for Bitbucket File Uploader.
1. Input the base url of your Bitbucket (e.g. `https://bitbucket.mycompany.de`) and click "Update".

# Roadmap
Below are some of the goals of this project (in order of priority):
- [x] Build as standard [web extension](https://developer.mozilla.org/de/docs/Mozilla/Add-ons/WebExtensions) to support most common browsers (chrome, firefox, ...) with a single code base
- [x] Support configuration for every local bitbucket environment (bitbucket home url)
- [x] Support easy-to-use, well integrated user interface for file uploads, including drag'n'drop
- [x] MVP that supports straight forward use-case: drag'n'drop a file into browser triggers creation of corresponding pull-request in the project
- [x] Provide comprehensive documentation in github how to build and run the extension locally
- [ ] Replace generic icons with custom ones
- [ ] Improved build infrastructure with shared base manifest file that is merged with browser specific ones and support for other OS (Windows,...)
- [ ] Support for multiple files to be uploaded in one pull-request
- [ ] Support to add file(s) uploaded to an existing pull request
- [ ] Publish the extension in Chrome Store / Firefox Add-ons etc.
