async function qs() {
  $('#submit-video-list li.be-pager-item[title="第一页"]').click()
  await new Promise((v) => setTimeout(v, 1000))
  top.a = $('.be-pager-next')
  top.k = [];
  top.k.push(Array.from($('#submit-video-list>ul>li>a[title]')).map(v => v.textContent));
  while (top.a.is(':visible')) {
    top.a.click();
    await new Promise((v) => setTimeout(v, 1000))
    top.k.push(Array.from($('#submit-video-list>ul>li>a[title]')).map(v => v.textContent));
  }
  const result = top.k.map(v => v.join('\n')).join('\n')
  delete top.a
  delete top.k
  return result
}
console.log(await qs())