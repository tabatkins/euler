var problems = {};
var solutions = {};

problems.p1 = function() {
	var sum = 0;
	for(var i = 0; i < 1000; i++) {
		if(i%3 == 0 || i%5 == 0) sum+= i;
	}
	return sum;
}
solutions.p1 = 233168;

problems.p2 = function() {
	var fibs = fibLimit(4e6).filter(function(x){return x%2 == 0;});
	return fibs.reduce(function(a,b){return a+b}, 0);
}
solutions.p2 = 4613732;

problems.p3 = function() {
	var factors = factorize(600851475143);
	return Math.max.apply(Math, factors);
}
solutions.p3 = 6857;

problems.p4 = function() {
	var max = 0;
	for(var i = 1e2; i < 1e3; i++) {
		for(var j = 1e2; j < 1e3; j++) {
			var product = i*j;
			if(isPalindrome(product)) {
				max = Math.max(max, product);
			}
		}
	}
	return max;
}
solutions.p4 = 906609;

problems.p5 = function() {
	var factors = new Factors();
	for(var i = 2; i <= 20; i++) {
		factors.max(new Factors(i));
	}
	return factors.toNum();
}
solutions.p5 = 232792560;