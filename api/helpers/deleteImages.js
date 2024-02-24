const path = require("path");
const fs = require("fs");

function deleteImages(imagesToDelete) {
  const deletedProductsDir = path.join("deleted_products");

  imagesToDelete.forEach((imageToDelete) => {
    const sourcePath = path.join(imageToDelete);
    const destinationPath = path.join(
      deletedProductsDir,
      path.basename(imageToDelete)
    );

    fs.rename(sourcePath, destinationPath, (err) => {
      console.log("Deleting image:", sourcePath);
      if (err) {
        fs.appendFileSync(`logs/files-not-moved.txt`, sourcePath + "\n");
        console.log("deleteImages -> failed while moving picture");
        console.error("Error while moving image to deleted_products:", err);
      } else {
        console.log("Image moved to deleted_products successfully.");
      }
    });
  });
}

module.exports = deleteImages;
