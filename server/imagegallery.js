const fs = require('fs');
const path = require('path');
const logger = require('heroku-logger');

class ImageGallery {
    constructor(basePath) {
        this.basePath = basePath;
    }

    getImages() {
        const imagePath = path.join(this.basePath, 'images');

        const imageElements = [];

        this.recurseImages(imagePath, imageElements);

        return imageElements;
    }

    recurseImages(dir, imageElements) {
        const images = fs.readdirSync(dir, { withFileTypes: true });

        for (let img of images) {
            logger.info(img);

            if (img.isFile() && img.fileName.lower().endsWith(".jpg")) {
                imageElements.push(ImageGallery.buildHtml(img));
            } else if (img.isDirectory()) {
                this.recurseImages(img, imageElements);
            }
        }

    }

    static buildHtml(file) {
        return `
 <div class="col-sm-4 bottomReveal mb30">
     <a href="${file}" title="${file}" class="zoom">
 	    <img src="images/1.jpg" class="img-responsive img-rounded" alt="">
     </a>
 </div>
`;

    }


}

module.exports = ImageGallery;