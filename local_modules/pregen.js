"use strict";
const sb = require("bp-sideburns");
module.exports = function pregen(data) {
  let head = `<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <link rel="stylesheet" href="/stylesheets/materialize.css"/>
              <link rel="stylesheet" href="/stylesheets/font-awesome.css"/>
              <link rel="stylesheet" href="/stylesheets/style.css"/>`,
      header = `
        <ul id="languageDropdown" class="dropdown-content">
          [[* languagenames]]
            <li><a href="/[[languagename]]/[[page]]" class="blue-grey-text text-darken-2 cap-title">[[languagename]]</a></li>
          [[/* languagenames]]
        </ul>
        <nav class="[[colour]] darken-4">
          <div class="nav-wrapper">
            <a href="/" class="brand-logo center cap-title">[[lang]]</a>
            <ul id="nav-main" class="right">
              <li><a class="dropdown-button" href="#" data-activates="languageDropdown">Languages<i class="fa fa-chevron-circle-down right"></i></a></li>
            </ul>
          </div>
        </nav>
      `,
      footer = `
      <script src="/js/jquery.js"></script>
      <script src="/js/materialize.min.js"></script>
      `,
      getPerf = `
      <div id="[[id]]" class="col s12">
        <pre id="pre-[[id]]" class="z-depth-2"></pre>
      </div>
      <script>
        window.setTimeout(function(){
        $.getJSON("/benchmark/[[id]]", function(data) {
          $("#pre-[[id]]").text(JSON.stringify(data, null, 2));
        });
      }, 1500);
      </script>
      `

  return {
    head: sb(head, data),
    header: sb(header, data),
    footer: sb(footer, data),
    perf: sb(getPerf, data)
  }
}
