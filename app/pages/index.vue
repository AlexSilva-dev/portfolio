<template>
    <div class="container my-5 pt-5">
        <Banner></Banner>
        <AboutMe class="vh-60" id="about-me" data-aos="fade-up-left"
            data-aos-duration="700" data-aos-offset="100"
            v-on:intersection="activateNavbarItem" data-navbar="nav-item-aboutme">
        </AboutMe>

        <Technology class="vh-60" data-aos="fade-up-right" data-aos-duration="700">
        </Technology>

        <Projects class="vh-60" data-aos="fade-up-left" data-aos-duration="700"/>

        <Contact class="vh-60" data-aos="fade-up" data-aos-duration="700">
        </Contact>

        <div class="vh-20 text-center py-5">
            <small class="used-framework">
                Desenvolvido com Nuxt.JS
            </small>
        </div>
    </div>
</template>
<script lang="js">
export default {
    mounted() {

    },
    methods: {
        activateNavbarItem(entries, observer) {

        }
    }
}
</script>
<style>
body {
    padding-bottom: 10%;
}

.vh-60 {
    margin-top: 60vh;
}

.vh-20 {
    margin-top: 20vh;
}

.used-framework {
    filter: brightness(50);
}
</style>

