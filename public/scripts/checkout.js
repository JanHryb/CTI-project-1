document.addEventListener("DOMContentLoaded", () => {
  const shippingRadioCheckboxes = document.getElementsByName("shippingOption");
  const paymentRadioCheckboxes = document.getElementsByName("paymentMethod");
  const choosenShipping = document.querySelector(".choosen-shipping");
  const choosenPayment = document.querySelector(".choosen-payment");

  shippingRadioCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      choosenShipping.innerHTML = `shipping option: ${checkbox.value}`;
    }
  });
  shippingRadioCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      choosenShipping.innerHTML = `shipping option: ${checkbox.value}`;
    });
  });

  paymentRadioCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      choosenPayment.innerHTML = `shipping option: ${checkbox.value}`;
    }
  });
  paymentRadioCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      choosenPayment.innerHTML = `payment method: ${checkbox.value}`;
    });
  });
});
