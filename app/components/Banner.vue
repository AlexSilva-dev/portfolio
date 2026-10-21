<template>
    <div class="d-flex flex-column flex-md-row align-items-md-center">
        <div class="col">
            <h1 class="apresentation-title text-center text-md-start animate__animated animate__slideInLeft">
                Olá, eu sou <span class="apresentation-name">Alex</span>
            </h1>
            <h2 class="apresentation-subtitle text-center text-md-start animate__animated animate__slideInUp">
                Desenvolvedor Full-Stack
            </h2>
        </div>
        <div class="align-items-end mx-auto mt-5">
            <div>
                <img src="../assets/gifs/alex.gif" alt="Alex" class="profile-img">
            </div>
        </div>
    </div>
</template>

<style>
.profile-img {
    object-fit: cover;
    width: 70vw;
    height: 70vw;
}

.apresentation-name {
    color: #8257E6;
}

.apresentation-title {
    font-size: 40px;
}

.apresentation-subtitle {
    font-size: 20px;
}

@media (min-width: 760px) {

    .apresentation-title {
        font-size: 5vw;
    }

    .apresentation-subtitle {
        font-size: 3vw;
    }

    .profile-img {
        object-fit: cover;
        width: 30vw;
        height: auto;
    }

}
</style>