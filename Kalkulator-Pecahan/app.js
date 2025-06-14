const { createApp, ref } = Vue;

createApp({
    setup() {
        const fraction1 = ref('');
        const fraction2 = ref('');
        const operation = ref('+');
        const showResult = ref(false);
        const steps = ref('');
        const finalResult = ref('');
        
        function resetCalculation() {
            showResult.value = false;
            steps.value = '';
            finalResult.value = '';
        }
        
        function parseFraction(input) {
            if (!input) return null;
            
            const mixedNumberMatch = input.match(/^(\d+)\s+(\d+)\/(\d+)$/);
            const fractionMatch = input.match(/^(\d+)\/(\d+)$/);
            const wholeNumberMatch = input.match(/^(\d+)$/);
            
            if (mixedNumberMatch) {
                const whole = parseInt(mixedNumberMatch[1]);
                const numerator = parseInt(mixedNumberMatch[2]);
                const denominator = parseInt(mixedNumberMatch[3]);
                return {
                    numerator: whole * denominator + numerator,
                    denominator: denominator,
                    original: `${whole} ${numerator}/${denominator}`,
                    isMixed: true
                };
            } else if (fractionMatch) {
                return {
                    numerator: parseInt(fractionMatch[1]),
                    denominator: parseInt(fractionMatch[2]),
                    original: `${fractionMatch[1]}/${fractionMatch[2]}`,
                    isMixed: false
                };
            } else if (wholeNumberMatch) {
                return {
                    numerator: parseInt(wholeNumberMatch[1]),
                    denominator: 1,
                    original: wholeNumberMatch[1],
                    isMixed: false
                };
            }
            return null;
        }
        
        function gcd(a, b) {
            return b ? gcd(b, a % b) : a;
        }
        
        function simplifyFraction(numerator, denominator) {
            const divisor = gcd(numerator, denominator);
            const simplifiedNum = numerator / divisor;
            const simplifiedDen = denominator / divisor;
            
            return {
                numerator: simplifiedNum,
                denominator: simplifiedDen,
                isImproper: simplifiedNum > simplifiedDen
            };
        }
        
        function toMixedNumber(numerator, denominator) {
            const whole = Math.floor(numerator / denominator);
            const remainder = numerator % denominator;
            
            if (remainder === 0) {
                return whole.toString();
            } else if (whole === 0) {
                return `${remainder}/${denominator}`;
            } else {
                return `${whole} ${remainder}/${denominator}`;
            }
        }
        
        function formatFraction(numerator, denominator) {
            if (denominator === 1) {
                return numerator.toString();
            }
            return `<div class="fraction">
                <span class="numerator">${numerator}</span>
                <span class="denominator">${denominator}</span>
            </div>`;
        }
        
        function calculate() {
            const frac1 = parseFraction(fraction1.value);
            const frac2 = parseFraction(fraction2.value);
            
            if (!frac1 || !frac2) {
                alert('Masukkan pecahan yang valid (contoh: 3/4 atau 1 1/2)');
                return;
            }
            
            if (frac1.denominator === 0 || frac2.denominator === 0) {
                alert('Penyebut tidak boleh nol');
                return;
            }
            
            let calculationSteps = `<p class="operation-step"><strong>Input:</strong> ${frac1.original} ${operation.value} ${frac2.original}</p>`;
            
            // Step 1: Show conversion to improper fractions if needed
            if (frac1.isMixed || frac2.isMixed) {
                calculationSteps += `<p class="operation-step"><strong>1. Konversi ke pecahan biasa:</strong></p>`;
                
                if (frac1.isMixed) {
                    calculationSteps += `<p class="operation-step">${frac1.original} = ${frac1.numerator}/${frac1.denominator}</p>`;
                }
                
                if (frac2.isMixed) {
                    calculationSteps += `<p class="operation-step">${frac2.original} = ${frac2.numerator}/${frac2.denominator}</p>`;
                }
            }
            
            // Step 2: Perform the operation
            calculationSteps += `<p class="operation-step"><strong>2. Operasi matematika:</strong></p>`;
            calculationSteps += `<p class="operation-step">${formatFraction(frac1.numerator, frac1.denominator)} ${operation.value} ${formatFraction(frac2.numerator, frac2.denominator)}</p>`;
            
            let resultNumerator, resultDenominator;
            let explanation = '';
            
            switch (operation.value) {
                case '+':
                case '-':
                    const commonDenominator = frac1.denominator * frac2.denominator;
                    const newNumerator1 = frac1.numerator * frac2.denominator;
                    const newNumerator2 = frac2.numerator * frac1.denominator;
                    
                    explanation = `<p class="operation-step">Penyebut bersama: ${frac1.denominator} × ${frac2.denominator} = ${commonDenominator}</p>`;
                    explanation += `<p class="operation-step">Ubah pecahan pertama: ${frac1.numerator} × ${frac2.denominator} = ${newNumerator1}</p>`;
                    explanation += `<p class="operation-step">Ubah pecahan kedua: ${frac2.numerator} × ${frac1.denominator} = ${newNumerator2}</p>`;
                    
                    if (operation.value === '+') {
                        resultNumerator = newNumerator1 + newNumerator2;
                        explanation += `<p class="operation-step">Jumlahkan: ${newNumerator1} + ${newNumerator2} = ${resultNumerator}</p>`;
                    } else {
                        resultNumerator = newNumerator1 - newNumerator2;
                        explanation += `<p class="operation-step">Kurangi: ${newNumerator1} - ${newNumerator2} = ${resultNumerator}</p>`;
                    }
                    
                    resultDenominator = commonDenominator;
                    calculationSteps += explanation;
                    calculationSteps += `<p class="operation-step">= ${formatFraction(newNumerator1, commonDenominator)} ${operation.value} ${formatFraction(newNumerator2, commonDenominator)}</p>`;
                    calculationSteps += `<p class="operation-step">= ${formatFraction(resultNumerator, resultDenominator)}</p>`;
                    break;
                    
                case '*':
                    resultNumerator = frac1.numerator * frac2.numerator;
                    resultDenominator = frac1.denominator * frac2.denominator;
                    explanation = `<p class="operation-step">Kalikan pembilang: ${frac1.numerator} × ${frac2.numerator} = ${resultNumerator}</p>`;
                    explanation += `<p class="operation-step">Kalikan penyebut: ${frac1.denominator} × ${frac2.denominator} = ${resultDenominator}</p>`;
                    calculationSteps += explanation;
                    calculationSteps += `<p class="operation-step">= ${formatFraction(resultNumerator, resultDenominator)}</p>`;
                    break;
                    
                case '/':
                    resultNumerator = frac1.numerator * frac2.denominator;
                    resultDenominator = frac1.denominator * frac2.numerator;
                    explanation = `<p class="operation-step">Pembagian = perkalian dengan kebalikan:</p>`;
                    explanation += `<p class="operation-step">${frac1.numerator}/${frac1.denominator} × ${frac2.denominator}/${frac2.numerator}</p>`;
                    explanation += `<p class="operation-step">Kalikan pembilang: ${frac1.numerator} × ${frac2.denominator} = ${resultNumerator}</p>`;
                    explanation += `<p class="operation-step">Kalikan penyebut: ${frac1.denominator} × ${frac2.numerator} = ${resultDenominator}</p>`;
                    calculationSteps += explanation;
                    calculationSteps += `<p class="operation-step">= ${formatFraction(resultNumerator, resultDenominator)}</p>`;
                    break;
            }
            
            // Step 3: Simplify the result
            calculationSteps += `<p class="operation-step"><strong>3. Penyederhanaan:</strong></p>`;
            const simplified = simplifyFraction(resultNumerator, resultDenominator);
            const gcdValue = gcd(resultNumerator, resultDenominator);
            
            if (gcdValue === 1) {
                calculationSteps += `<p class="operation-step">Pecahan sudah sederhana (FPB = 1)</p>`;
            } else {
                calculationSteps += `<p class="operation-step">FPB dari ${resultNumerator} dan ${resultDenominator} adalah ${gcdValue}</p>`;
                calculationSteps += `<p class="operation-step">${resultNumerator}/${resultDenominator} = ${simplified.numerator}/${simplified.denominator}</p>`;
            }
            
            // Step 4: Convert to mixed number if needed
            let finalResultStr;
            if (simplified.isImproper) {
                finalResultStr = toMixedNumber(simplified.numerator, simplified.denominator);
                calculationSteps += `<p class="operation-step"><strong>4. Konversi ke pecahan campuran:</strong></p>`;
                calculationSteps += `<p class="operation-step">${simplified.numerator}/${simplified.denominator} = ${finalResultStr}</p>`;
            } else {
                finalResultStr = simplified.denominator === 1 ? 
                    simplified.numerator.toString() : 
                    `${simplified.numerator}/${simplified.denominator}`;
            }
            
            steps.value = calculationSteps;
            finalResult.value = finalResultStr;
            showResult.value = true;
        }
        
        return {
            fraction1,
            fraction2,
            operation,
            showResult,
            steps,
            finalResult,
            resetCalculation,
            calculate
        };
    }
}).mount('#app');