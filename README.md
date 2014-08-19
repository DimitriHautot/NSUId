NSUId
=====

"Not So Unique Identifier", abbreviated to NSUId, is a small tool useful for developping dynamic HTML pages.
Its purpose is the inspection of a web page, and the detection of elements having the same id attribute.

When accessing elements in the DOM through their id attribute, their uniqueness is essential.
If the HTML code is static, it is rather easy to make sure there are no duplicates.
But if the code is (partially) generated, the risk increase.

I initially developed a first iteration of this tool circa 2006, as a bookmarklet for Firefox and Internet Explorer.
A few months ago, I looked in my archives for the source code, with no luck.
So I rewrote it from scratch, this time starting as a Chrome browser action.
