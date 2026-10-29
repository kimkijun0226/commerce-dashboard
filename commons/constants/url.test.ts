import assert from "node:assert/strict";
import test from "node:test";
import { getRouteAccess } from "./url";
test("all admin pages including product editors are protected without affecting public storefronts",()=>{
  for(const path of ["/admin","/admin/products/new","/admin/products/abc","/admin/settings","/admin/orders/abc"])assert.equal(getRouteAccess(path),"admin");
  assert.notEqual(getRouteAccess("/administrator"),"admin");
  assert.notEqual(getRouteAccess("/beauty"),"admin");
});
