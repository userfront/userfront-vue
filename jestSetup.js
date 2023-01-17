const Vue = require("vue");
const { log } = require("console");

const expectedVueVersion = process.env.VUE_VERSION && `${process.env.VUE_VERSION}`;

if (expectedVueVersion && !Vue.version.startsWith(expectedVueVersion)) {
  throw new Error(`Wrong Vue version. Expected ^${expectedVueVersion}, got ${Vue.version}`)
}