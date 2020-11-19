<script>
    import successkid from 'images/successkid.jpg';


    let result = null;
    let selectedFriendId = 0;

    const friends = [
        {"name": "P-2", id: "893728993"},
        {"name": "Alise2k", id: "32081734"},
        {"name": "RedClone", id: "839959568"},
    ]

    async function clickHandler() {

        if (!selectedFriendId) {
            return;
        }

        let response;

        try {
            response = await fetch(`/api/matches?friendId=${selectedFriendId}`)
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

{#each friends as friend}

    <label>
        <input type=radio bind:group={selectedFriendId} value={friend.id}>
        {friend.name}
    </label>

{/each}

<div>
    <input type="text" bind:value={selectedFriendId}/>

    <button on:click={clickHandler}> click</button>
</div>

{#if result}
    <!--  AN error  -->
    {#if typeof result === "string"}
        <p>{@html result}</p>
    {/if}

    {#if typeof result === "object"}
        <pre>{JSON.stringify(result, null, 2)}</pre>
    {/if}

{/if}

