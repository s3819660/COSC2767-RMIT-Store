module.exports = jest.fn(() => ({
    messages: jest.fn(() => ({
      send: jest.fn((data, callback) => callback(null, { message: 'Queued. Thank you.', id: '<20111114174239.25659.5817@samples.mailgun.org>' }))
    }))
  }));