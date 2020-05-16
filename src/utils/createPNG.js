const CreatePNG = require("jimp");
const Logger = require("../core/logger");

module.exports = async function createPNG(job) {
  return new Promise((resolve, reject) => {
    new CreatePNG(
      job.metadata.width,
      job.metadata.height,
      0xffffffff,
      (err, image) => {
        if (err) {
          reject(err);
        }

        Logger.info({ event: "RENDER_WRITING_PIXELS", id: job.id });
        for (const pixel of job.render_state.finished_pixels) {
          image.setPixelColor(
            CreatePNG.rgbaToInt(pixel[2], pixel[3], pixel[4], 255),
            pixel[0],
            pixel[1]
          );
        }

        Logger.info({
          event: "RENDER_WRITING_PIXELS_COMPLETED",
          id: job.id
        });
        Logger.info({ event: "RENDER_CREATING_PNG", id: job.id });
        image.getBase64(CreatePNG.MIME_PNG, (err, png) => {
          if (err) reject(err);

          resolve(png);

          Logger.info({
            event: "RENDER_CREATING_PNG_COMPLETED",
            id: job.id
          });
        });
      }
    );
  });
};
