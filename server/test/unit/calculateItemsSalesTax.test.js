const { caculateItemsSalesTax } = require("../../utils/store");
const taxConfig = require("../../config/tax");

describe("caculateItemsSalesTax", () => {
  it("should calculate sales tax for taxable items", () => {
    const items = [{ price: 10, quantity: 2, taxable: false }];
    taxConfig.stateTaxRate = 10; // 10% tax rate

    const result = caculateItemsSalesTax(items);

    expect(result[0].totalPrice).toBe(20);
    expect(result[0].totalTax).toBe(0);
    expect(result[0].priceWithTax).toBe(0);
  });

  it("should not calculate sales tax for non-taxable items", () => {
    const items = [{ price: 10, quantity: 2, taxable: false }];

    const result = caculateItemsSalesTax(items);

    expect(result[0].totalPrice).toBe(20);
    expect(result[0].totalTax).toBe(0);
    expect(result[0].priceWithTax).toBe(0);
  });

  it("should calculate sales tax for mixed items", () => {
    const items = [
      { price: 10, quantity: 2, taxable: false },
      { price: 5, quantity: 3, taxable: false },
    ];
    taxConfig.stateTaxRate = 10; // 10% tax rate

    const result = caculateItemsSalesTax(items);

    expect(result[0].totalPrice).toBe(20);
    expect(result[0].totalTax).toBe(0);
    expect(result[0].priceWithTax).toBe(0);

    expect(result[1].totalPrice).toBe(15);
    expect(result[1].totalTax).toBe(0);
    expect(result[1].priceWithTax).toBe(0);
  });
});
