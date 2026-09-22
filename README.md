# NetEaseMusicWorld+ MV3

解锁网易云音乐网页版的海外播放限制。

这是 [nondanee/NetEaseMusicWorldPlus](https://github.com/nondanee/NetEaseMusicWorldPlus) 的 Manifest V3 兼容分支，在保留原版三种运行模式的基础上，适配新版 Chromium 扩展机制并修复迁移过程中发现的问题。

## 与原版的区别

| 项目 | 原版 | 本分支 |
| --- | --- | --- |
| 扩展规范 | Manifest V2 | Manifest V3 |
| 后台运行方式 | 常驻后台脚本 | Extension Service Worker |
| 请求头修改 | `webRequestBlocking` | `declarativeNetRequest` |
| 模式状态 | 后台全局变量 | `chrome.storage.local` 持久化 |
| CDN 请求匹配 | 在 `webRequest` 回调中动态判断 | 使用覆盖所有请求类型的 DNR 域名规则 |
| 模式切换 | 增强模式需要刷新页面 | 页面打开时也可即时切换 |
| XHR 拦截 | 可能覆盖或被覆盖 `onreadystatechange` | 使用事件监听器，不干扰网页回调 |

## 安装

1. 下载或克隆本仓库。
2. 在 Chrome 或其他 Chromium 浏览器中打开 `chrome://extensions`。
3. 开启“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择本仓库目录。

代码更新后，需要在扩展管理页面重新加载扩展，并刷新已经打开的网易云音乐页面。

## 使用

点击浏览器工具栏中的扩展图标，可依次切换以下模式：

- **关闭模式（灰色）**：不修改请求或播放地址。
- **普通模式（红色）**：与 [acgotaku/NetEaseMusicWorld](https://github.com/acgotaku/NetEaseMusicWorld) 的原版功能一致，通过 `X-Real-IP` 请求头解除地区限制。
- **增强模式（蓝色）**：在普通模式的基础上，将接口返回的海外 CDN 地址改写为可访问的 CDN 地址，无需修改系统 `hosts` 文件。

模式切换会立即生效，不需要重新加载页面。

## 工作原理

普通模式和增强模式都会为发往 `music.163.com` 的请求设置：

```http
X-Real-IP: 211.161.244.70
```

增强模式还会拦截播放器接口返回的数据，将类似以下地址：

```text
https://m7.music.126.net/...
```

改写为：

```text
https://m7c.music.126.net/...
```

同时为改写后的 CDN 请求设置：

```http
Cache-Control: no-cache
```

`https://music.163.com` 是网易云音乐网站和 API 的主域名；`*.music.126.net` 是音频文件使用的 CDN 域名，因此扩展需要访问这两个域名。

## 为什么不直接重定向请求

网易云音乐网页版播放器通过 XHR 请求播放地址。直接重定向请求可能使浏览器发出的 CORS `OPTIONS` 预检请求收到非 2xx 响应，导致播放失败或下一首歌曲无法从头播放（参见原项目 [#1](https://github.com/nondanee/NetEaseMusicWorldPlus/issues/1)）。

因此，本扩展不会通过网络请求 API 直接重定向音频地址，而是在页面中拦截播放器接口响应并修改其中的 CDN URL。

## 权限说明

- `storage`：保存当前运行模式。
- `declarativeNetRequestWithHostAccess`：为指定域名设置必要的请求头。
- `*://music.163.com/*`：访问网易云音乐网页及 API。
- `*://*.music.126.net/*`：访问网易云音乐音频 CDN。

本扩展不会收集或上传用户数据。

## 致谢

- [nondanee/NetEaseMusicWorldPlus](https://github.com/nondanee/NetEaseMusicWorldPlus)
- [acgotaku/NetEaseMusicWorld](https://github.com/acgotaku/NetEaseMusicWorld)

## License

[GPL-3.0](LICENSE)
