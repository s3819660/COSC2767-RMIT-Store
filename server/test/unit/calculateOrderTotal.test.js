const { caculateOrderTotal } = require("../../utils/store");

describe("caculateOrderTotal", () => {
  it("should calculate the total price of an order correctly", () => {
    const order = {
      products: [
        { totalPrice: 100, status: "Active" },
        { totalPrice: 50, status: "Active" },
        { totalPrice: 30, status: "Active" },
      ],
    };

    const total = caculateOrderTotal(order);

    expect(total).toBe(180); // 100 + 50 + 30
  });

  it("should exclude cancelled products from the total price", () => {
    const order = {
      products: [
        { totalPrice: 100, status: "Active" },
        { totalPrice: 50, status: "Cancelled" },
        { totalPrice: 30, status: "Active" },
      ],
    };

    const total = caculateOrderTotal(order);

    expect(total).toBe(130); // 100 + 30
  });

  it("should return 0 if all products are cancelled", () => {
    const order = {
      products: [
        { totalPrice: 100, status: "Cancelled" },
        { totalPrice: 50, status: "Cancelled" },
      ],
    };

    const total = caculateOrderTotal(order);

    expect(total).toBe(0);
  });

  it("should return 0 if there are no products in the order", () => {
    const order = { products: [] };

    const total = caculateOrderTotal(order);

    expect(total).toBe(0);
  });
});
