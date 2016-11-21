function BitField32(nSize) {
  var nNumbers = Math.ceil(nSize/32) | 0;
  this.values = new Uint32Array(nNumbers);
}

BitField32.prototype.get = function(i) {
  var index = (i / 32) | 0;
  var bit = i % 32;
  return (this.values[index] & (1 << bit)) !== 0;
};

BitField32.prototype.set = function(i) {
  var index = (i / 32) | 0;
  var bit = i % 32;
  this.values[index] |= 1 << bit;
};

BitField32.prototype.unset = function(i) {
  var index = (i / 32) | 0;
  var bit = i % 32;
  this.values[index] &= ~(1 << bit);
};
