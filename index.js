const exec = require('child_process').exec;
const fs = require('fs');
const USER_PATH = '/Users/itrambitckii';
const BOOKMARKS_SRC_PATH = `${USER_PATH}/Library/Application Support/com.operasoftware.Opera/Bookmarks`;
const BOOKMARKS_DIR_PATH = `${USER_PATH}/Bookmarks`;

function handleBookmarksNode(node) {
    if (node.type === 'folder') {
        return node.children.forEach(child => handleBookmarksNode(child));
    } else if (node.type === 'url') {
        const { name, url } = node;
        // forward slash is prohibited in macOS
        const safeName = name.replace('/', '|');

        // console.log(`Writing ${name}...`);

        fs.writeFile(`${BOOKMARKS_DIR_PATH}/${safeName}.webloc`, `
            <?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
            <plist version="1.0">
            <dict>
                <key>URL</key>
                <string>${url}</string>
            </dict>
            </plist>
        `.trim(), function(err) {
            if(err) {
                return console.log(err);
            }

            // console.log('Success');
        });
    }
}

fs.readFile(BOOKMARKS_SRC_PATH, 'utf8', function (err, rawData) {
  if (err) {
    return console.log(err);
  }

  exec(`trash ${BOOKMARKS_DIR_PATH} || rm -rf ${BOOKMARKS_DIR_PATH}`, function () {
    fs.mkdirSync(BOOKMARKS_DIR_PATH);

    const data = JSON.parse(rawData);
    const bookmarks = data.roots;

    handleBookmarksNode(bookmarks.bookmark_bar);
  });
});
