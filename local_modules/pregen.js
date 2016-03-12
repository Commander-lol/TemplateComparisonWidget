"use strict";
const sb = require("bp-sideburns");
module.exports = function pregen(data) {
  let head = `<link rel="stylesheet" href="/stylesheets/materialize.css"/>
              <link rel="stylesheet" href="/stylesheets/font-awesome.css"/>`,
      header = `
        <ul id="languageDropdown" class="dropdown-content">
          [[* languagenames]]
            <li><a href="/[[languagename]]" class="blue-grey-text text-darken-2">[[languagename]]</a></li>
          [[/* languagenames]]
        </ul>
        <nav class="amber darken-4">
          <div class="nav-wrapper">
            <a href="/" class="brand-logo center">[[lang]]</a>
            <ul id="nav-main" class="right hide-on-med-and-down">
              <li><a class="dropdown-button" href="#" data-activates="languageDropdown">Languages<i class="fa fa-chevron-circle-down right"></i></a></li>
            </ul>
          </div>
        </nav>
      `,
      footer = `
      <script src="/js/jquery.js"></script>
      <script src="/js/materialize.min.js"></script>
      `;

  return {
    head: sb(head, data),
    header: sb(header, data),
    footer: sb(footer, data)
  }
}
