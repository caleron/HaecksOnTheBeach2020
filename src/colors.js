// // this will generate a color gradient of green to yellow to red, with 20 colors in total
//
// function toHex(i) {
//   const s = Math.round(i).toString(16);
//   return s.length === 1 ? "0" + s : s;
// }
//
// for (let i = 0; i < 255; i += 25.5) {
//   console.log('"#' + toHex(i) + toHex(255) + '00",');
// }
// for (let i = 0; i < 255; i += 25.5) {
//   console.log('"#' + toHex(255) + toHex(255 - i) + '00",');
// }
const csv = {};
require("fs")
  .readFileSync("Einwohner.csv")
  .toString()
  .split("\r\n")
  .forEach(
    (s) => (csv[s.split(";")[0]] = parseInt(s.split(";")[1].replace(/\s/, "")))
  );
