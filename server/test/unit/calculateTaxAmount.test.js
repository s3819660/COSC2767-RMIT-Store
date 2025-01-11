const { caculateTaxAmount } = require('../../utils/store');

describe('caculateTaxAmount', () => {
  const taxConfig = { stateTaxRate: 10 }; // Mock tax configuration

  it('should calculate tax and update order correctly for taxable products', () => {
    const order = {
      products: [
        {
          product: { price: 100, taxable: true },
          quantity: 2,
          status: 'Active',
          totalTax: 0,
          priceWithTax: 0
        },
        {
          product: { price: 50, taxable: false },
          quantity: 1,
          status: 'Active',
          totalTax: 0,
          priceWithTax: 0
        }
      ]
    };

    caculateTaxAmount(order);

    expect(order.totalTax).toBeCloseTo(20); // 10% of 100 * 2
    expect(order.products[0].totalTax).toBeCloseTo(20);
    expect(order.products[0].priceWithTax).toBeCloseTo(220); // 100 * 2 + 20
    expect(order.products[1].totalTax).toBe(0);
    expect(order.products[1].priceWithTax).toBe(50);
  });

  it('should handle orders with no products', () => {
    const order = { products: [] };
    caculateTaxAmount(order);
    expect(order.totalTax).toBe(0);
  });

  it('should skip cancelled products when calculating tax', () => {
    const order = {
      products: [
        {
          product: { price: 100, taxable: true },
          quantity: 2,
          status: 'Cancelled',
          totalTax: 0,
          priceWithTax: 0
        }
      ]
    };

    caculateTaxAmount(order);
    expect(order.totalTax).toBe(0);
    expect(order.products[0].totalTax).toBe(0);
    expect(order.products[0].priceWithTax).toBe(0);
  });

  it('should use purchasePrice if provided', () => {
    const order = {
      products: [
        {
          product: { price: 100, taxable: true },
          purchasePrice: 80,
          quantity: 2,
          status: 'Active',
          totalTax: 0,
          priceWithTax: 0
        }
      ]
    };

    caculateTaxAmount(order);

    expect(order.totalTax).toBeCloseTo(16); // 10% of 80 * 2
    expect(order.products[0].totalTax).toBeCloseTo(16);
    expect(order.products[0].priceWithTax).toBeCloseTo(176); // 80 * 2 + 16
  });
});
