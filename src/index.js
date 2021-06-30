import Vue from "vue";
import AnyMod from "@anymod/core";
import Core from "@userfront/core";

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
    "https://mod.userfront.com/v3/page/",
    tenantId,
    runAnyModSetup
  );
});

registerUrlChangedEventListener();

window.addEventListener("urlchanged", render);

async function runAnyModSetup() {
  if (Singleton.isScript1Loading) return;
  try {
    const page = await createOrReturnPage();
    const updatedPage = await checkPageAndUpdate(page);
    await processPage(updatedPage);
    executeCallbacks();
    logErrorsAndTips();
  } catch (error) {
    console.log(error);
  }
}

async function mountTools() {
  try {
    runAnyModSetup();
  } catch (err) {
    let message = err && err.message ? err.message : "Problem loading page";
    console.warn(message, err);
  }
}

function build() {
  const name = `userfront-${Math.random().toString(36).substring(6)}`;
  return Vue.component(name, {
    props: {
      id: {
        type: String,
        required: true,
      },
    },
    template: `<div><div id="userfront-${this.id}"></div></div>`,
    async mounted() {
      await mountTools();
    },
  });
}

const Userfront = {
  build,
  SignupForm: build,
  LoginForm: build,
  PasswordResetForm: build,
  LogoutButton: build,
};

for (const attr in Core) {
  if (!Userfront[attr]) Userfront[attr] = Core[attr];
}

export default Userfront;
