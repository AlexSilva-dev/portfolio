
import NavbarDefault from '../components/NavbarDefault.vue';
<template>
    <header class="px-5">
        <NavbarDefault></NavbarDefault>
    </header>
    <main class="px-5 xscroll-hidden">
        <slot></slot>
    </main>
</template>

<style scoped>
.xscroll-hidden {
    overflow-x: hidden;
    overflow-y: hidden;

}
</style>