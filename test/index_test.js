const { assert, requester } = require('./set_up.js');
describe('index test', async function () {
  it('home page /', async function () {
    const res = await requester
      .get('/');
    assert.include(res.text, '更換頭貼');
    assert.equal(res.status, 200);
  });
  it('home page', async function () {
    const res = await requester
      .get('/homepage.html');
    assert.include(res.text, '更換頭貼');
    assert.equal(res.status, 200);
  });
  it('draw page', async function () {
    const res = await requester
      .get('/draw.html');
    assert.include(res.text, '題目：');
    assert.equal(res.status, 200);
  });
  it('gamer page', async function () {
    const res = await requester
      .get('/gamer.html');
    assert.include(res.text, 'report');
    assert.equal(res.status, 200);
  });
  it('single page', async function () {
    const res = await requester
      .get('/single.html');
    assert.include(res.text, '紀錄 筆劃');
    assert.equal(res.status, 200);
  });
  it('404 page', async function () {
    const res = await requester
      .get('/forTest/xyz/123');
    assert.include(res.text, '404');
    assert.equal(res.status, 200);
  });
  it('adminCheck page', async function () {
    const res = await requester
      .get('/adminCheck.html');
    assert.include(res.text, '無效題目');
    assert.equal(res.status, 200);
  });
});
