# ⚠️ Deprecated: new projects should use the [Userfront Toolkit](https://github.com/userfront/toolkit) ([npm: @userfront/toolkit](https://www.npmjs.com/package/@userfront/toolkit))

This library is no longer receiving updates. Please use `@userfront/toolkit` instead.

## Userfront Vue

The Userfront Vue binding allows you to quickly add pre-built signup, login, and password reset forms to your Vue.js application.

This binding includes all methods from the Userfront [core JS library](https://userfront.com/docs/js.html).

The Userfront Vue library supports both Vue 2 and Vue 3.

## Setup

[Working example](https://codesandbox.io/s/userfront-vue-example-5xf85?file=/src/App.vue)

You can find installation instructions for your account in the **Toolkit** section of the Userfront dashboard.

### 1. Install the `@userfront/vue` package with npm (or yarn)

```sh
npm install @userfront/vue --save
```

### 2. Initialize Userfront and any tools you want to use, then render them

```html
<template>
  <div>
    <signup-form tool-id="nkmbbm" />
  </div>
</template>

<script>
  import Userfront, { SignupForm } from "@userfront/vue";

  Userfront.init("demo1234");

  export default {
    components: {
      SignupForm,
    },
  };
</script>
```

<details><summary>Usage as a Vue plugin:</summary>

Userfront may also be installed as a Vue plugin.

This initializes Userfront when your app launches, and makes all of the tools available anywhere any your app.

**Vue 3**:

```js
// main.js - Vue 3
import { createApp } from "vue";
import App from "./App.vue";
import Userfront from "@userfront/vue";

const app = createApp(App);
// Install Userfront as a plugin
app.use(Userfront, { tenantId: "demo1234" });

app.mount("#app");
```

**Vue 2**:

```js
// main.js - Vue 2
import Vue from "vue";
import App from "./App.vue";
import Userfront from "@userfront/vue";

// Install Userfront as a plugin
Vue.use(Userfront, { tenantId: "demo1234" });

new Vue({ render: (h) => h(App) })
  .$mount("#app");
```

When the plugin is initialized, it automatically calls `Userfront.init()` with your tenant ID.

This registers the forms globally on your Vue instance, so you can use them in any component:

```html
<!-- Vue 2 and Vue 3 -->
<template>
  <div>
    <SignupForm tool-id="nkmbbm" />
  </div>
</template>

<script>
  // No script needed!
</script>
```

When using as a plugin, Core JS methods are used as in the following section.

</details>

This example uses the following:

- Account ID: `demo1234`
- Tool ID: `nkmbbm` (signup form)

This will add a working signup form to your page:

![Signup form](https://res.cloudinary.com/component/image/upload/v1597168270/permanent/signup-mod.png)

## Core JS methods

When you add the Userfront Vue binding to your application, you can use any of the methods from the Userfront core JS library too.

Docs for the core JS methods are here: https://userfront.com/docs/js.html

Note that you do **not** need to import `@userfront/core` separately when using the Vue binding.

Examples:

```js
// Import and initialize Userfront Vue
import Userfront from "@userfront/vue";
Userfront.init("demo1234");

// Send a login link
Userfront.sendLoginLink("jane@example.com");

// Read the access token
Userfront.tokens.accessToken;

// => "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJtb2RlIjoidGVzdCIsImlzQ29uZmlybWVkIjp0cnVlLCJ1c2VySWQiOjEsInVzZXJVdWlkIjoiZDAwNTlmN2UtYzU0OS00NmYzLWEzYTMtOGEwNDY0MDkzZmMyIiwidGVuYW50SWQiOiJwOW55OGJkaiIsInNlc3Npb25JZCI6IjRlZjBlMjdjLTI1NDAtNDIzOS05YTJiLWRkZjgyZjE3YmExYiIsImF1dGhvcml6YXRpb24iOnsicDlueThiZGoiOnsidGVuYW50SWQiOiJwOW55OGJkaiIsIm5hbWUiOiJVc2VyZnJvbnQiLCJyb2xlcyI6WyJhZG1pbiJdLCJwZXJtaXNzaW9ucyI6W119fSwiaWF0IjoxNjE3MTQ4MDY3LCJleHAiOjE2MTk3NDAwNjd9.gYz4wxPHLY6PNp8KPEyIjLZ8QzG3-NFJGPitginuLaU"

// Log the user out
Userfront.logout();

// Access the user's information
Userfront.user;

/** =>
 * {
 *    email: "jane@example.com",
 *    name: "Jane Example",
 *    image: "https://res.cloudinary.com/component/image/upload/avatars/avatar-plain-9.png",
 *    data: {},
 *    username: "jane-example",
 *    confirmedAt: "2020-01-01T00:00:00.000Z",
 *    isConfirmed: true,
 *    createdAt: "2020-01-01T00:00:00.000Z",
 *    updatedAt: "2020-01-01T00:00:00.000Z",
 *    mode: "test",
 *    tenantId: "demo1234",
 *    userId: 1,
 *    userUuid: "d6f0f045-f6ea-4262-8724-dfc0b77e7dc9",
 * }
 */
```
