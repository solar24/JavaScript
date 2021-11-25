/*

脚本源地址：https://gitee.com/curtinlv/qx/raw/master/Script/youthShareRead.js

40 15 * * * https://raw.githubusercontent.com/solar24/JavaScript/main/zq/zq_share_read.js 中中青分享阅读助力

中青分享阅读助力10次

使用方法：
Quantumuil X：添加远程重写
[rewrite_remote]
https://gitee.com/curtinlv/qx/raw/master/rewrite/youth.conf, tag=中青 by Curtin, update-interval=172800, opt-parser=false, enabled=true

中青分享一篇文章到自己的微信上，自己点击一下即触发会自动完成10好有阅读奖励 500青豆/次。

 */
const $ = new Env("中青分享阅读助力");
const notify = $.isNode() ? require('../sendNotify') : '';
const { zq_share_read_file } = $.isNode() ? require('./zq_file') : '';
let zqNotify = false;//是否关闭通知，false打开通知推送，true关闭通知推送
let user_name = $.isNode() ? require('./zq_file').user_name : ($.getdata('user_name') ? $.getdata('user_name') : "");
let zqShareReadUrl= $.isNode() ? (process.env.zqShareReadUrl ? process.env.zqShareReadUrl : "") : ($.getdata('zqShareReadUrl') ? $.getdata('zqShareReadUrl') : "")
let zqShareReadUrls = '', zqShareReadUrlArr = [], zqShareReadUrl1

if (zqShareReadUrl) {
    if (zqShareReadUrl.indexOf("@") === -1) {
        zqShareReadUrlArr.push(zqShareReadUrl)
    } else if (zqShareReadUrl.indexOf("@") > -1) {
        zqShareReadUrls = zqShareReadUrl.split("@")
    } else if (process.env.zqShareReadUrl && process.env.zqShareReadUrl.indexOf('@') > -1) {
        zqShareReadUrlArr = process.env.zqShareReadUrl.split('@');
        console.log(`您选择的是用"@"隔开\n`)
    }
} else if($.isNode()){
    const fs = require("fs");
    const { resolve } = require('path');
    let zq_share_read_path = resolve(__dirname, zq_share_read_file);
    zqShareReadUrl = fs.readFileSync(zq_share_read_path, "utf8");
    if (zqShareReadUrl !== `undefined`) {
        zqShareReadUrls = zqShareReadUrl.split("\n");
    } else {
        $.msg($.name, '【提示】请在app分享文章到微信，下拉点击 “点击查看全文” 获取数据', '不知道说啥好', {
            "open-url": "给您劈个叉吧"
        });
        $.done()
    }
}
Object.keys(zqShareReadUrls).forEach((item) => {
    if (zqShareReadUrls[item] && !zqShareReadUrls[item].startsWith("#")) {
        zqShareReadUrlArr.push(zqShareReadUrls[item])
    }
})


!(async () => {
    if (typeof $request !== "undefined") {
        await getShareInfo()
        $.done()
    }else {
        console.log(`\n====================共${zqShareReadUrlArr.length}个分享阅读任务====================\n`);

        allScore = 0;
        for (let k = 0; k < zqShareReadUrlArr.length; k++) {
            zqShareReadUrl1 = zqShareReadUrlArr[k];
            const o_si = url.match(/si=(.*?)&/)[1];
            for(let i = 1; i < 11; i++){
                console.log(`\n第 ${k + 1} 条分享阅读数据，第 ${i} 次阅读助力\n`)
                let n_si = randomsi();
                let n_url = zqShareReadUrl1.replace(o_si, n_si);
                let iosV = parseInt(Math.random() * (14 - 11 + 1) + 11, 10);
                await postShareInfo(n_url, iosV)
                let sleep_time = Math.floor(Math.random() * (15000 - 10000 + 10000) + 20000);
                console.log(`\n随机等待 ${sleep_time/1000} 秒\n`)
                await $.wait(sleep_time);
            }
            console.log("\n\n")
        }

        $.message = `【中青账号】 ${user_name}\n【分享阅读数量】 ${zqShareReadUrlArr.length} 【分享阅读结果】 分享完成🎉\n`;
        console.log($.message);

        if (zqNotify) {
            $.msg($.name, '', `\n${$.message}\n`);
            if ($.isNode()) {
                await notify.sendNotify($.name, `\n${$.message}`);
            }
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

//分享数据获取
async function getShareInfo() {
    try {
        if ($request.headers && $request.url.indexOf("script.baertt.com/count2") > -1) {
            const url = $request.url;
            if (zqShareReadUrl) {
                if (zqShareReadUrl.indexOf(url) > -1) {
                    $.log("此分享阅读数据已存在，本次跳过")
                } else if (zqShareReadUrl.indexOf(url) === -1) {
                    zqShareReadUrls = zqShareReadUrl + "@" + url;
                    $.setdata(zqShareReadUrls, 'zqShareReadUrl');
                    $.log(`${$.name} 获取分享阅读数据: 成功, zqShareReadUrl: ${url}`);
                    let body = zqboxbodys.split("@")
                    $.msg($.name, ``, `获取第 ${body.length} 个分享阅读数据: 成功🎉`)
                }
            } else {
                $.setdata(url, 'zqShareReadUrl');
                $.log(`${$.name} 获取分享阅读数据: 成功, zqShareReadUrl: ${url}`);
                $.msg($.name, ``, `获取第 1 个分享阅读数据: 成功🎉`)
            }
        }
    } catch (eor) {
        $.msg($.name, ``, `获取分享阅读数据请求失败`)
    }
}
async function postShareInfo(url, iosV, timeout=0) {
    return new Promise((resolve) => {
        let header = {
            'Accept-Encoding': `gzip, deflate, br`,
            'Accept': `*/*`,
            'Connection': `keep-alive`,
            'Referer': `https://focus.youth.cn/`,
            'Host': `script.baertt.com`,
            'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosV}_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.7(0x18000730) NetType/WIFI Language/zh_CN`,
            'Accept-Language': `zh-cn`
        };
        let url = {
                url: url,
                headers: header,
            };
            $.get(url, async (err, resp, data) => {
                try {
                    console.log(`\n中青分享阅读: ${data}`);
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve()
                }
            });

            return 0;
        }, timeout)
}

//随机udid 小写
function randomsi() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + S4() + S4() + S4() +  S4() + S4() + S4());
}

function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }