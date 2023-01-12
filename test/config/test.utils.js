const factories = require("../factories/index.js");
const { Singleton, alias } = require("@anymod/core");
import VTU, { mount } from "@vue/test-utils";
import Userfront from "../../src/index.js";
if (jest) jest.useFakeTimers();

const Test = {
  factories,
  fns: {},
};

alias.setAlias("Userfront");

/**
 * Mount a Vue component with vue-test-utils and return its wrapper,
 * in a way that works in both VTU versions (VTU 1 = Vue 2; VTU 2 = Vue 3).
 * 
 * @param {object} Component 
 * @param {object} options 
 * @returns {object} vue-test-utils wrapper
 */
Test.fns.mount = (Component, options) => {
  const opts = {...options}
  opts.props = options.props || options.propsData
  delete opts.propsData
  return mount(Component, options)
}

/**
 * Mount a Vue component along with the Vue 3 Userfront plugin
 * @param {object} Component 
 * @param {object} options 
 * @returns {object} vue-test-utils wrapper
 */
const mountWithVue3Plugin = (Component, options) => {
  options.props = options.props || options.propsData
  delete options.propsData
  const plugins = options.global?.plugins ? [...options.global?.plugins] : []
  plugins.push([Userfront, { tenantId: "demo1234" }])
  if (options.global) {
    options.global = {
      ...options.global,
      plugins
    }
  } else {
    options.global = {
      plugins
    }
  }
  return mount(Component, options);
}

/**
 * Mount a Vue component along with the Vue 2 Userfront plugin
 * 
 * @param {object} Component 
 * @param {object} options 
 * @returns {object} vue-test-utils wrapper
 */
const mountWithVue2Plugin = (Component, options) => {
  options.propsData = options.propsData || options.props
  delete options.props
  const localVue = VTU.createLocalVue();
  localVue.use(Userfront);
  options.localVue = localVue;
  return mount(Component, options);
}

/**
 * Mount a Vue component along with the Userfront Vue plugin,
 * in the correct way for the Vue version under test (Vue 2 or Vue 3).
 * 
 * @param {object} Component 
 * @param {object} options 
 * @returns {object} vue-test-utils wrapper
 */
Test.fns.mountWithPlugin = (Component, options = {}) => {
  const opts = {...options}

  switch(process.env.VUE_VERSION) {
    case "3": {
      return mountWithVue3Plugin(Component, opts)
    }
    case "2":
    default: {
      return mountWithVue2Plugin(Component, opts)
    }
  }
}

/**
 * Mount a Vue component in the correct way for the
 * Vue version under test (Vue 2 or Vue 3).
 * 
 * @param {object} Component 
 * @param {object} options 
 * @returns {object} vue-test-utils wrapper
 */
Test.fns.mount = (Component, options = {}) => {
  switch(process.env.VUE_VERSION) {
    case "3": {
      return mountWithVue3Plugin(Component, options);
    }
    case "2":
    default: {
      return mount(Component, options);
    }
  }
}

Test.fns.defineSingleton = () => {
  Singleton.initialize();
  Singleton.ready = (cb) => {
    if (cb && typeof cb === "function") cb();
    return Promise.resolve();
  };
};

Test.fns.fireAllScriptOnloads = (document) => {
  if (!document) return;
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].onload) scripts[i].onload();
  }
};

Test.fns.fireAllLinkOnloads = (document) => {
  if (!document) return;
  const links = document.getElementsByTagName("link");
  for (let i = 0; i < links.length; i++) {
    if (links[i].onload) links[i].onload();
  }
};

Test.fns.fireAllOnloads = (document) => {
  Test.fns.fireAllLinkOnloads(document);
  Test.fns.fireAllScriptOnloads(document);
  if (jest) jest.runAllTimers();
};

if (window) Test.fns.defineSingleton();

export default Test;
