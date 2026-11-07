(() => {
  const form = document.getElementById("practice-form");
  const principalField = document.getElementById("principal");
  const rateField = document.getElementById("annual-rate");
  const yearsField = document.getElementById("years");
  const unroundedOutput = document.getElementById("practice-unrounded");
  const resultOutput = document.getElementById("practice-result");
  const codeOutput = document.getElementById("practice-code");
  const errorOutput = document.getElementById("practice-error");
  const rates = new Set(["0.05", "0.06", "0.075"]);
  const terms = new Set(["0.5", "1", "2"]);
  const numberFormat = new Intl.NumberFormat("ko-KR");

  function scaledDecimal(value) {
    const [whole, fraction = ""] = value.split(".");
    return { digits: BigInt(whole + fraction), scale: fraction.length };
  }

  function update() {
    const principalText = principalField.value.trim();
    const rate = rateField.value;
    const years = yearsField.value;
    const validPrincipal = /^\d{1,9}$/.test(principalText);
    principalField.setAttribute("aria-invalid", String(!validPrincipal));

    if (!validPrincipal) {
      errorOutput.textContent = "원금은 0부터 999,999,999 사이의 정수를 숫자만 써서 입력하세요.";
      return;
    }
    if (!rates.has(rate) || !terms.has(years)) {
      errorOutput.textContent = "목록에서 연이율과 기간을 선택하세요.";
      return;
    }

    const principal = BigInt(principalText);
    const annualRate = scaledDecimal(rate);
    const term = scaledDecimal(years);
    const scale = annualRate.scale + term.scale;
    const denominator = 10n ** BigInt(scale);
    const product = principal * annualRate.digits * term.digits;
    const wholeWon = product / denominator;
    const remainder = product % denominator;
    const fraction = remainder.toString().padStart(scale, "0").replace(/0+$/, "");
    const settledWon = wholeWon + (2n * remainder >= denominator ? 1n : 0n);

    errorOutput.textContent = "";
    unroundedOutput.textContent = `${numberFormat.format(wholeWon)}${fraction ? `.${fraction}` : ""}원`;
    resultOutput.textContent = `${numberFormat.format(settledWon)}원`;
    codeOutput.textContent = [
      `let principal = money("KRW", ${principal});`,
      `let annual_rate = ${rate};`,
      `let years = ${years};`,
      "let interest = principal * annual_rate * years;",
      'print(settle(interest, 0, "HALF_UP"));',
    ].join("\n");
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
  update();
})();
