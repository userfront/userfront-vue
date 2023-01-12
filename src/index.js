/*
  Export the Userfront singleton and form components in a way
  that works in both Vue2 and Vue3, and is backward-compatible
  with our existing Vue2 usage instructions.
*/

// Vue3 imports
import { version as _vueVersion, h } from "vue";

// Vue2 import
// Vue3 does not have a default export
import * as Vue from "vue";
// The Vue2 singleton is Vue 2's default export
// (Effectively this is `import Vue2 from "vue"`)
const Vue2 = Vue.default || {}

import AnyMod from "@anymod/core";
import Core from "@userfront/core";
import { satisfies } from "compare-versions";

/*
  Vue version checks
  Note that in the logic throughout, we generally assume that
  if we aren't using Vue3, then we're using Vue2.
*/
const vueVersion = _vueVersion || Vue2.version;
const isVue2 = satisfies(vueVersion, "~2")
const isVue3 = satisfies(vueVersion, "~3")

const {
  Singleton,
  alias,
  render,
  processPage,
  addScript1ToDocument,
  createOrReturnPage,
  checkPageAndUpdate,
  executeCallbacks,
  logErrorsAndTips,
} = AnyMod;

const { registerUrlChangedEventListener, addInitCallback } = Core;
alias.setAlias("Userfront");

Singleton.Opts.api = true;

/**
 * The order of operations is:
 *  1. Userfront.init() is called
 *  2. Callback is fired that adds Script1 to document and sets Singleton.isScript1Loading = true
 *  3. Userfront.build() is called
 *  4. componentDidMount() is called
 *  5. mountTools() is called
 *  6a. If Script1 hasn't loaded yet, wait for it to load
 *  6b. If Script1 has loaded, continue
 *  7. runAnyModSetup() is called
 */

// Callback to fire whenever Userfront.init is called
addInitCallback(({ tenantId }) => {
  Singleton.External.project = tenantId;
  addScript1ToDocument(
    "https://cdn.userfront.com/toolkit/page/",
    tenantId,
    runAnyModSetup
  );
});

registerUrlChangedEventListener();

window.addEventListener("urlchanged", render);

async function runAnyModSetup() {
  if (Singleton.isScript1Loading) return;
  const page = await createOrReturnPage();
  const updatedPage = await checkPageAndUpdate(page);
  await processPage(updatedPage);
  executeCallbacks();
  logErrorsAndTips();
}

async function mountTools() {
  try {
    runAnyModSetup();
  } catch (err) {
    let message = err && err.message ? err.message : "Problem loading page";
    console.warn(message, err);
  }
}

/*
  Render functions
  Differences:
  Vue2 passes in a `createElement` function. Vue3 exports `h` to create vnodes
  Vue2's createElement expects createElement("div", { attrs: { id: "..." }})
  Vue3's h expects h("div", { id: "..." })
*/
function renderVue2(createElement) {
  return createElement("div", [
    createElement("div", {
      attrs: {
        id: `userfront-${this.toolId}`,
      },
    }),
  ]);
}
function renderVue3() {
  return h("div", [
    h("div", {
      id: `userfront-${this.toolId}`,
    }),
  ]);
}

// Component config
const componentConfig = {
  props: {
    toolId: {
      type: String,
    },
  },
  // Call the appropriate render function
  render(...args) {
    if (isVue3) {
      return renderVue3.call(this, ...args)
    } else {
      return renderVue2.call(this, ...args)
    }
  },
  async mounted() {
    await mountTools();
  },
}

/**
 * Registers a Vue component for a toolkit item.
 * Uses "render" instead of "template" to avoid runtime compiler:
 * https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
 *
 * @param {object} app - Vue app to register component on (Vue 2 singleton or Vue 3 instance)
 * @param {string} name - name of the component
 * @returns
 */
function register(app, name) {
  if (!app.component) {
    console.warn('@userfront/vue: tried to register a component without being passed a Vue instance. This is likely a bug with @userfront/vue.')
    return
  }
  if (name) {
    return app.component(name, componentConfig);
  }
  console.warn('@userfront/vue: tried to register a component without a name. This is likely a bug with @userfront/vue.')
}

/**
 * If Vue 2 is in use, build component with the Vue singleton, and in development give a soft deprecation notice in console.
 * If Vue 3 is in use, give a useful console error and throw.
 * If Vue is not found, throw.
 * @param {string} name - name of component to register with the Vue singleton
 * @returns 
 */
function legacyBuild(name) {
  // Vue 3: cannot use this method, must use plugin
  // Log a helpful warning, and throw an error so client gets a stack trace
  if (isVue3) {
    console.warn(
`@userfront/vue: when using with Vue 3, you %c must %c install Userfront as a plugin to your Vue application instance: %c
    import { createApp } from 'vue'
    import Userfront from '@userfront/vue'
    
    const app = createApp({ ... })
    
    app.use(Userfront, {
      tenantId: 'abcd1234' // your application's tenant ID
    })`,
      // console styles
      "font-weight: bold",
      "font-weight: normal",
      "font-family: monospace; background: #f0f8ff; color: #808080")
    throw new Error("@userfront/vue: Userfront must be installed as a plugin to your Vue application instance when using Vue 3 or higher.")
  }
  // Vue 2: can use this method
  // In the future: recommend using plugin anyways, as a console.info, but not in production
  if (isVue2 || Vue2?.component) {
    return register(Vue2, name);
  }
  throw new Error("@userfront/vue: called Userfront.build, but Vue was not found. Check that Vue is installed correctly.")
}

/**
 * Build components in a cross-compatible way:
 *   - For Vue 3, return the component configuration, so the client can import and locally register the component.
 *   - For Vue 2, register the component on the global Vue singleton and return it.
 * Note that these are different behaviors; the Vue 3 case is the desired behavior, while the Vue 2 case
 * is for backwards compatibility.
 * @param {string} name - name of the component to register (Vue 2 only)
 */
function compatibleBuild(name) {
  if (isVue3) {
    return componentConfig;
  }
  if (Vue2 && Vue2.component) {
    return register(Vue2, name);
  }
}

// Export legacyBuild() as build() for backward compatibility
/**
 * Register a component with the Vue 2 singleton, so it can be used across the app.
 * 
 * @deprecated recommend installing Userfront as a Vue plugin.
 *  Vue 2: Vue.use(Userfront) 
 *  Vue 3: vueApp.use(Userfront))
 * @param {string} name - the name of the component to register
 */
export const build = legacyBuild;

/**
 * Install Userfront as a Vue plugin, making its components available globally.
 * 
 * @param {object} app - Vue instance or singleton to install Userfront plugin on
 * @param {object} options - options to pass to Userfront
 * @param {string} options.tenantId - your Userfront tenant ID
 */
function install(app, options) {
  if (options.tenantId) {
    Core.init(options.tenantId)
  }
  register(app, "signup-form")
  register(app, "login-form")
  register(app, "password-reset-form")
  register(app, "logout-button")
}

export const SignupForm = compatibleBuild("signup-form");
export const LoginForm = compatibleBuild("login-form");
export const PasswordResetForm = compatibleBuild("password-reset-form");
export const LogoutButton = compatibleBuild("logout-button");

export const Userfront = {
  install,
  build: legacyBuild,
  SignupForm,
  LoginForm,
  PasswordResetForm,
  LogoutButton,
};

for (const attr in Core) {
  if (!Userfront[attr]) Userfront[attr] = Core[attr];
}

export default Userfront;
