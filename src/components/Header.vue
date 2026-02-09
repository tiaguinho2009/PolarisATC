<template>
    <header class="header">
        <div class="header-group left">
            <div class="header-item">
                <span class="label">IVAO</span>
            </div>

            <div class="header-item">
                <span class="label">LPPR_TWR</span>
            </div>

            <div class="header-item">
                <span class="label">199.999</span>
            </div>
        </div>

        <div class="header-group right">
            <div class="header-item clickable">
                Settings
            </div>
        </div>
    </header>
</template>

<script setup lang="ts"></script>

<style scoped>
.header {
    height: 32px;
    width: 100%;
    flex-shrink: 0;

    display: flex;
    flex-direction: row;
    justify-content: space-between;

    background: var(--ui-panelBackground);
    border-bottom: 1px solid var(--ui-panelBorder);

    user-select: none;
    font-size: 13px;
}

.header-group {
    display: flex;
    flex-direction: row;
    height: 100%;
}

.header-item {
    display: flex;
    align-items: center;

    padding: 0 10px;

    border-right: 1px solid var(--ui-panelBorder);
    color: var(--ui-textPrimary);
    white-space: nowrap;
}

.header-group.right .header-item {
    border-right: none;
    border-left: 1px solid var(--ui-panelBorder);
}

.label {
    font-weight: 500;
    letter-spacing: 0.3px;
}

.clickable {
    cursor: pointer;
    transition: all ease-in-out 0.2s;
}

.clickable:hover {
    background: color-mix(in srgb,
            var(--ui-secondary) 15%,
            transparent);
}
</style>
