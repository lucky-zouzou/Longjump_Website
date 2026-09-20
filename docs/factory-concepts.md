# LOONG JUMP 工厂概念效果图

> 历史素材：以下为首版六图。当前网站已改用用户提供的十张投产效果图，见 [当前工厂图库](factory-cba-gallery.md)。这些原图和网站副本保留供后续参考。

这组六张效果图用于自有印尼工厂的展示方案。用户已确认拥有印尼工厂；图中的建筑、布局、设备、工作人员和具体场景均为 AI 概念设计，不是现有工厂实拍或对实际设施的记录。

统一视觉：暖白厂房、沙米色背景、焦糖棕细节、自然采光，适合精品女包品牌的批发与 OEM 展示。六张图均已完成。页面采用两张主图与四张细节图，支持放大浏览；OEM 区复用打样室图片。

## 图片索引

| 场景 | 原始效果图 | 网站素材 |
| --- | --- | --- |
| 厂房外观与接收区 | [原图](../output/imagegen/factory/exterior-concept.png) | [WebP](../public/images/factory/exterior-concept.webp) |
| 缝制与组装车间 | [原图](../output/imagegen/factory/sewing-concept.png) | [WebP](../public/images/factory/sewing-concept.webp) |
| 材料与裁剪区 | [原图](../output/imagegen/factory/materials-concept.png) | [WebP](../public/images/factory/materials-concept.webp) |
| 产品品控区 | [原图](../output/imagegen/factory/quality-concept.png) | [WebP](../public/images/factory/quality-concept.webp) |
| 包装与发货区 | [原图](../output/imagegen/factory/packing-concept.png) | [WebP](../public/images/factory/packing-concept.webp) |
| OEM 打样室 | [原图](../output/imagegen/factory/sample-concept.png) | [WebP](../public/images/factory/sample-concept.webp) |

## 生成记录

- 生成方式：内置 `image_gen` 工具，每个场景独立生成，未使用外部 CLI。
- 完整最终提示词：[factory-image-prompts.json](factory-image-prompts.json)。其中 `materials-cutting` 对应素材名 `materials`，`sample-studio` 对应 `sample`。
- 原始文件保存在本地 `output/imagegen/factory/`。网站使用转换为 WebP 的版本；转换仅用于传输压缩，不重新生成、合成或修改画面内容。
- 尺寸、网站文件体积和完整本地路径记录在 [factory-assets.json](factory-assets.json)。
- 页面在图库说明、每张缩略图、放大视图及 OEM 图位置均标注概念图身份；没有添加未经确认的面积、产能、地址或认证信息。

## 后续替换

取得实拍照片后，可替换 `public/images/factory/` 的对应素材，并在 `lib/factory-content.ts` 更新说明、替代文字及概念标记。若一部分仍为概念图，应保留这些图片的单独说明。
