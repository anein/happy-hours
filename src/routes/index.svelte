<script>
    import successkid from 'images/successkid.jpg';


    let result = null;
    let friendId = null;

    async function clickHandler() {

        let response;

        try {
            response = await fetch(`/api/matches`)
        } catch (e) {
            result = e;
            return
        }

        if (response.status !== 200) {
            result = response.statusText;
            return;
        }

        result = await response.json();

    }

</script>

<style>
    h1, figure, p {
        text-align: center;
        margin: 0 auto;
    }

    h1 {
        font-size: 1.5em;
        text-transform: uppercase;
        font-weight: 700;
        margin: 0 0 0.5em 0;
    }

    figure {
        margin: 0 0 1em 0;
    }

    img {
        width: 100%;
        max-width: 400px;
        margin: 0 0 1em 0;
    }

    p {
        margin: 1em auto;
    }

    @media (min-width: 480px) {
        h1 {
            font-size: 2em;
        }
    }
</style>

<svelte:head>
    <title>Hours with friends</title>
</svelte:head>

<h1>Happy hours with Steam friends</h1>

<input type="text" />
<button on:click={clickHandler}> click</button>

{#if result}
    <!--  AN error  -->
    {#if typeof result === "string"}
        <p>{result}</p>
    {/if}

    {#if typeof result === "object"}
        <pre>{JSON.stringify(result, null, 2)}</pre>
    {/if}

{/if}

