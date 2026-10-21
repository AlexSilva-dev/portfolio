<template>
    <div id="contact-componet" class="container">
        <h1 class="h2 text-center mb-5">- Contato -</h1>
        <div class="row gx-4 gy-5 justify-content-center">
            <a href="mailto:alexdsilva.dev@gmail.com" class="col-12 col-sm-6 col-md-4">
                <div class="d-flex flex-column align-items-center">
                    <img src="../assets/icons/icons8-email-96.png" alt="email icone" width="60px" height="auto"
                        class="icon">
                    <span class="h5">Email</span>
                    <span>
                        alexdsilva.dev@gmail.com
                    </span>
                </div>
            </a>

            <a href="https://www.linkedin.com/in/alex-da-silva1/" class="col-12 col-sm-6 col-md-4">
                <div class=" d-flex flex-column align-items-center">
                    <img src="../assets/icons/icons8-linkedin-100.png" alt="email icone" width="60px" height="auto"
                        class="icon">
                    <span class="h5">Linkedin</span>
                    <span>
                        @alex-da-silva1
                    </span>
                </div>
            </a>

            <a href="https://github.com/AlexSilva-dev" class="col-12 col-sm-6 col-md-4">
                <div class="d-flex flex-column align-items-center">
                    <img src="../assets/icons/icons8-github-100.png" alt="email icone" width="60px" height="auto"
                        class="icon">
                    <span class="h5">GitHub</span>
                    <span>
                        @AlexSilva-dev
                    </span>
                </div>
            </a>


        </div>
    </div>
</template>

<script lang="js">

</script>

<style>
#contact-componet .icon {
    padding: 6px;
    border: 0px solid red;
    border-radius: 300px;
    background-color: rgba(128, 128, 128, 0.185);
    object-fit: contain;
    overflow-clip-margin: inherit;
}

#contact-componet a {
    padding: 1%;
    text-decoration: none;
    color: white;
    border-radius: 20px;
}

#contact-componet a:hover {
    background-color: #2610585b;

    animation: pulse;
    /* referring directly to the animation's @keyframe declaration */
    animation-duration: 2s;
    /* don't forget to set a duration! */
}
</style>
