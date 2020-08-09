// harness
var test = require('tape-promise/tape');
// test helpers
var sinon = require('sinon');
var usb = require('mock-usb');

// module to test
var libusb = require('../lib/libusb-comms');

var device = usb.findByIds(0, 1);

test('[ LIBUSB-COMMS ] method presence', function (t) {
  var b = new libusb(device);
  function isFn(name) {
    return typeof b[name] === 'function';
  };
  var methods = [
    'open',
    'close',
    'setUpInterface',
    'read',
    'write'
  ];
  for (var i = 0; i < methods.length; i += 1) {
    t.ok(isFn(methods[i]), methods[i]);
    if (i === (methods.length - 1)) {
      t.end();
    }
  }
});

test('[ LIBUSB-COMMS ] ::open', function (t) {
  var b = new libusb(device);
  var spy = sinon.spy(device, 'open');

  t.plan(1);
  b.open();
  t.ok(spy.calledOnce, 'called device.open');
});

test('[ LIBUSB-COMMS ] ::close', function (t) {
  var b = new libusb(device);
  var spy = sinon.spy(device, 'close');

  t.plan(1);
  b.close();
  t.ok(spy.calledOnce, 'called device.close');
});

test('[ LIBUSB-COMMS ] ::write', async function (t) {
  var b = new libusb(device);
  var buf = Buffer.from([0x01]);

  t.plan(1);

  b.open();
  await b.setUpInterface();

  var spy = sinon.spy(b.conn.endpointOut, 'transfer');
  await b.write(buf);
  var cond = (spy.calledOnce && spy.args[0][0] && buf.equals(spy.args[0][0]));
  t.ok(cond, 'called transfer method on correct endpoint with correct buffer arg');
});

test('[ LIBUSB-COMMS ] ::read', async function (t) {
  var b = new libusb(device);

  t.plan(1);

  b.open();
  await b.setUpInterface();

  var spy = sinon.spy(b.conn.endpointIn, 'transfer');
  await b.read(8);
  t.ok(spy.calledWith(8), 'called transfer method on correct endpoint with arg 8');
});

test('[ LIBUSB-COMMS ] ::setUpInterface', async function (t) {
  var b = new libusb(device);

  t.plan(2);

  b.open();
  await b.setUpInterface();
  t.equal(typeof b.conn.endpointOut, 'object', 'endpointOut object was set up');
  t.equal(typeof b.conn.endpointIn, 'object', 'endpointIn object was set up');
});
