import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import {
  splitSelector,
} from '../Utils';
import {
  hasClassName,
  nodeHasProperty,
  treeForEach,
  treeFilter,
} from '../ShallowTraversal';

describe('ShallowTraversal', () => {

  describe('splitSelector', () => {
    const fn = splitSelector;
    it('splits multiple class names', () => {
      expect(fn('.foo.bar')).to.eql(['.foo', '.bar']);
      expect(fn('.foo.bar.baz')).to.eql(['.foo', '.bar', '.baz']);
    });

    it('splits tag names and class names', () => {
      expect(fn('input.bar')).to.eql(['input', '.bar']);
      expect(fn('div.bar.baz')).to.eql(['div', '.bar', '.baz']);
      expect(fn('Foo.bar')).to.eql(['Foo', '.bar']);
    });

    it('splits tag names and attributes', () => {
      expect(fn('input[type="text"]')).to.eql(['input', '[type="text"]']);
      expect(
        fn('div[title="title"][data-value="foo"]')
      ).to.eql(['div', '[title="title"]', '[data-value="foo"]']);
    });
  });

  describe('hasClassName', () => {

    it('should work for standalone classNames', () => {
      const node = (<div className="foo"/>);
      expect(hasClassName(node, 'foo')).to.equal(true);
      expect(hasClassName(node, 'bar')).to.equal(false);
    });

    it('should work for multiple classNames', () => {
      const node = (<div className="foo bar baz"/>);
      expect(hasClassName(node, 'foo')).to.equal(true);
      expect(hasClassName(node, 'bar')).to.equal(true);
      expect(hasClassName(node, 'baz')).to.equal(true);
      expect(hasClassName(node, 'bax')).to.equal(false);
    });

    it('should also allow hyphens', () => {
      const node = (<div className="foo-bar"/>);
      expect(hasClassName(node, 'foo-bar')).to.equal(true);
    });

  });

  describe('nodeHasProperty', () => {

    it('should find properties', () => {
      function noop() {}
      const node = (<div onChange={noop} title="foo" />);

      expect(nodeHasProperty(node, 'onChange')).to.equal(true);
      expect(nodeHasProperty(node, 'title', 'foo')).to.equal(true);
    });

    it('should not match on html attributes', () => {
      const node = (<div htmlFor="foo" />);

      expect(nodeHasProperty(node, 'for', 'foo')).to.equal(false);
    });

    it('should not find undefined properties', () => {
      const node = (<div title={undefined} />);

      expect(nodeHasProperty(node, 'title')).to.equal(false);
    });

  });

  describe('treeForEach', () => {

    it('should be called once for a leaf node', () => {
      const spy = sinon.spy();
      const node = (<div />);
      treeForEach(node, spy);
      expect(spy.calledOnce).to.equal(true);
    });

    it('should handle a single child', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <div />
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(2);
    });

    it('should handle several children', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <div />
          <div />
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(3);
    });

    it('should handle multiple hierarchies', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <div>
            <div />
            <div />
          </div>
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(4);
    });

    it('should not get trapped from empty strings', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <p>{""}</p>
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(3);
    });

    it('should pass in the node', () => {
      const spy = sinon.spy();
      const node = (
        <div>
          <button />
          <nav>
            <input />
          </nav>
        </div>
      );
      treeForEach(node, spy);
      expect(spy.callCount).to.equal(4);
      expect(spy.args[0][0].type).to.equal('div');
      expect(spy.args[1][0].type).to.equal('button');
      expect(spy.args[2][0].type).to.equal('nav');
      expect(spy.args[3][0].type).to.equal('input');
    });

  });

  describe('treeFilter', () => {
    const tree = (
      <div>
        <button />
        <button />
        <nav>
          <input />
        </nav>
      </div>
    );

    it('should return an empty array for falsey test', () => {
      expect(treeFilter(tree, () => false).length).to.equal(0);
    });

    it('should return the full array for truthy test', () => {
      expect(treeFilter(tree, () => true).length).to.equal(5);
    });

    it('should filter for truthiness', () => {
      expect(treeFilter(tree, node => node.type === 'nav').length).to.equal(1);
      expect(treeFilter(tree, node => node.type === 'button').length).to.equal(2);
    });

  });

});
