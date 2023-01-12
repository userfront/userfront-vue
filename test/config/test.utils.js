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

Test.fns.mount = (Component, options) => {
  const opts = {...options}
  opts.props = options.props || options.propsData
  delete opts.propsData
  return mount(Component, options)
}

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

const mountWithVue2Plugin = (Component, options) => {
  options.propsData = options.propsData || options.props
  delete options.props
  const localVue = VTU.createLocalVue();
  localVue.use(Userfront);
  options.localVue = localVue;
  return mount(Component, options);
}

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
