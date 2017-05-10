/* global Map, Set, Promise */
/* eslint no-var: 0, no-console: 0 */
/* eslint-env es6 */

import { populateFileList } from './files';

var highlightedEl;
var currentPath;
var resolver;
var rejecter;

function openFileDialog(path) {

	return new Promise(function (resolve, reject) {
		if (openFileDialog.open === undefined) openFileDialog.open = false;
		if (openFileDialog.open === true) {
			throw Error('Dialog already open for another task.');
		}
		path = path || process.env.HOME || '/';
		currentPath = path;
		openFileDialog.el.classList.remove('closed');
		openFileDialog.el.querySelector('a, button, [tabindex]').focus();
		resolver = resolve;
		rejecter = reject;
		openFileDialog.currentPathEl.value = currentPath;

		populateFileList(openFileDialog.filelistLeft, path, {
			nested: false
		})
		.catch(function (e) {
			console.log(e);
			return populateFileList(openFileDialog.filelistLeft, process.env.HOME || '/', {
				nested: false
			})
		});
	});
}

function highlight(e) {
	if (e.target.tagName === 'LI') {
		if (highlightedEl) {
			highlightedEl.classList.remove('has-highlight');
		}
		highlightedEl = e.target;
		highlightedEl.classList.add('has-highlight');

		currentPath = e.target.stats.path;
		openFileDialog.currentPathEl.value = currentPath;

		if (e.target.stats && e.target.stats.isDirectory()) {
			if (e.currentTarget === openFileDialog.filelistLeft) {
				if (e.target.stats.name === '..') {
					populateFileList(openFileDialog.filelistLeft, e.target.stats.path, {
						nested: false
					});
					openFileDialog.filelistRight.innerHTML = '';
				} else {
					populateFileList(openFileDialog.filelistRight, e.target.stats.path, {
						nested: false
					});
				}
			}
			if (e.currentTarget === openFileDialog.filelistRight) {
				populateFileList(openFileDialog.filelistLeft, e.target.stats.dirName, {
					nested: false
				})
					.then(function () {
						[].slice.call(openFileDialog.filelistLeft.children).forEach(function (el) {
							if (el.stats.path === currentPath) {
								highlightedEl = e.target;
								highlightedEl.classList.add('has-highlight');
							}
						});
					});
				populateFileList(openFileDialog.filelistRight, e.target.stats.path, {
					nested: false
				});
			}
		}
	}
}

function ondblclick(e) {
	highlight(e);
	if (e.target.stats && e.target.stats.isDirectory()) return;
	open(e.target.stats);
}

function open(stats) {
	openFileDialog.el.classList.add('closed');
	resolver(stats);
	resolver = undefined;
	rejecter = undefined;
}

function cancel() {
	openFileDialog.el.classList.add('closed');
	rejecter('User canceled');
	resolver = undefined;
	rejecter = undefined;
}

function onkeydown(e) {
	if (event.keyCode === 13) ondblclick(e);
}

openFileDialog.el = openFileDialog.el || document.querySelector('#file-open-widget');
openFileDialog.currentPathEl = openFileDialog.currentPathEl || openFileDialog.el.querySelector('input[name="current-path"]');
openFileDialog.filelistLeft = openFileDialog.filelistLeft || openFileDialog.el.querySelector('.filelist:first-child');
openFileDialog.filelistRight = openFileDialog.filelistRight || openFileDialog.el.querySelector('.filelist:not(:first-child)');
openFileDialog.openButton = openFileDialog.openButton || openFileDialog.el.querySelector('#file-open-open');
openFileDialog.cancelButton = openFileDialog.cancelButton || openFileDialog.el.querySelector('#file-open-cancel');
openFileDialog.upDirButton = openFileDialog.upDirButton || openFileDialog.el.querySelector('button[data-action="up-dir"]');

openFileDialog.filelistLeft.addEventListener('click', highlight);
openFileDialog.filelistRight.addEventListener('click', highlight);

openFileDialog.filelistLeft.addEventListener('keydown', onkeydown);
openFileDialog.filelistRight.addEventListener('keydown', onkeydown);

openFileDialog.filelistLeft.addEventListener('dblclick', ondblclick);
openFileDialog.filelistRight.addEventListener('dblclick', ondblclick);
openFileDialog.openButton.addEventListener('click', function () {
	if (highlightedEl.stats) return open(highlightedEl.stats);
});
openFileDialog.cancelButton.addEventListener('click', function () {
	cancel();
});
openFileDialog.upDirButton.addEventListener('click', function () {
	console.log('STUB GO UP DIR');
});

export default openFileDialog;