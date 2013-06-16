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
	return fibs.reduce(op.add, 0);
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

problems.p6 = function() {
	var s1 = 0;
	for(var i = 1; i <= 100; i++) {
		s1 += i*i;
	}
	var s2 = Math.pow(101*50, 2);
	return s2 - s1;
}
solutions.p6 = 25164150;

problems.p7 = function() {
	return primes[10000];
}
solutions.p7 = 104743;

problems.p8 = function() {
	var num = "7316717653133062491922511967442657474235534919493496983520312774506326239578318016984801869478851843858615607891129494954595017379583319528532088055111254069874715852386305071569329096329522744304355766896648950445244523161731856403098711121722383113622298934233803081353362766142828064444866452387493035890729629049156044077239071381051585930796086670172427121883998797908792274921901699720888093776657273330010533678812202354218097512545405947522435258490771167055601360483958644670632441572215539753697817977846174064955149290862569321978468622482839722413756570560574902614079729686524145351004748216637048440319989000889524345065854122758866688116427171479924442928230863465674813919123162824586178664583591245665294765456828489128831426076900422421902267105562632111110937054421750694165896040807198403850962455444362981230987879927244284909188845801561660979191338754992005240636899125607176060588611646710940507754100225698315520005593572972571636269561882670428252483600823257530420752963450";
	var max = 0;
	for(var i = 0; i < num.length-4; i++) {
		var product = num.slice(i,i+5).split('').map(op.num).reduce(op.mul, 1);
		max = Math.max(max, product);
	}
	return max;
}
solutions.p8 = 40824;

problems.p9 = function() {
	for(var a = 1; a < 1000/2; a++) {
		for(var b = 1; b < a; b++) {
			var c = 1000 - a - b;
			if(c*c == a*a + b*b) return a*b*c;
		}
	}
}
solutions.p9 = 31875000;

problems.p10 = function() {
	if(maxPrime < 1999993) throw "Extend the prime list to at least 2M.";
	return primes.filter(function(x){return x < 2e6;}).reduce(op.add, 1);
}
solutions.p10 = 142913828923;

