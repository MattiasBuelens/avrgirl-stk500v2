function libusb (device) {
  this.device = device;
  this.conn = {};
  // *shakes fist at OSX*
  if (process.platform.toLowerCase() === 'darwin') {
    fixOSX.call(this);
  }
}

function fixOSX() {
  (function(self, __open) {
    self.device.__open = function() {
      __open.call(this);
      // injecting this line here to alleviate a bad error later
      this.__claimInterface(0);
    };
  })(this, this.device.__open);
};

libusb.prototype.open = function() {
  this.device.open();
};

libusb.prototype.close = function() {
  this.device.close();
};

libusb.prototype.setUpInterface = async function () {
  if (!this.device.interfaces) { throw new Error('Failed to set up interface: device is not currently open.'); }
  var endpoints = this.device.interfaces[0].endpoints;
  function checkep(ep) { return ep.direction === this.toString(); }

  var epin = endpoints.filter(checkep, 'in');
  var epout = endpoints.filter(checkep, 'out');

  if (!epin.length || !epout.length) {
    throw new Error('Failed to set up interface: could not find endpoint(s).');
  }

  this.conn.endpointOut = epout[0];
  this.conn.endpointIn = epin[0];
};

libusb.prototype.write = function (buffer) {
  return new Promise((resolve, reject) => {
    this.conn.endpointOut.transfer(buffer, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

libusb.prototype.read = function (length) {
  return new Promise((resolve, reject) => {
    this.conn.endpointIn.transfer(length, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = libusb;
