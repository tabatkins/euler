function print(str) {
	document.body.appendChild(document.createTextNode(str));
	return str;
}

function time(func/*, args*/) {
	var args = [].slice.call(arguments,1);
	var start = +new Date;
	var answer = func.apply(undefined, args);
	var end = +new Date;
	print(answer);
	print("\nTook " + (end-start) + "ms.");
	return answer;
}

function isIterable(x) {
	if(x && typeof x.forEach == 'function') return true;
	if(typeof x == 'object') return true;
	return false;
}
function toIterable(x) {
	if(x && typeof x.forEach == 'function') return x;
	if(typeof x == 'object') {
		var map = new Map();
		for(var k in x) {
			map.set(k, x[k]);
		}
		return map;
	}
	return new Map();
}

function Set(iter) {
	this._data = {};
	if(isIterable(iter)) {
		toIterable(iter).forEach(this.add.bind(this));
	}
}
Set.prototype.constructor = Set;
Set.prototype.add = function(x) {
	this._data[x] = true;
}
Set.prototype.has = function(x) {
	return !!this._data[x];
}
Set.prototype.delete = function(x) {
	if(this.has(x)) {
		delete this._data[x];
		return true;
	}
	return false;
}
Set.prototype.clear = function() {
	var hasItems = !!this._data.length;
	this._data = {};
	return hasItems;
}
Set.prototype.forEach = function(func) {
	for(var v in this._data) {
		func.call(this, v);
	}
}
Set.prototype.values = function() {
	var arr = [];
	this.forEach(function(x){ arr.push(x); });
	return arr;
}
Set.prototype.union = function(that) {
	for(var x in that._data) {
		this.add(x);
	}
	return this;
}
Set.prototype.minus = function(that) {
	for(var x in that._data) {
		this.delete(x);
	}
	return this;
}
Set.prototype.intersect = function(that) {
	var self = this;
	this.values.forEach(function(x){ if(!that.has(x)) self.delete(x); });
}
Set.prototype.clone = function() {
	return new Set(this);
}
Set.prototype.toString = function() {
	return "Set(["+this.values()+"])";
}


function Map(iter) {
	this._data = {};
	if(isIterable(iter)) {
		var self = this;
		toIterable(iter).forEach(function(v,k){ self.set(k,v); });
	}
}
Map.prototype.constructor = Map;
Map.prototype.get = function(k) {
	return this._data[k];
}
Map.prototype.set = function(k,v) {
	this._data[k] = v;
}
Map.prototype.has = function(k) {
	return k in this._data;
}
Map.prototype.delete = function(k) {
	if(this.has(k)) {
		delete this._data[k];
		return true;
	}
	return false;
}
Map.prototype.clear = function() {
	var hasItems = !!this._data.length;
	this._data = {};
	return hasItems;
}
Map.prototype.forEach = function(func) {
	for(var k in this._data) {
		func.call(this, this._data[k], k);
	}
}
Map.prototype.reduce = function(func, accum) {
	this.forEach(function(v,k) {
		if(accum === undefined) {
			accum = v;
			return;
		}
		accum = func(accum, v, k);
	});
	return accum;
}
Map.prototype.keys = function() {
	var arr = [];
	this.forEach(function(v,k){ arr.push(k); });
	return arr;
}
Map.prototype.values = function() {
	var arr = [];
	this.forEach(function(v,k){ arr.push(v); });
	return arr;
}
Map.prototype.items = function() {
	var arr = [];
	this.forEach(function(v,k){ arr.push([k,v]); });
	return arr;
}
Map.prototype.union = function(iter, conflictFunc) {
	// conflictFunc is called whenever a key exists in both maps.
	// It's passed (thisv, thatv, k, this, that), and must return a new v.
	var that = new Map(iter);
	var self = this;
	that.forEach(function(v,k) {
		if(self.has(k)) {
			var newv = conflictFunc(self.get(k), v, k, self, that);
			self.set(k, newv);
		} else {
			self.set(k,v);
		}
	});
	return this;
}
Map.prototype.intersect = function(iter, conflictFunc) {
	// conflictFunc same as in Map#union
	var that = new Map(iter);
	var self = this;
	this.items().forEach(function(i) {
		var k = i[0], v = i[1];
		if(that.has(k)) {
			var newv = conflictFunc(v, that.get(k), k, self, that);
			set.set(k, newv);
		} else {
			set.delete(k,v);
		}
	})
}
Map.prototype.clone = function() {
	return new Map(this);
}
Map.prototype.toString = function() {
	var arr = [];
	this.forEach(function(v,k) {
		arr.push("'"+k+"':'"+v+"'");
	});
	return "Map({" + arr.join(', ') + "})";
}


function Counter(iter) {
	if(iter === undefined) iter = [];
	if(isIterable(iter)) {
		var newiter = new Map();
		toIterable(iter).forEach(function(v,k) {
			newiter.set(k, +v);
		});
		return Map.call(this, newiter);
	} else {
		return Map.call(this);
	}
}
Counter.prototype = Object.create(Map.prototype);
Counter.prototype.constructor = Counter;
Counter.prototype.get = function(k) {
	if(this.has(k)) {
		return +Map.prototype.get.call(this, k);
	} else {
		return 0;
	}
}
Counter.prototype.set = function(k,v) {
	v = +v;
	Map.prototype.set.call(this, k, v);
}
Counter.prototype.inc = function(k,v) {
	if(v === undefined) v = 1;
	v = +v;
	if(this.has(k)) {
		this.set(k, this.get(k) + v);
	} else {
		this.set(k, v);
	}
	return this.get(k);
}
Counter.prototype.dec = function(k,v) {
	if(v === undefined) v = 1;
	return this.inc(k,-v);
}
Counter.prototype.add = function(iter) {
	var that = new Counter(iter);
	var self = this;
	that.forEach(function(v,k) {
		self.inc(k,v);
	});
	return this;
}
Counter.prototype.sub = function(iter) {
	var that = new Counter(iter);
	var self = this;
	that.forEach(function(v,k) {
		self.dec(k,v);
	});
	return this;
}
Counter.prototype.min = function(iter) {
	return Map.prototype.union.call(this, iter, function(a,b){return Math.min(a,b);});
}
Counter.prototype.max = function(iter) {
	return Map.prototype.union.call(this, iter, function(a,b){return Math.max(a,b);});
}
Counter.prototype.clone = function() {
	return new Counter(this);
}
Counter.prototype.toString = function() {
	var arr = [];
	this.forEach(function(v,k) {
		arr.push("'"+k+"':"+v);
	});
	return "Counter({" + arr.join(', ') + "})";
}

function Factors(num) {
	Counter.call(this);
	if(num !== undefined) this.of(num);
}
Factors.prototype = Object.create(Counter.prototype);
Factors.prototype.constructor = Factors;
Factors.prototype.of = function(x, startIndex) {
	if(startIndex === undefined) {
		startIndex = 0;
		this.clear();
	}
	if(x == 1) return this;
	for(var i = startIndex; i < primes.length; i++) {
		var prime = primes[i];
		if(x%prime == 0) {
			this.inc(prime);
			return this.of(x/prime, i);
		}
	}
}
Factors.prototype.toNum = function() {
	var product = 1;
	this.forEach(function(e,b) {
		product *= Math.pow(b, e);
	});
	return product;
}
Factors.prototype.toString = function() {
	var arr = [];
	this.forEach(function(e,b) {
		arr.push(b+"^"+e);
	});
	return arr.join(' * ');
}
Factors.prototype.countDivisors = function() {
	var count = 1;
	this.forEach(function(e,b) {
		count *= e+1;
	});
	return count;
}

function isPrime(x) {
	if(x <= maxPrime) return !!primeMap[x];
	if(x <= maxPrime*maxPrime) return isPrimeUsingList(x);
	return isPrimeManually(x);
}

function isPrimeUsingList(x) {
	var limit = Math.sqrt(x);
	for(var i = 0; i < primes.length; i++) {
		var prime = primes[i];
		if(x % prime == 0) return false;
		if(prime > limit) return true;
	}
	return true;
}

function isPrimeManually(x) {
	// Hit the easiest cases.
	if(x%2 == 0 || x%3 == 0) return false;

	// Otherwise, we're doing the mod6 +- 1 trick,
	// since we've eliminated the other 4/6 numbers.
	var start = maxPrime + 2;
	start = Math.floor(start/6)*6;
	var limit = Math.sqrt(x);
	for(var i = start; i < limit; i++) {
		if(x % (i+1) == 0) return false;
		if(x % (i+5) == 0) return false;
		if(i > limit) return true;
	}
}

function regenPrimeList(end) {
	// Bootstrap this with:
	// var primes = [2,3,5];
	// var primeMap = {2:1,3:1,5:1};
	// var maxPrime = 5;
	for(var i = maxPrime + 2; i < end; i+=2) {
		if(isPrime(i)) primes.push(i);
	}
	print("var primes = [");
	for(var i = 0; i < primes.length; i+=100) {
		print(primes.slice(i, i+100) + ',');
	}
	print("];\n");

	print("var primeMap = {");
	for(var i = 0; i < primes.length; i+=100) {
		print(primes.slice(i, i+100).map(function(x){return x+":1"}) + ',');
	}
	print("};\n");
	print("var maxPrime = " + primes[primes.length-1] + ";");
}

function factorize(x, startIndex) {
	if(startIndex === undefined) startIndex = 0;
	if(x == 1) return [];
	for(var i = startIndex; i < primes.length; i++) {
		var prime = primes[i];
		if(x%prime == 0) {
			var factors = factorize(x/prime, i);
			factors.push(prime);
			return factors;
		}
	}
}


function fibLimit(limit) {
	var a = 1;
	var b = 2;
	var c;
	var fibs = [a,b];
	while((c = a+b) < limit) {
		a = b;
		b = c;
		fibs.push(c);
	}
	return fibs;
}


function isPalindrome(x) {
	var str = x+'';
	var len = str.length;
	for(var i = 0; i < len/2; i++) {
		if(str[i] != str[len-i-1]) return false;
	}
	return true;
}

var op = {};
op.add = op['+'] = function(a,b) { return a+b; }
op.sub = op['-'] = function(a,b) { return a-b; }
op.mul = op['*'] = function(a,b) { return a*b; }
op.div = op['/'] = function(a,b) { return a/b; }
op.num = function(a) { return +a; }
op.neg = function(a) { return -a; }
op.str = function(a) { return a+''; }

function isValidSquarePath(point, path, rows, cols) {
	for(var i in path) {
		var p = path[i];
		var n = [point[0]+p[0], point[1]+p[1]];
		if(n[0] < 0 || n[1] < 0 || n[0] >= rows || n[1] >= cols)
			return false;
	}
	return true;
}

Math.MAX_INT = Math.pow(2,53);
function Z(num, base) {
	if(!(this instanceof Z)) return new Z(num, base);
	if(base === undefined) base = num.base || Z.defaultBase;
	this.base = base;
	this.sign = 1;
	this.digits = [];
	if(!num) return this;

	if(typeof num == "number" || num instanceof Number) {
		return Z._fromNum(num, this);
	} else if(typeof num == "string" || num instanceof String) {
		return Z._fromString(num, base, this);
	} else if(num instanceof Array) {
		return Z._fromArray(num, base);
	} else if(num instanceof Z) {
		this.digits = num.digits.slice();
		return this.normalize();
	} else {
		throw TypeError("Can't understand type of first argument.");
	}
}
Z.of = function(num) {
	return new Z(num);
}
Z.lift = function(num) {
	if(num instanceof Z) return num;
	return new Z(num);
}
Z._fromNum = function(num, z) {
	if(num < 0) {
		num *= -1;
		z.sign = -1;
	}
	if(num < Z.innerBase) {
		z.digits = [num];
		return z;
	} else if(num < Math.MAX_INT) {
		z.digits = [];
		while(num > 0) {
			z.digits.push(num % Z.innerBase);
			num = Math.floor(num / Z.innerBase);
		}
		return z;
	}
	throw TypeError("Number is too large to reliably generate a Z from.");
}
Z._fromString = function(num, base, z) {
	var sign = 1;
	if(num[0] == "-") {
		num = num.slice(1);
		sign = -1;
	}
	var digits = num.split('').map(function(x){
		var digit = parseInt(x,base);
		if(Number.isNaN(digit))
			throw TypeError('"'+num+'" is not a base '+base+' number.');
		return digit;
	});
	return Z._fromArray(digits, base, sign);
}
Z._fromArray = function(num, base, sign) {
	// Put the digits in LSD order.
	var digits = num.slice().reverse();
	// First, collect input digits together into a larger base,
	// as large as I can get without overshooting innerBase,
	// for better efficiency (less steps later).
	// Then, just use Z math to do the conversion for me;
	// nothing particularly clever going on here.
	var size = Math.floor(Math.log(Z.innerBase) / Math.log(base));
	var bigDigits = Math.ceil(digits.length / size);
	var pieces = [];
	for(var i = 0; i < bigDigits; i++) {
		var offset = i*size;
		var sum = 0;
		for(var j = 0; j < size; j++) {
			sum += (digits[offset+j]||0) * Math.pow(base, j);
		}
		pieces.push(Z(sum).mul(Z(base).pow(offset)));
	}
	var result = pieces.reduce(Z.add, Z(0));
	result.sign = sign;
	return result;
}
Z._fromDigits = function(digits) {
	// This function does nothing intelligent.
	// It assumes that the digit array is in innerBase already.
	var result = new Z(0);
	result.digits = digits;
	return result;
}
Z.innerBase = Math.pow(2,25);
Z.defaultBase = 10;
Object.defineProperty(Z.prototype, "length", {
	get: function() { return this.digits.length; }
});
Z.length = function(a) {
	return Z.lift(a).length;
}
Object.defineProperty(Z.prototype, "sign", {
	get: function() {
		if(this.digits.length == 0)
			return 0;
		return this._sign;
	},
	set: function(val) {
		if(val < 0)
			this._sign = -1;
		else
			this._sign = 1;
		return val;
	}
});
Z.sign = function(a) {
	if(a instanceof Number || typeof a == "number") {
		if(a < 0) return -1;
		if(a > 0) return 1;
		return 0;
	}
	return Z.lift(a).sign;
}
Z.prototype.add = function(that) {
	// Fath-path special cases.
	if(Z.isZero(that)) return this;
	if(this.isZero()) return this.adopt(that);
	var digit;
	if(digit = Z.singleDigit(that, "allow-negative")) {
		if(this.sign == 1) this.digits[0] += digit;
		else this.digits[0] -= digit;
		if(this.digits[0] < 0 || this.digits[0] >= Z.innerBase) this.normalize();
		return this;
	}
	return this._add(Z.lift(that));
}
Z.prototype._add = function(that) {
	// Expects that to be a Z.
	// Non-destructive; this is just the shared slowpath for add/sub.
	var thisSign = this.sign;
	var thatSign = that.sign;
	var len = Math.max(this.digits.length, that.digits.length);
	if(thisSign == thatSign) {
		for(var i = 0; i < len; i++) {
			this.digits[i] = (this.digits[i]||0) + (that.digits[i]||0);
		}
		return this.normalize();
	}
	this.sign = 1;
	that.sign = 1;
	if(this.ge(that)) {
		for(var i = 0; i < len; i++) {
			this.digits[i] = (this.digits[i]||0) - (that.digits[i]||0);
		}
		this.sign = thisSign;
	} else {
		for(var i = 0; i < len; i++) {
			this.digits[i] = (that.digits[i]||0) - (this.digits[i]||0);
		}
		this.sign = thatSign;
	}
	that.sign = thatSign;
	return this.normalize();
}
Z.add = function(a,b) {
	return Z(a).add(b);
}
Z.prototype.sub = function(that) {
	// Fast-path special cases.
	if(Z.isZero(that)) return this;
	if(this.isZero()) return this.adopt(that).negate();
	var digit;
	if(digit = Z.singleDigit(that, "allow-negative")) {
		if(this.sign == 1) this.digits[0] -= digit;
		else this.digits[0] += digit;
		if(this.digits[0] < 0 || this.digits[0] >= Z.innerBase) this.normalize();
		return this;
	}
	// General case
	that = Z.lift(that).negate()
	this._add(that);
	that.negate(); // Restore original sign of that.
	return this;
}
Z.sub = function(a,b) {
	return Z(a).sub(b);
}
Z.prototype.normalize = function() {
	// Put every digit back into the range [0, 2^25)
	var carry = 0;
	for(var i = 0; i < this.length; i++) {
		var digit = this.digits[i] + carry;
		carry = Math.floor(digit / Z.innerBase);
		this.digits[i] = (digit % Z.innerBase + Z.innerBase) % Z.innerBase;
	}
	// If final carry is negative, entire number was negative.
	if(carry < 0) {
		this.sign *= -1;
		carry = -carry - 1;
		for(var i = 0; i < this.digits.length; i++)
			this.digits[i] = Z.innerBase - this.digits[i] + (i == 0 ? 0 : -1);
	}
	// If there's any final carry, add more digits.
	while(carry > 0) {
		this.digits.push(carry % Z.innerBase);
		carry = Math.floor(carry / Z.innerBase);
	}
	// Drop any leading zeros.
	for(var i = this.digits.length-1; i>=0; i--) {
		if(this.digits[i] === 0)
			this.digits.pop();
		else
			break;
	}
	return this;
}
Z.normalize = function(a) {
	return Z(a);
}
Z.prototype.negate = function() {
	this.sign *= -1;
	return this;
}
Z.negate = function(a) { 
	return Z(a).negate();
}
Z.prototype.mul = function(that) {
	// Fast-path special cases.
	if(this.isZero()) return this;
	if(Z.isZero(that)) { this.digits = []; return this; }
	var thisDigit, thatDigit;
	if(thatDigit = Z.singleDigit(that, "allow-negative")) {
		for(var i = 0; i < this.digits.length; i++)
			this.digits[i] *= thatDigit;
		return this.normalize();
	}
	// General case.
	that = Z.lift(that);
	var answerSign = this.sign * that.sign;
	var thisLength = this.digits.length;
	var thatLength = that.digits.length;
	if(thisLength < 10 || thatLength < 10) { // Experimentally determined bound.
		var thisClone = this.clone();
		// Preload this with first multiplication.
		var thatDigit = that.digits[0];
		for(var i = 0; i < thisLength; i++)
			this.digits[i] *= thatDigit;
		// Manually push multiplied digits from thisClone directly into this, shifted appropriately.
		for(var thatIndex = 1; thatIndex < thatLength; thatIndex++) {
			var thatDigit = that.digits[thatIndex];
			for(var thisIndex = 0; thisIndex < thisLength; thisIndex++) {
				this.digits[thisIndex+thatIndex] = (this.digits[thisIndex+thatIndex]||0) + thisClone.digits[thisIndex] * thatDigit;
			}
			// I have enough wiggle room that 6 or 7 additions can be done without normalizing.
			if(thatIndex%6 == 0) this.normalize();
		}
	} else {
		// Karatsuba algorithm
		var chunkLength = Math.ceil(thisLength > thatLength ? thisLength/2 : thatLength/2);
		var a2 = Z._fromDigits(this.digits.slice(0, chunkLength));
		var a1 = Z._fromDigits(this.digits.slice(chunkLength));
		var b2 = Z._fromDigits(that.digits.slice(0, chunkLength));
		var b1 = Z._fromDigits(that.digits.slice(chunkLength));
		var z0 = Z.mul(a1, b1);
		var z2 = Z.mul(a2, b2);
		var z1 = a1.add(a2).mul(b1.add(b2)).sub(z0).sub(z2);
		var result = z0._shift(chunkLength*2).add(z1._shift(chunkLength)).add(z2);
		this.digits = result.digits;
	}
	this.sign = answerSign;
	return this;
}
Z.prototype._shift = function(digits) {
	if(this.digits.length == 0) return this;
	this.digits.reverse();
	for(var i = 0; i < digits; i++)
		this.digits.push(0);
	this.digits.reverse();
	return this;
}
Z.mul = function(a,b) {
	return Z(a).mul(b);
}
Z.prototype.pow = function(exp) {
	if(Z.isZero(exp)) return this.adopt(1);
	if(this.isZero()) return this; // 0^n = 0 (Except 0^0=1, caught by previous line.)
	expDigit = Z.toNum(exp);
	if(expDigit == 1) return this;
	if(expDigit == 2) return this.mul(this);
	var digit;
	if(expDigit && (digit = this.singleDigit())) {
		if(digit == 1) return this; // 1^n = 1
		// Power of 2 fast-paths
		for(var i = 1; i < 25; i++) {
			if(digit == Math.pow(2,i) && expDigit*i <= Math.MAX_INT) return this.adopt(Z.pow2(expDigit*i));
		}
		// Computable within JS num limits (answer is less than 2^53)
		if(	(digit == 3 && expDigit <= 33) ||
			(digit == 5 && expDigit <= 22) ||
			(digit == 6 && expDigit <= 20) ||
			(digit == 7 && expDigit <= 18) ||
			(digit == 9 && expDigit <= 16) ||
			(digit <= 11 && expDigit <= 15) ||
			(digit <= 13 && expDigit <= 14) ||
			(digit <= 16 && expDigit <= 13) ||
			(digit <= 21 && expDigit <= 12) ||
			(digit <= 28 && expDigit <= 11) ||
			(digit <= 39 && expDigit <= 10) ||
			(digit <= 59 && expDigit <= 9) ||
			(digit <= 98 && expDigit <= 8) ||
			(digit <= 190 && expDigit <= 7) ||
			(digit <= 456 && expDigit <= 6) ||
			(digit <= 1552 && expDigit <= 5) ||
			(digit <= 9741 && expDigit <= 4) ||
			(digit <= 208063 && expDigit <= 3))
			return this.adopt(Math.pow(digit, expDigit));
		// Otherwise, fall through to the slow path!
	}
	var originalBase = this.clone();
	var bitPattern = Z.digitsInBase(exp, 2);
	for(var i = 1; i < bitPattern.length; i++) {
		this.square();
		if(bitPattern[i] == 1) this.mul(originalBase);
	}
	return this;
}
Z.pow = function(a,b) {
	return Z(a).pow(b);
}
Z.pow2 = function(exp) {
	// Quick 2^n - this assumes that the innerBase is a power of 2 (specifically, 2^25).
	if(Z.isZero(exp)) return new Z(1);
	exp = Z.toNum(exp);
	if(!exp) throw "Pow2 not yet implemented for numbers greater than Math.MAX_INT."
	if(exp != Math.floor(exp)) throw "Pow2 must be called with integer exponent.";
	var digits = [];
	while(exp >= 25) {
		digits.push(0);
		exp -= 25; // innerBase exponent
	}
	digits.push(Math.pow(2, exp));
	return Z._fromDigits(digits);
}
Z.prototype.square = function() {
	if(this.isZero()) return this;
	this.sign = 1;  // Squaring always gives a positive number.
	var digit;
	if(digit = this.singleDigit()) {
		this.digits[0] *= this.digits[0];
		if(this.digits[0] >= Z.innerBase) this.normalize();
		return this;
	}
	if(this.digits.length < 10) {
		var self = this;
		var result = self.digits.map(function(d, i) {
			var digits = self.digits.map(function(d2){return d*d2;}).reverse();
			for(;i > 0;i--) digits.push(0);
			return Z._fromDigits(digits.reverse());
		}).reduce(Z.add, Z(0));
		this.digits = result.digits;
		return this;
	}
	var chunkLength = Math.ceil(this.digits.length/2);
	var high = Z._fromDigits(this.digits.slice(chunkLength));
	this.digits.length = chunkLength; // truncate - one less copy!
	var low = this;
	var z0 = Z.square(high);
	var z2 = Z.square(low);
	var z1 = high.add(low).square().sub(z0).sub(z2);
	var result = z0._shift(chunkLength*2).add(z1._shift(chunkLength)).add(z2);
	this.digits = result.digits;
	return this;
}
Z.square = function(a) {
	return Z(a).square();
}
Z.prototype.powmod = function(exponent, modulus) {
	if(Z.isZero(modulus)) throw "Division by 0 is not allowed.";
	if(Z.isZero(exponent)) return this.adopt(1);
	if(this.isZero()) return this;
	if(Z.toNum(exponent) == 1) return this.mod(modulus);
	var digit;
	if(digit = Z.singleDigit(modulus)) {
		var base = this.mod(digit).digits[0];
		var accum = base;
		var bitPattern = Z.digitsInBase(exponent, 2);
		for(var i = 1; i < bitPattern.length; i++) {
			accum = accum * accum % digit;
			if(bitPattern[i] == 1) accum = accum * base % digit;
		}
		return this.adopt(accum);
	}
	var base = this.mod(modulus).clone();
	var bitPattern = Z.digitsInBase(exponent, 2);
	for(var i = 1; i < bitPattern.length; i++) {
		this.square().mod(modulus);
		if(bitPattern[i] == 1) this.mul(base).mod(modulus);
	}
	return this;
}
Z.powmod = function(a,b,c) {
	return Z(a).powmod(b,c);
}
Z.prototype.divmod = function(divisor, remainderPositive) {
	if(Z.isZero(divisor)) throw "Division by 0 is not allowed.";
	if(this.isZero()) return [this, 0];
	if(Z.singleDigit(divisor)) {
		divisor = Z.singleDigit(divisor);
		if(this.singleDigit()) {
			var dividend = this.singleDigit();
			return [Z(Math.floor(dividend/divisor)), dividend % divisor];
		}
		var mod = 0;
		for(var i = this.length-1; i >= 0; i--) {
			var digit = this.digits[i] + mod * Z.innerBase;
			mod = digit % divisor;
			this.digits[i] = Math.floor(digit / divisor);
		}
		if(mod < 0 && remainderPositive == "positive") mod += divisor;
		return [this.normalize(), mod];
	} else {
		divisor = Z.lift(divisor);
		remainder = new Z(0);
		for(var i = this.digits.length -1; i >= 0; i--) {
			var digit = this.digits[i];
			remainder.digits.unshift(digit);
			if(remainder.lt(divisor)) {
				// Fast-path, since this'll be common and it's slow to find via binary-search.
				var factor = 0;
			} else {
				var factor = Z._divmodFindFactor(divisor, remainder, 0, Z.innerBase-1);
			}
			this.digits[i] = factor;
			remainder.sub(Z(factor).mul(divisor)); // replace with mod later
		}
		this.normalize();
		remainder.sign = this.sign;
		this.sign *= divisor.sign;
		if(remainder.isNeg() && remainderPositive == "positive") remainder.add(divisor);
		return [this.normalize(), remainder];
	}
}
Z._divmodFindFactor = function(divisor, remainder, low, high) {
	// Binary search to find largest n that satisfies `divisor * n <= remainder`
	var mid = Math.ceil((low+high)/2);
	var mul = Z(mid).mul(divisor);
	if(mul.gt(remainder)) return Z._divmodFindFactor(divisor, remainder, low, mid-1);
	if(mul.eq(remainder) || Z(mul).add(divisor).gt(remainder)) return mid;
	return Z._divmodFindFactor(divisor, remainder, mid+1, high);
}
Z.divmod = function(a,b) {
	return Z(a).divmod(b);
}
Z.prototype.div = function(divisor) {
	return this.divmod(divisor)[0];
}
Z.div = function(a,b) {
	return Z(a).divmod(b)[0];
}
Z.prototype.mod = function(modulus, remainderPositive) {
	if(Z.isZero(modulus)) throw "Division by 0 is not allowed.";
	if(this.isZero()) return this;
	var digit;
	if(digit = Z.singleDigit(modulus)) {
		if(this.toNum()) return this.adopt(this.toNum() % digit);
		accumulatedBaseMod = 1;
		var sum = 0;
		for(var i = 0; i < this.digits.length; i++) {
			sum = (this.digits[i]%digit * accumulatedBaseMod + sum) % digit;
			accumulatedBaseMod = accumulatedBaseMod * Z.innerBase % digit;
		}
		this.digits[0] = sum;
		this.digits.length = 1;
		if(remainderPositive == "positive")
			this.sign = 1;
		else if (this.sign == -1)
			this.digits[0] = digit - this.digits[0];
		return this;
	}
	// For now, just use the full divmod algo.
	// Complexity of multi-digit mod is high enough to not be worth implementing yet.
	return this.adopt(this.divmod(modulus, remainderPositive)[1]);
}
Z.mod = function(a,b,remainderPositive) {
	return Z(a).mod(b, remainderPositive);
}
Z.prototype.lt = function(that) {
	that = new Z(that);
	if(this.digits.length < that.digits.length) return true;
	if(this.digits.length > that.digits.length) return false;
	if(this.sign < that.sign) return true;
	if(this.sign > that.sign) return false;
	for(var i = this.length - 1; i >= 0; i--) {
		if(this.digits[i] < that.digits[i])
			return true;
		if(this.digits[i] > that.digits[i])
			return false;
	}
	return false;
}
Z.prototype.eq = function(that) {
	that = new Z(that);
	if(this.digits.length != that.digits.length) return false;
	if(this.sign != that.sign) return false;
	for(var i = 0; i < this.length; i++) {
		if(this.digits[i] != that.digits[i])
			return false;
	}
	return true;
}
Z.prototype.ne = function(that) { return !this.eq(that); }
Z.prototype.ge = function(that) { return !this.lt(that); }
Z.prototype.le = function(that) { return this.eq(that) || this.lt(that); }
Z.prototype.gt = function(that) { return !this.le(that); }
Z.lt = function(a,b) { return Z.lift(a).lt(b); }
Z.le = function(a,b) { return Z.lift(a).le(b); }
Z.gt = function(a,b) { return Z.lift(a).gt(b); }
Z.ge = function(a,b) { return Z.lift(a).ge(b); }
Z.eq = function(a,b) { return Z.lift(a).eq(b); }
Z.ne = function(a,b) { return Z.lift(a).ne(b); }
Z.prototype.isZero = function() {
	for(var i = 0; i < this.digits.length; i++)
		if(this.digits[i] != 0) return false;
	return true;
}
Z.isZero = function(a) {
	if(a instanceof Number || typeof a == "number") return a == 0;
	return Z.lift(a).isZero();
}
Z.prototype.singleDigit = function(allowNegative) {
	// Many functions can be optimized for single-digit Zs.
	// If the Z is single-digit, returns that digit. This is a truthy value.
	// Note, this returns false for 0; use isZero() instead.
	if(this.digits.length == 1) {
		if(allowNegative === "allow-negative") return this.digits[0] * this.sign;
		if(this.sign == 1) return this.digits[0];
	}
	return false;
}
Z.singleDigit = function(a, allowNegative) {
	if((a instanceof Number || typeof a == "number") && a < Z.innerBase) {
		if(a > 0) return a;	
		if(allowNegative == "allow-negative" && a > -Z.innerBase) return a;
	} 
	return Z.lift(a).singleDigit();
}
Z.prototype.toNum = function() {
	// Converts the Z into a JS num, if possible; otherwise returns false.
	if(this.isZero()) return 0;
	if(this.singleDigit()) return this.singleDigit() * this.sign;
	if(this.digits.length == 2) return (this.digits[0] + this.digits[1]*Z.innerBase)*this.sign;
	if(this.digits.length == 3 && this.digits[3] < 8)
		return (this.digits[0] + this.digits[1]*Z.innerBase + this.digits[2]*Z.innerBase*Z.innerBase)*this.sign;
	return false;
}
Z.toNum = function(a) {
	if((a instanceof Number || typeof a == "number") && a >= -Math.MAX_INT && a <= Math.MAX_INT) return a;
	return Z.lift(a).toNum();
}
Z.prototype.isPos = function() {
	return this.sign == 1;
}
Z.isPos = function(a) {
	if(a instanceof Number || typeof a == "number") return a > 0;
	return Z.lift(a).isPos();
}
Z.prototype.isNeg = function() {
	return this.sign == -1;
}
Z.isNeg = function(a) {
	if(a instanceof Number || typeof a == "number") return a < 0;
	return Z.lift(a).isNeg();
}
Z.prototype.clone = function() {
	return new Z(this);
}
Z.clone = Z.of;
Z.prototype.adopt = function(that) {
	// Mutates this to have the same value as that.
	return Z.call(this, Z.lift(that));
}
Z.adopt = function(a,b) {
	return Z.lift(a).adopt(b);
}
Z.prototype.digitsInBase = function(base) {
	base = Math.floor(base || this.base);
	var num = new Z(this);
	var digits = [];
	do {
		var result = num.divmod(base);
		digits.push(result[1]);
		num = result[0];
	} while(!num.isZero());
	return digits.reverse();
}
Z.digitsInBase = function(a, base) {
	return Z.lift(a).digitsInBase(base);
}
Z.prototype.toString = function(base) {
	base = Math.floor(base || this.base);
	if(base < 2 || base > 36)
		throw TypeError("Can only toString a Z when 2 <= base <= 36.");
	var result = this.digitsInBase(base).map(function(x){return x.toString(base);}).join('');
	if(this.sign == -1)
		result = "-" + result;
	return result;
}
Z.toString = function(a, base) {
	if(a instanceof Number || typeof a == "number") return a.toString(base);
	return Z.lift(a).toString(base);
}
Z.prototype.valueOf = function() {
	var val = this.toNum();
	if(val !== false) return val;
	return NaN;
}
Z.prototype.__traceToString__ = function() { return "Z("+(this.sign<0?'-':'+')+this.digits+")"; }


String.prototype.repeat = function(num) {
	return Array(num+1).join(this);
}
function traceClass(c, instanceStringifier) {
	var oldToString = c.prototype.toString;
	if(typeof instanceStringifier == "function") {
		c.prototype.toString = instanceStringifier;
	} else if("__traceToString__" in c.prototype) {
		c.prototype.toString = c.prototype.__traceToString__;
	} else {
		c.prototype.toString = function() { return "[object "+c.name+"]"; }
	}
	var newStringifier = function(a) { if(a === c) return "[class "+c.name+"]"; return a+''; }
	for(method in c.prototype) {
		if(method == "toString" || method == "__traceToString__") continue;
		traceMethod(c.prototype, method, newStringifier);
	}
	for(method in c) traceMethod(c, method, newStringifier);
	c.prototype._oldToString = oldToString;
};
traceClass.level = 0;
function traceMethod(object, methodName, stringifier) {
	if(typeof object[methodName] == "function") {
		var oldmethod = object[methodName];
		object[methodName] = function() {
			var enterPrefix = "-".repeat(traceClass.level);
			var returnPrefix = " ".repeat(traceClass.level);
			traceClass.level++;
			if(traceClass.level > 20) { traceClass.level = 0; throw Error("Too much recursion!"); }
			var args = [].slice.call(arguments);
			console.log(enterPrefix+"Entering "+methodName+"("+args.map(stringifier)+") on "+stringifier(this));
			var result = oldmethod.apply(this, args);
			console.log(returnPrefix+"Returning "+stringifier(result));
			traceClass.level--;
			return result;
		};
	}

}


function memoize(func) {
	var memo = new Map();
	var newfunc = function() {
		var args = [].slice.call(arguments);
		if(memo.has(args))
			return memo.get(args);
		var result = func.apply(this, args);
		memo.set(args, result);
		return result;
	}
	newfunc.memo = memo;
	return newfunc;
}
