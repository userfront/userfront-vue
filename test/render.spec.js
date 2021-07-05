import { mount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import Test from "./config/test.utils.js";
import Userfront, { SignupForm } from "../src/index.js";
import AnyMod, { Singleton } from "@anymod/core";

const scope = {};

// TODO figure out how to spy on the createOrReturnPage method correctly
// const corpSpy = jest.spyOn(AnyMod, "createOrReturnPage");

describe("Render a signup form", () => {
  beforeAll(async () => {
    Userfront.init("demo1234");
    Singleton.isScript1Loading = false;
  });

  it("should make a proper request to the endpoint", async () => {
    const wrapper = await mount(SignupForm, {
      propsData: {
        toolId: Test.factories.mods.basic.eid,
      },
    });
    expect(wrapper.element.innerHTML).toEqual(
      `<div id="userfront-${Test.factories.mods.basic.eid}"></div>`
    );
    await flushPromises();
    // TODO figure out how to spy on the createOrReturnPage method correctly
    // expect(corpSpy).toHaveBeenCalled();
    // expect(corpSpy).toHaveBeenCalledWith([Test.factories.mods.basic.eid]);
  });
});
