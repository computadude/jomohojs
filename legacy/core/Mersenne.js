define([], function(){

	// this program is a JavaScript version of Mersenne Twister,
	// a straight conversion from the original program, mt19937ar.c,
	// translated by y. okada on july 17, 2006.
	// and modified a little at july 20, 2006, but there are not any substantial differences.
	// converted to a JavaScript Class and put inside a closure on april 8, 2011 by Moritz Laass
	// in this program, procedure descriptions and comments of original source code were not removed.
	// lines commented with //c// were originally descriptions of c procedure. and a few following lines are appropriate JavaScript descriptions.
	// lines commented with /* and */ are original comments.
	// lines commented with // are additional comments in this JavaScript version.
	/*
	   A C-program for MT19937, with initialization improved 2002/1/26.
	   Coded by Takuji Nishimura and Makoto Matsumoto.

	   Before using, initialize the state by using init_genrand(seed)
	   or init_by_array(init_key, key_length).

	   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
	   All rights reserved.

	   Redistribution and use in source and binary forms, with or without
	   modification, are permitted provided that the following conditions
	   are met:

	     1. Redistributions of source code must retain the above copyright
	        notice, this list of conditions and the following disclaimer.

	     2. Redistributions in binary form must reproduce the above copyright
	        notice, this list of conditions and the following disclaimer in the
	        documentation and/or other materials provided with the distribution.

	     3. The names of its contributors may not be used to endorse or promote
	        products derived from this software without specific prior written
	        permission.

	   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
	   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
	   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
	   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


	   Any feedback is very welcome.
	   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
	   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
	*/

	var Mersenne = (function (){
		/* Period parameters */
		//c//#define N 624
		//c//#define M 397
		//c//#define MATRIX_A 0x9908b0dfUL   /* constant vector a */
		//c//#define UPPER_MASK 0x80000000UL /* most significant w-r bits */
		//c//#define LOWER_MASK 0x7fffffffUL /* least significant r bits */
		var N = 624;
		var M = 397;
		var MATRIX_A = 0x9908b0df;   /* constant vector a */
		var UPPER_MASK = 0x80000000; /* most significant w-r bits */
		var LOWER_MASK = 0x7fffffff; /* least significant r bits */
		
		//c//static unsigned long mt[N]; /* the array for the state vector  */
		//c//static int mti=N+1; /* mti==N+1 means mt[N] is not initialized */
		var mt = new Array(N);   /* the array for the state vector  */
		var mti = N+1;           /* mti==N+1 means mt[N] is not initialized */
	
		function unsigned32 (n1) // returns a 32-bits unsiged integer from an operand to which applied a bit operator.
		{
			return n1 < 0 ? (n1 ^ UPPER_MASK) + UPPER_MASK : n1;
		}
	
		function subtraction32 (n1, n2) // emulates lowerflow of a c 32-bits unsiged integer variable, instead of the operator -. these both arguments must be non-negative integers expressible using unsigned 32 bits.
		{
			return n1 < n2 ? unsigned32((0x100000000 - (n2 - n1)) & 0xffffffff) : n1 - n2;
		}
	
		function addition32 (n1, n2) // emulates overflow of a c 32-bits unsiged integer variable, instead of the operator +. these both arguments must be non-negative integers expressible using unsigned 32 bits.
		{
			return unsigned32((n1 + n2) & 0xffffffff)
		}
	
		function multiplication32 (n1, n2) // emulates overflow of a c 32-bits unsiged integer variable, instead of the operator *. these both arguments must be non-negative integers expressible using unsigned 32 bits.
		{
			var sum = 0;
			for (var i = 0; i < 32; ++i){
				if ((n1 >>> i) & 0x1){
					sum = addition32(sum, unsigned32(n2 << i));
				}
			}
			return sum;
		}
		var Mersenne = function(){
			this.mt = new Array(N);   /* the array for the state vector  */
			this.mti = N+1;           /* mti==N+1 means mt[N] is not initialized */
		};
	
		/* initializes mt[N] with a seed */
		//c//void init_genrand(unsigned long s)
		Mersenne.prototype.init_genrand = function (s)
		{
			//c//mt[0]= s & 0xffffffff;
			this.mt[0]= unsigned32(s & 0xffffffff);
			for (mti=1; mti<N; mti++) {
				this.mt[this.mti] = 
				//c//(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti);
				addition32(multiplication32(1812433253, unsigned32(this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30))), mti);
				/* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
				/* In the previous versions, MSBs of the seed affect   */
				/* only MSBs of the array mt[].                        */
				/* 2002/01/09 modified by Makoto Matsumoto             */
				//c//mt[mti] &= 0xffffffff;
				this.mt[this.mti] = unsigned32(this.mt[this.mti] & 0xffffffff);
				/* for >32 bit machines */
			}
		};
	
		/* generates a random number on [0,0xffffffff]-interval */
		//c//unsigned long genrand_int32(void)
		Mersenne.prototype.genrand_int32 = function ()
		{
			//c//unsigned long y;
			//c//static unsigned long mag01[2]={0x0UL, MATRIX_A};
			var y;
			var mag01 = new Array(0x0, MATRIX_A);
			/* mag01[x] = x * MATRIX_A  for x=0,1 */
	
			if (this.mti >= N) { /* generate N words at one time */
				//c//int kk;
				var kk;
	
				if (this.mti == N+1)   /* if init_genrand() has not been called, */
					init_genrand(5489); /* a default initial seed is used */
	
				for (kk=0;kk<N-M;kk++) {
					//c//y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
					//c//mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1];
					y = unsigned32((this.mt[kk]&UPPER_MASK)|(this.mt[kk+1]&LOWER_MASK));
					this.mt[kk] = unsigned32(this.mt[kk+M] ^ (y >>> 1) ^ mag01[y & 0x1]);
				}
				for (;kk<N-1;kk++) {
					//c//y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
					//c//mt[kk] = mt[kk+(M-N)] ^ (y >> 1) ^ mag01[y & 0x1];
					y = unsigned32((this.mt[kk]&UPPER_MASK)|(this.mt[kk+1]&LOWER_MASK));
					this.mt[kk] = unsigned32(this.mt[kk+(M-N)] ^ (y >>> 1) ^ mag01[y & 0x1]);
				}
				//c//y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
				//c//mt[N-1] = mt[M-1] ^ (y >> 1) ^ mag01[y & 0x1];
				y = unsigned32((this.mt[N-1]&UPPER_MASK)|(this.mt[0]&LOWER_MASK));
				this.mt[N-1] = unsigned32(this.mt[M-1] ^ (y >>> 1) ^ mag01[y & 0x1]);
				this.mti = 0;
			}
	
			y = this.mt[this.mti++];
	
			/* Tempering */
			//c//y ^= (y >> 11);
			//c//y ^= (y << 7) & 0x9d2c5680;
			//c//y ^= (y << 15) & 0xefc60000;
			//c//y ^= (y >> 18);
			y = unsigned32(y ^ (y >>> 11));
			y = unsigned32(y ^ ((y << 7) & 0x9d2c5680));
			y = unsigned32(y ^ ((y << 15) & 0xefc60000));
			y = unsigned32(y ^ (y >>> 18));
	
			return y;
		};
	
		/* generates a random number on [0,1]-real-interval */
		//c//double genrand_real1(void)
		Mersenne.prototype.genrand_real1= function()
		{
			return this.genrand_int32()*(1.0/4294967295.0);
			/* divided by 2^32-1 */
		};
	
		/* generates a random number on [0,1)-real-interval */
		//c//double genrand_real2(void)
		Mersenne.prototype.genrand_real2 = function ()
		{
			return this.genrand_int32()*(1.0/4294967296.0);
			/* divided by 2^32 */
		};
	
		/* generates a random number on (0,1)-real-interval */
		//c//double genrand_real3(void)
		Mersenne.prototype.genrand_real3 = function()
		{
			return ((this.genrand_int32()) + 0.5)*(1.0/4294967296.0);
			/* divided by 2^32 */
		};
	
		Mersenne.prototype.seed = function(s){
			init_genrand(s);
		};
		Mersenne.prototype.random = function(a, b){
			if(typeof(a)==='undefined'){
				return this.genrand_real3();
			}
			else if(typeof(b)==='undefined'){
				return this.genrand_real3()*a;
			}else{
				return a+ (this.genrand_real3()*(b-a));
			}
		};
		
		return Mersenne;
	})();
	
	return Mersenne;	
});