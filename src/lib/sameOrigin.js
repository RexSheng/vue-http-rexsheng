var isURLSameOrigin=function(requestURL){
    var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

    function resolveURL(url) {
        var href = url;
        var xssRegex = /(\b)(on\w+)=|javascript|(<\s*)(\/*)script/gi;
        if(xssRegex.test(requestURL)){
          throw new Error('URL contains XSS injection attempt');
        }

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }
      originURL = resolveURL(window.location.href);
      var parsed = resolveURL(requestURL);
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
}

export default isURLSameOrigin;