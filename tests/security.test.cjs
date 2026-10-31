'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'skylight/service/index.js'), 'utf8');
function fixture(caller = 'skylightTV.Skylight', values = {cmd:'pause',seconds:'180'}, operation = 'http://tizen.org/appcontrol/operation/service') {
  let request = {callerAppId:caller,appControl:{operation,data:Object.keys(values).map(key=>({key,value:[values[key]]}))}};
  const timers = [];
  const ctx = {module:{exports:{}}, console:{log(){}}, Date, setInterval(fn){timers.push(fn);return timers.length},clearInterval(){},
    require(name){assert.equal(name,'http');return {get(){throw new Error('unexpected HTTP request')}}},
    tizen:{application:{getCurrentApplication(){return {getRequestedAppControl(){return request}}}}}};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  return {ctx,api:ctx.module.exports,setRequest(r){request=r}};
}
test('valid own-app IPC can pause and resume the guard',()=>{
 const {ctx,api}=fixture();api.onStart();api.onRequest();assert.ok(ctx.guard.pausedUntil>Date.now());
});
test('foreign and absent caller identity cannot command the guard',()=>{
 for(const caller of ['attacker.app','',null,undefined]) {
   const {ctx,api}=fixture(caller === undefined ? null : caller);api.onStart();api.onRequest();assert.equal(ctx.guard.pausedUntil,0);assert.equal(ctx.guard.timer,null);
 }
});
test('wrong operation is rejected even from the foreground app',()=>{
 const {ctx,api}=fixture('skylightTV.Skylight',{cmd:'pause',seconds:'180'},'http://tizen.org/appcontrol/operation/view');api.onRequest();assert.equal(ctx.guard.pausedUntil,0);
});
test('malformed commands and injection paths are rejected',()=>{
 const invalid=[{cmd:'exec',app:'shell'}, {cmd:'pause',seconds:'-1'},{cmd:'pause',seconds:'1801'},
   {cmd:'pause',seconds:'180;cmd'}, {cmd:'watch',app:'../../settings'},{cmd:'watch',app:'abc?query=1'},
   {cmd:'guard',shown:'ok.app,evil/../app'},{cmd:'guard',shown:'a'.repeat(32769)},
   {cmd:'guard',shown:Array(257).fill('ok.app').join(',')},{cmd:'pause',seconds:'180',extra:'bad'}];
 for(const values of invalid){const {ctx}=fixture('skylightTV.Skylight',values);assert.equal(ctx.readRequest(),null,JSON.stringify(values).slice(0,100));}
});
test('valid watch and guard list use bounded app IDs',()=>{
 for(const values of [{cmd:'watch',app:'org.tizen.netflix-app',shown:'org.tizen.netflix-app,abc123.App'}, {cmd:'guard',shown:''}]){
 const {ctx}=fixture('skylightTV.Skylight',values);assert.ok(ctx.readRequest());}
});
test('duplicate keys, prototype keys and multi-valued fields fail closed',()=>{
 const {ctx,setRequest}=fixture();
 for(const data of [[{key:'cmd',value:['stop']},{key:'cmd',value:['away']}],[{key:'__proto__',value:['bad']}],[{key:'cmd',value:['stop','away']}]]){
 setRequest({callerAppId:'skylightTV.Skylight',appControl:{operation:'http://tizen.org/appcontrol/operation/service',data}});assert.equal(ctx.readRequest(),null);
 }
});
test('no HTTP listener or permissive CORS remains',()=>{
 assert.doesNotMatch(source,/createServer|\.listen\(|Access-Control-Allow-Origin/);
 const app=fs.readFileSync(path.join(root,'skylight/js/app.js'),'utf8');assert.doesNotMatch(app,/helperGet|8130/);
});
test('packaged policy denies remote scripts and allows only local TV status',()=>{
 const config=fs.readFileSync(path.join(root,'skylight/config.xml'),'utf8');assert.doesNotMatch(config,/<access origin="\*"/);
 assert.match(config,/connect-src http:\/\/127\.0\.0\.1:8001;/);assert.match(config,/script-src 'self';/);assert.match(config,/object-src 'none'/);
});
