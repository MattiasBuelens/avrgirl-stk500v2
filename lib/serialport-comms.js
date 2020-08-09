var async = require('async');
var c = require('./c');

function serialCom (port) {
  this.device = port;
  this.responses = [];
  var devMode = true;
  this.debug = devMode ? console.log : function() {};
};

serialCom.prototype.open = function() {
  this.device.open();
};

serialCom.prototype.setUpInterface = async function() {
  await this.openAsync();
  this.device.on('data', (data) => {
    this.debug('data', data);
    this.responses.push(data);
  });
  await this.sync();
  this.debug('sync success');
};

serialCom.prototype.close = function() {
  this.responses = [];
  this.device.close();
};

serialCom.prototype.write = function(data) {
  // this will need to swap between 200 and 1000 depending on the command
  var drainDelay = 400;

  return new Promise((resolve, reject) => {
    this.device.write(data);
    this.device.drain((error) => {
      if (error) {
        return reject(new Error(error));
      }
      setTimeout(resolve, drainDelay);
    });
  });
};

serialCom.prototype.read = async function(length) {
  //this.debug(this.responses);
  var packet = this.responses.splice(0, length);
  return packet[0];
};

serialCom.prototype.openAsync = function() {
  return new Promise((resolve) => {
    this.device.open(() => {
      resolve();
    });
  });
};

serialCom.prototype.sync = async function() {
  return new Promise((resolve, reject) => {
    var attempts = 0;
    var signon = Buffer.from(c.SEQ_SIGN_ON);
    var drainDelay = 1000;

    const check = () => {
      this.read(17, (error, data) => {
        attempts += 1;
        if (!data) {
          if (attempts < 10) {
            this.debug("trying again")
            trySync();
          } else {
            this.debug('failure')
            reject(new Error('attempt to sync with programmer failed.'));
          }
        } else {
          this.debug('success');
          resolve(data);
        }
      });
    };

    const trySync = () => {
      this.device.write(signon);
      this.device.drain((error) => {
        if (error) {
          return reject(new Error(error));
        }
        setTimeout(check, 10);
      });
    };

    trySync();
  });
};

module.exports = serialCom;
