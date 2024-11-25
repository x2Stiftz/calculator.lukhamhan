    // Tab Switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and sections
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.calculator-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-section`).classList.add('active');
            
            // Clear all inputs and results when switching tabs
            clearAllInputs();
        });
    });

    // Operation Button Selection
    document.querySelectorAll('.operation-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from siblings only
            e.target.closest('.operations').querySelectorAll('.operation-btn')
                .forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Clear result when changing operation
            document.getElementById('result').classList.remove('show');
            document.getElementById('answer').innerHTML = '';
            document.getElementById('steps').innerHTML = '';
        });
    });

    function showAlert(message) {
        const alert = document.getElementById('alert');
        alert.style.display = 'block';
        alert.textContent = message;
        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    }

    function clearAllInputs() {
        // Clear all input fields
        document.querySelectorAll('input').forEach(input => {
            input.value = '';
        });

        // Remove active class from all operation buttons
        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Hide result section
        document.getElementById('result').classList.remove('show');
        
        // Clear result content
        document.getElementById('answer').innerHTML = '';
        document.getElementById('steps').innerHTML = '';
    }

    function getActiveOperation(section) {
        const activeBtn = section.querySelector('.operation-btn.active');
        return activeBtn ? activeBtn.dataset.operation : null;
    }

    function calculateBasic() {
        const num1 = parseFloat(document.getElementById('number1').value);
        const num2 = parseFloat(document.getElementById('number2').value);
        const operation = getActiveOperation(document.getElementById('basic-section'));
        
        if (isNaN(num1) || isNaN(num2)) {
            showAlert('กรุณาใส่ตัวเลขให้ครบทั้งสองช่อง');
            return;
        }

        let result, steps;

        switch (operation) {
            case 'add':
                result = num1 + num2;
                steps = `${num1} + ${num2} = ${result}`;
                break;
            case 'subtract':
                result = num1 - num2;
                steps = `${num1} - ${num2} = ${result}`;
                break;
            case 'multiply':
                result = num1 * num2;
                steps = `${num1} × ${num2} = ${result}`;
                break;
            case 'divide':
                if (num2 === 0) {
                    showAlert('ไม่สามารถหารด้วยศูนย์ได้');
                    return;
                }
                result = num1 / num2;
                steps = `${num1} ÷ ${num2} = ${result}`;
                break;
        }

        showResult(result, steps);
        addClearButton();
    }

    function calculateAdvanced() {
        const num1 = parseFloat(document.getElementById('advanced-number1').value);
        const num2 = parseFloat(document.getElementById('advanced-number2').value);
        const operation = getActiveOperation(document.getElementById('advanced-section'));

        if (isNaN(num1) || isNaN(num2)) {
            showAlert('กรุณาใส่ตัวเลขให้ครบทั้งสองช่อง');
            return;
        }

        let result, steps;

        try {
            switch (operation) {
                case 'power':
                    result = Math.pow(num1, num2);
                    steps = `${num1}^${num2} = ${result}`;
                    break;
                case 'root':
                    if (num1 < 0 && num2 % 2 === 0) {
                        throw new Error('ไม่สามารถหารากที่คู่ของจำนวนลบได้');
                    }
                    result = Math.pow(num1, 1/num2);
                    steps = `${num2}√${num1} = ${result}`;
                    break;
                case 'log':
                    if (num1 <= 0 || num2 <= 0 || num2 === 1) {
                        throw new Error('ไม่สามารถหาลอการิทึมของจำนวนที่น้อยกว่าหรือเท่ากับ 0 หรือฐานเท่ากับ 1');
                    }
                    result = Math.log(num1) / Math.log(num2);
                    steps = `log${num2}(${num1}) = ${result}`;
                    break;
                case 'fraction':
                    if (num2 === 0) {
                        throw new Error('ไม่สามารถใช้ตัวส่วนเป็นศูนย์ได้');
                    }
                    result = num1 / num2;
                    steps = `${num1}/${num2} = ${result}`;
                    break;
            }

            showResult(result, steps);
            addClearButton();

        } catch (error) {
            showAlert(error.message);
        }
    }

    function solveEquation() {
    const equationInput = document.getElementById('equation');
    const equation = equationInput.value.trim();
    
    if (!equation) {
        showAlert('กรุณาใส่สมการ');
        return;
    }

    try {
        // ทำความสะอาดสมการ
        let cleanEquation = equation.replace(/\s+/g, '');
        
        // แยกส่วนซ้ายและขวาของเครื่องหมาย =
        let [leftSide, rightSide] = cleanEquation.split('=');
        
        if (!leftSide || !rightSide) {
            throw new Error('รูปแบบสมการไม่ถูกต้อง กรุณาใส่เครื่องหมาย =');
        }

        // หาตัวแปร
        let variable = leftSide.match(/[a-zA-Z]/);
        if (!variable) {
            throw new Error('ไม่พบตัวแปรในสมการ');
        }
        variable = variable[0];

        // แปลงนิพจน์เป็นค่าตัวเลข
        let evaluatedRight = evaluateComplexExpression(rightSide);

        // แยกพจน์และจัดรูปสมการ
        let { coefficient, constant } = parseComplexEquation(leftSide, variable);

        // คำนวณคำตอบ
        let answer = (evaluatedRight - constant) / coefficient;

        // จัดรูปคำตอบ
        answer = Math.round(answer * 1000000) / 1000000;

        let steps = [
            `1. สมการเริ่มต้น: ${equation}`,
            `2. จัดรูปสมการ: ${coefficient}${variable} ${constant >= 0 ? '+' : ''}${constant} = ${evaluatedRight}`,
            `3. ย้ายค่าคงที่: ${coefficient}${variable} = ${evaluatedRight} ${constant >= 0 ? '-' : '+'}${Math.abs(constant)}`,
            `4. คำนวณด้านขวา: ${coefficient}${variable} = ${evaluatedRight - constant}`,
            `5. หารทั้งสองข้างด้วย ${coefficient}: ${variable} = ${answer}`
        ].join('<br>');

        showResult(`${variable} = ${answer}`, steps);
        addClearButton();
        
        // เคลียร์ input เพื่อให้พร้อมรับค่าใหม่
        equationInput.value = '';
        equationInput.focus();

    } catch (error) {
        showAlert(error.message || 'เกิดข้อผิดพลาดในการแก้สมการ');
    }
}

// ฟังก์ชันแยกพจน์
function splitTerms(expression) {
    return expression.replace(/\+/g, ' +').replace(/-/g, ' -').trim().split(' ');
}

// ฟังก์ชันประเมินค่านิพจน์
function evaluateComplexExpression(expression) {
// แทนที่การคูณและหารด้วยสัญลักษณ์ที่ JavaScript เข้าใจ
expression = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/(\d+)\/(\d+)/g, (_, num, den) => `(${num}/${den})`); // จัดการเศษส่วน

try {
    return Function(`return ${expression}`)();
} catch (error) {
    throw new Error('รูปแบบนิพจน์ไม่ถูกต้อง');
}
}


// ฟังก์ชันรวมพจน์ที่คล้ายกัน
function collectTerms(terms, variable) {
    let coefficient = 0;
    let constant = 0;

    terms.forEach(term => {
        if (term.includes(variable)) {
            // จัดการกับพจน์ที่มีตัวแปร
            let coef = term.replace(variable, '');
            coef = coef === '' ? 1 : coef === '-' ? -1 : parseFloat(coef);
            coefficient += coef;
        } else {
            // จัดการกับค่าคงที่
            constant += parseFloat(term || 0);
        }
    });

    return { coefficient, constant };
}

    function showResult(answer, steps) {
        const resultDiv = document.getElementById('result');
        const answerDiv = document.getElementById('answer');
        const stepsDiv = document.getElementById('steps');

        resultDiv.classList.add('show');
        answerDiv.innerHTML = `<strong>คำตอบ:</strong> ${answer}`;
        if (steps) {
            stepsDiv.innerHTML = `<strong>วิธีทำ:</strong><br>${steps}`;
        } else {
            stepsDiv.innerHTML = '';
        }
    }

// รองรับการกด Enter
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const section = input.closest('.calculator-section');
            if (section.id === 'basic-section') {
                calculateBasic();
            } else if (section.id === 'equation-section') {
                solveEquation();
            } else if (section.id === 'advanced-section') {
                calculateAdvanced();
            }
        }
    });
});

// เพิ่มฟังก์ชันสำหรับการจัดการกับตัวเลขทศนิยม
function formatNumber(number) {
    return Number.isInteger(number) ? number : number.toFixed(6);
}

// เพิ่มฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
function validateInput(value, type = 'number') {
    if (type === 'number') {
        return !isNaN(value) && value !== '';
    }
    if (type === 'equation') {
        return value.includes('=') && /[a-zA-Z]/.test(value);
    }
    return false;
}
function parseComplexEquation(expression, variable) {
let coefficient = 0;
let constant = 0;

// แปลงการคูณและหารให้เป็นรูปแบบมาตรฐาน
expression = expression
    .replace(/([a-zA-Z])(\d+)/g, '$2$1') // แปลง x2 เป็น 2x
    .replace(new RegExp(`(\\d+)${variable}`, 'g'), '$1*' + variable) // แปลง 2x เป็น 2*x
    .replace(/÷/g, '/') // แปลง ÷ เป็น /
    .replace(/×/g, '*'); // แปลง × เป็น *

// แยกพจน์
let terms = expression.replace(/([+-])/g, ' $1').trim().split(/\s+/);

terms.forEach(term => {
    if (term.includes(variable)) {
        // จัดการกับพจน์ที่มีตัวแปร
        let coef = term.replace(variable, '').replace('*', '');
        coef = coef === '' ? 1 : 
            coef === '-' ? -1 : 
            evaluateComplexExpression(coef);
        coefficient += coef;
    } else {
        // จัดการกับค่าคงที่
        if (term !== '+' && term !== '-') {
            constant += evaluateComplexExpression(term);
        }
    }
});

return { coefficient, constant };
}
function addClearButton() {
            const resultDiv = document.getElementById('result');
            if (!resultDiv.querySelector('.clear-btn')) {
                const clearBtn = document.createElement('button');
                clearBtn.className = 'clear-btn';
                clearBtn.textContent = 'เคลียร์';
                clearBtn.onclick = clearAllInputs;
                resultDiv.appendChild(clearBtn);
            }
        }
document.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const section = input.closest('.calculator-section');
                    if (section.id === 'basic-section') {
                        calculateBasic();
                    } else if (section.id === 'equation-section') {
                        solveEquation();
                    } else if (section.id === 'advanced-section') {
                        calculateAdvanced();
                    }
                }
            });
        });