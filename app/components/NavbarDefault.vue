<script setup>
</script>

<template>
    <nav class="navbar bg-dark navbar-expand-sm bg-body-tertiary fixed-top" data-bs-theme="dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Portifólio</a>
            <button @click="showNav" class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent"
                aria-expanded="true" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav ms-4">
                    <a id="nav-item-aboutme" class="nav-link active" aria-current="page" href="#about-me">Sobre mim</a>
                    <a class="nav-link" href="#technology-componet">Tecnologias</a>
                    <a class="nav-link" href="#my-projects">Projetos</a>
                    <a class="nav-link" href="#contact-componet">Contato</a>
                </div>
            </div>
        </div>
    </nav>
</template>

<script lang="js">
export default {
    methods: {
        showNav() {
            const offcanvasNavbar = document.getElementById('navbarNavAltMarkup');
            offcanvasNavbar.classList.toggle('show');
        }
    }
};


</script>

<style scoped>
.navbar {
    border-radius: 10px;
    margin: 0px 10px;
    max-width: 100%;
}
</style>
