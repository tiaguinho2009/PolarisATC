<template>
    <div ref="container" class="radar-root"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { Application, Container } from "pixi.js";

const container = ref<HTMLDivElement | null>(null);

let app: Application | null = null;
let layerGround: Container | null = null;

onMounted(async () => {
    if (!container.value) return;

    app = new Application();

    await app.init({
        background: "#000000",
        resizeTo: container.value,
        antialias: true,
    });

    container.value.appendChild(app.canvas);

    layerGround = new Container();
    layerGround.zIndex = 0;

    app.stage.sortableChildren = true;
    app.stage.addChild(layerGround);
});

onBeforeUnmount(() => {
    app?.destroy(true, {
        children: true,
        texture: true,
    });
});
</script>

<style>
.radar-root {
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 0;
}
</style>
