document.addEventListener("DOMContentLoaded", () => {
  const shippingRadioCheckboxes = document.getElementsByName("shippingOption");
  const paymentRadioCheckboxes = document.getElementsByName("paymentMethod");
  const choosenShipping = document.querySelector(".choosen-shipping");
  const choosenPayment = document.querySelector(".choosen-payment");

  choosenShipping.innerHTML = `shipping option: ${shippingRadioCheckboxes[0].value}`;
  shippingRadioCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      choosenShipping.innerHTML = `shipping option: ${checkbox.value}`;
    });
  });

  choosenPayment.innerHTML = `payment method: ${paymentRadioCheckboxes[0].value}`;
  paymentRadioCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      choosenPayment.innerHTML = `payment method: ${checkbox.value}`;
    });
  });
});
