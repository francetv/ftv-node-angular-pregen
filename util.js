exports.extractScriptTags = function (content) {
  return content.match(/<script(?:.*?)>(?:[\S\s]*?)<\/script>/gi);
};

exports.removeScriptTags = function (content) {
  var matches = this.extractScriptTags(content);
  for (var i = 0; matches && i < matches.length; i++) {
      if(matches[i].indexOf('application/ld+json') === -1) {
          content = content.replace(matches[i], '');
      }
  }
  return content;
};

exports.removeNgApp = function (content) {
  return content.replace(/ng-app=\"app\"/, '');
};
