// test-fetch.ts
const main = async ()=> {
    const res = await fetch(
        'https://api.coingecko.com/api/v3/ping?API_KEY=CG-x7SGg2LFL7pNJiWNMwEfZLwT',

    );

    const data = await res.json();
    console.log(data);
}

main()