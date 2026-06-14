# LURE FISHING 静态站

## 配置文件

页面会读取两个配置文件：

- `site.config.json`：品牌、导航、视频列表、首页视频序号、默认视频封面、精选图集、日记、关于我
- `hero.config.json`：首页背景轮播图和首页按钮播放的视频

## 首页背景和首页视频

首页背景媒体只改 `hero.config.json`：

```json
{
  "interval": 10000,
  "images": [
    "assets/images/fist.png",
    "assets/images/1.jpg"
  ],
  "video": "assets/videos/1.MOV"
}
```

`images` 会每 10 秒自动切换一张。`interval` 单位是毫秒。

首页展示哪 3 个视频，在 `site.config.json` 里用 0 基序号控制：

```json
{
  "homeVideoIndexes": [0, 1, 2]
}
```

`0` 表示 `videos` 第一条，`1` 表示第二条。

## 视频列表

在 `site.config.json` 的 `videos` 里维护视频。视频不需要配置日期和时长。

```json
{
  "title": "视频标题",
  "image": "assets/images/1.jpeg",
  "video": "assets/videos/1.MOV"
}
```

如果某条视频没有 `image` 或 `image` 为空，会使用：

```json
{
  "videoDefaultImage": "assets/bfq.png"
}
```

点击“查看全部”会在本页面弹窗列出 `videos` 里的所有视频。

## 精选图集

在 `site.config.json` 的 `featuredImages` 里维护图片池：

```json
{
  "interval": 10000,
  "displayCount": 4,
  "images": [
    "assets/images/featuredImage/IMG_1384.jpeg",
    "assets/images/featuredImage/IMG_1387.jpeg"
  ]
}
```

页面每次加载会随机打乱图片顺序。图集每 10 秒自动整页切换；左右按钮或手机横滑也会整页切换。点击图片会在本页面打开预览，预览里也可以上一张/下一张切换。

## 日记

导航里的“日记”会跳到页面内的日记区。后续只需要在 `site.config.json` 的 `diary.entries` 里追加内容：

```json
{
  "title": "日记标题",
  "date": "2026-06-14",
  "location": "水域或城市",
  "weather": "天气 / 水情",
  "content": "这里写当天作钓记录、鱼情判断、用饵和心得。",
  "images": ["assets/images/fist.png"]
}
```

`diary.template` 里也保留了一份模板，可以直接复制后填内容。

## 关于我

点击导航里的“关于我”会弹出二维码。二维码图片和跳转地址在 `site.config.json` 里配置：

```json
{
  "about": {
    "qrImage": "assets/images/my-qr.png",
    "link": "https://example.com",
    "title": "关于我",
    "description": "扫码或点击二维码查看更多内容"
  }
}
```

如果还没有二维码图片，可以先留空 `qrImage`，页面会显示配置提示。

## 本地预览

因为页面会读取 JSON 配置，建议用本地服务器预览：

```bash
python3 -m http.server 4173
```

打开：

```text
http://localhost:4173
```
