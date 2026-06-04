console.log('RESULT:');
/* =======================================================
   |                     TASK ZJ                         |
   =======================================================

Shart:
Shunday function yozing, u berilgan array ichidagi
raqamlarni qiymatini hisoblab qaytarsin.

MASALAN: reduceNestedArray([1, [1, 2, [4]]]); return 8;

Yuqoridagi misolda, array nested bo'lgan holdatda ham,
bizning function ularning yig'indisini hisoblab qaytarmoqda. */

/* function reduceNestedArray(arr: any[]): number {
	return arr.reduce((sum: number, item: any): number => {
		if (Array.isArray(item)) {
			return sum + reduceNestedArray(item);
		}
		return sum + item;
	}, 0);
}

console.log(reduceNestedArray([1, [1, 2, [4]]])); */

/* =======================================================
   |                     TASK ZK                         |
   =======================================================

Shart:

Shunday function yozing, u har soniyada bir marta consolega 1 dan 5 gacha 
bolgan raqamlarni chop etsin va 5 soniyadan keyin ishini toxtatsin.
MASALAN: printNumbers() */

function printNumbers() {
	let count = 1;

	const intervalId = setInterval(() => {
		console.log(count);

		count++;

		if (count > 5) {
			clearInterval(intervalId);
		}
	}, 1000);
}

printNumbers();
