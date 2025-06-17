// ==UserScript==
// @name         DeepSeek折叠
// @namespace    http://tampermonkey.net/
// @version      2025-06-16
// @description  TL;DR: 超弦领域折叠装置，启动！将DeepSeek酱的知识洪流压缩进克莱因瓶的口袋宇宙吧(◕ᴗ◕✿)
// @author       quapyrus
// @match        https://chat.deepseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  // Your code here...
  try {
    setTimeout(init, 1000)
  } catch (error) {
    console.error('DeepSeek折叠：出错啦，我什么都做不到……', error)
    return
  }

  function getRoot() { return document.querySelectorAll('.scrollable')[1].firstChild.firstChild.children }

  function init() {
    document.getElementById('root').insertAdjacentHTML('beforeend', QsIcon.html)
    const root = getRoot()
    for (var i = 1, length = root.length; i < length; i += 2) {
      root[i].classList.add('qs-question')
      const actions = root[i].lastChild
      actions.firstChild.insertAdjacentHTML('afterbegin', '<qs-icon name="push-chevron-up" @click="toggleFolding"/>')
      actions.insertAdjacentHTML('afterbegin', '<qs-icon name="push-chevron-down" @click="toggleFolding"/>')
    }

    QsIcon.buildNavigation = () => {
      const root = getRoot()
      const items = []
      for (var i = 0, length = root.length >> 1; i < length; i++) {
        root[i << 1].id = `qs-question-${i}`
        const question = root[i << 1].firstChild.textContent
//        console.log('DeepSeek折叠：', root[i], `qs.navigation[$i] == `, question)
        items.push(`
<a id="qs-item-${i}" class="qs-item" href="#qs-question-${i}" title="${question}">
  ${question}
</a>`)
      }
      document.getElementById('qs-container').innerHTML = items.join('')
    }



    const config = { childList: true, subtree: true }
    const observer = new MutationObserver(fnMutationObserver)
    observer.observe(document.querySelectorAll('.scrollable')[1], config)
    // observer.disconnect()

   function fnMutationObserver(mutationsList, observer) {

if( !document.querySelector('qs-icon[name=qs-folding]').expand) {
return
}

        for(var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.', mutationsList);
            }
        }
    }





    QsIcon.toggleNavFolding = (_, target) => {
      const expand = target.parentNode.host.expand = !target.parentNode.host.expand
      //              if (() !== (name === 'chevron-down')) {
      target.style.display = 'none'
      target.parentNode.children[expand ? 1 : 0].style.display = ''

      const container = document.getElementById('qs-container')
      const btnSync = document.querySelector('#qs-navigation>div:first-child>qs-icon[name=sync]')
      if (!expand) {
        container.style.display = btnSync.style.display = 'none'
      } else if (container.style.display === 'none') {
        QsIcon.buildNavigation()
        container.style.display = btnSync.style.display = ''
      }
    }

    QsIcon.toggleFolding = (e, target, root) => {
      if (!root) {
        root = target.parentNode.host.closest('.qs-question')
      }
      const flagFolding = target.matches('[name$=up]')
      if (flagFolding) {
        root.classList.add('qs-collapse')
      } else {
        root.classList.remove('qs-collapse')
      }
      const first = Array.from(root.children).find((v, i) => i >= 1 && i < 4 && v.childElementCount >= 1)
      if (first && (flagFolding == first.childElementCount > 1)) {
        first.firstChild.click()
      }
    }

    QsIcon.toggleAllFolding = (_, target) => {
      const root = getRoot()
      for (var i = 1, length = root.length; i < length; i += 2) {
        QsIcon.toggleFolding(_, target, root[i])
      }
    }
  }

  class QsIcon extends HTMLElement {
    constructor() {
      super()
      const templateElem = document.getElementById('template-qs-icon')
      const content = templateElem.content.cloneNode(true)

      const name = this.getAttribute('name')
      const flag = QsIcon.#map[name]
      var el
      for (var i = content.childElementCount - 1; i >= 0; i--) {
        const e = content.children[i]
        const eName = e.getAttribute('name')
        var includes = -1
        if (eName === name || (includes = flag?.indexOf(eName)) === 0) {
          el = e
        } else if (includes > 0) {
          e.style.display = 'none'
        } else {
          e.remove()
        }
      }
      const shadow = this.attachShadow({
        mode: 'closed'
      })
      shadow.appendChild(flag ? content : el)
      shadow.addEventListener('click', this.onClick)
    }

    onClick(e) {
      const target = e.target.viewportElement || e.target
      //            const name =target.getAttribute('name')

      QsIcon[target.parentNode.host.getAttribute('@click')]?.call(this, e, target)
    }

    static #map = {
      'qs-folding': ['chevron-down', 'chevron-up'],
    }

    static html = `
<div id="qs-navigation">
  <div>
    <qs-icon name="sync" @click="buildNavigation" title="刷新导航" style="display: none"></qs-icon>
    <qs-icon name="push-chevron-up" @click="toggleAllFolding" title="折叠全部回答"></qs-icon>
    <qs-icon name="push-chevron-down" @click="toggleAllFolding" title="展开全部回答"></qs-icon>
    <qs-icon name="qs-folding" @click="toggleNavFolding" title="展开/收起导航"></qs-icon>
  </div>
  <div id="qs-container" style="display: none"></div>
</div>
<style>
  #qs-navigation {
    position: fixed;
    right: 16px;
    z-index: 9999;
    background: rgba(102, 204, 255, 0.3);
  }
  #qs-navigation>div:first-child {
    text-align: right;
    padding: 8px 16px 0 8px;
  }
  #qs-navigation>#qs-container {
    overflow: auto;
    width: 300px;
    max-height: 300px;
    padding: 0 8px 8px;
  }

  .qs-item {
    display: block;
    padding: 0 4px 8px;
    color: #66CCFF;

    white-space:nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }
  div.qs-collapse>div.ds-markdown {
    max-height: 200px;
    overflow: auto;
  }

  .qs-collapse>div.ds-flex:last-child>div.ds-flex:nth-child(2)>:first-child[name$=up] {
    display: none;
  }
  div.ds-flex:last-child>:first-child[name$=down] {
    display: none;
  }
  .qs-collapse>div.ds-flex:last-child>:first-child[name$=down] {
    display: unset;
    border: 2px solid red;
    border-radius: 300px;
  }
//  .qs-collapse>div.ds-flex:nth-child(4)>qs-icon:first-child[name$=down],
//  div.ds-flex:nth-child(4)>div.ds-flex:nth-child(2)>qs-icon:first-child[name$=up] {
////    display: none;
//  }
//
//
//  div.ds-flex:nth-child(4)>qs-icon:first-child[name$=down], .qs-collapse>div.ds-flex:nth-child(4)>div.ds-flex:nth-child(2)>qs-icon:first-child[name$=up] {
//      display: none;
//  }
</style>
<template id="template-qs-icon">
    <!-- https://css.gg/icon/ -->

    <svg name="chevron-down"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z"
        fill="currentColor"
      />
    </svg>

    <svg name="chevron-up"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.6569 16.2427L19.0711 14.8285L12.0001 7.75739L4.92896 14.8285L6.34317 16.2427L12.0001 10.5858L17.6569 16.2427Z"
        fill="currentColor"
      />
    </svg>

    <svg name="sync"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.56079 10.6418L6.35394 3.94971L8.25402 5.84979C11.7312 3.6588 16.3814 4.07764 19.41 7.1063L17.9958 8.52052C15.7536 6.27827 12.3686 5.87519 9.71551 7.31128L11.2529 8.84869L4.56079 10.6418Z"
        fill="currentColor"
      />
      <path
        d="M19.4392 13.3581L17.646 20.0502L15.7459 18.1501C12.2688 20.3411 7.61857 19.9223 4.58991 16.8936L6.00413 15.4794C8.24638 17.7217 11.6313 18.1247 14.2844 16.6887L12.747 15.1512L19.4392 13.3581Z"
        fill="currentColor"
      />
    </svg>

    <svg name="push-chevron-up"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 16.929L6.41421 18.3432L12.0711 12.6863L17.7279 18.3432L19.1421 16.929L12.0711 9.85789L5 16.929Z"
        fill="currentColor"
      />
      <path d="M19 8H5V6H19V8Z" fill="currentColor" />
    </svg>

    <svg name="push-chevron-down"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7.41421L6.41421 6L12.0711 11.6569L17.7279 6L19.1421 7.41421L12.0711 14.4853L5 7.41421Z"
        fill="currentColor"
      />
      <path d="M19 16.3432H5V18.3432H19V16.3432Z" fill="currentColor" />
    </svg>
</template>`
  }
  window.customElements.define('qs-icon', QsIcon)
})();
