function libusb (device) {
  this.device = device;
  this.conn = {};
}

libusb.prototype.open = function() {};

libusb.prototype.close = function() {};

libusb.prototype.setUpInterface = async function() {
  return;
};

libusb.prototype.write = async function (buffer) {
  return;
};

libusb.prototype.read = async function (length) {
  var data = Buffer.alloc(length);
  data.fill(0xFF);
  data[1] = 0x00;
  return data;
};

module.exports = libusb;
