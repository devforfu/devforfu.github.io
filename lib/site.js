'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function setup() {
    var posts = Array.from(document.getElementsByClassName('post-link'));
    posts.forEach(function (post) {
        post.addEventListener('click', function (e) {
            var location = window.location;
            var postUrl = post.getAttribute('href');
            var newLocation = 'http://' + location['host'] + postUrl;
            window.location = newLocation;
        });
    });
    if (document.querySelector('.list-of-contents') !== null) {
        createContentsList();
    }
}

function createContentsList() {
    var sections = enumerateSections();
    var contents = document.querySelector('.list-of-contents ul');

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = sections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var sectionDef = _step.value;

            var anchorLink = document.createElement('a');
            anchorLink.href = '#' + sectionDef['id'];
            anchorLink.appendChild(document.createTextNode(sectionDef['header']));
            var listItem = document.createElement('li');
            listItem.classList += " post-section-link list-unstyled";
            listItem.appendChild(anchorLink);
            contents.appendChild(listItem);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}

/*
 * Appends numerical indicies to each section's header. Returns total number of
 * discovered sections.
 */
function enumerateSections() {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "h4.header";

    var content = [];
    var postSectionHeaders = Array.from(document.querySelectorAll(selector));

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = postSectionHeaders.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _ref = _step2.value;

            var _ref2 = _slicedToArray(_ref, 2);

            var index = _ref2[0];
            var header = _ref2[1];

            var headerText = '[' + index + '] ' + header.textContent;
            var contentEntry = {
                id: header.id,
                header: headerText
            };
            content.push(contentEntry);
            header.innerHTML = '';
            header.appendChild(document.createTextNode(headerText));
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return content;
}