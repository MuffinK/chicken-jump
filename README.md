A 3d game Imitating Alipay's ant farm using [threejs](https://threejs.org) and modeling using [blender](https://www.blender.org);

![](/pics/demo.jpg)

## try it
[github page](https://muffink.github.io/chicken-jump/index.1.html)

[aliyun mirror for China](https://media-oss-oss.oss-cn-shenzhen.aliyuncs.com/chicken-jump/index.1.html)

## workflow

1. modeling -> [blender](https://www.blender.org)
2. export model to glTF format-> [glTF IO](https://github.com/KhronosGroup/glTF-Blender-IO)
3. preview gltf model -> [gltf-viewer](https://gltf-viewer.donmccurdy.com)
4. 3d rendering engine -> [threejs](https://threejs.org/)
5. load gltf to rendering engine -> [gltf loader](https://threejs.org/docs/index.html#examples/loaders/GLTFLoader)
6. UI gesture control -> [hammerjs](https://hammerjs.github.io/)

## models
model binary files in [models folder](/resource/models/)

blender source files in [blender folder](/blender)

## furture task

- [ ] chicken's animation
- [ ] better caching model files with service worker
- [ ] [webVR](https://threejs.org/docs/index.html#manual/en/introduction/How-to-create-VR-content)


## development

npm run dev;

