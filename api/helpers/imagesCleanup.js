const fs = require("fs");

const imagesCleanup = (files = []) => {
  files.forEach((file) => {
    fs.unlink(file, (error) => {
      if (error) {
        fs.appendFileSync(`logs/files-not-deleted.txt`, file + "\n");
        console.log("imagesCleanup -> failed while removing picture");
      }
      console.log("imagesCleanup -> Image Removed:", file);
    });
  });
};

module.exports = imagesCleanup;
