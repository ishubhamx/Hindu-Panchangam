
import axios from 'axios';

const url = 'https://www.drikpanchang.com/panchang/day-panchang.html?date=22/06/2025&geoname-id=1277333';

async function discover() {
    try {
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;
        const regex = /drikp_g_([a-zA-Z0-9_]+)=['"]?(.*?)['"]?;/g;

        let match;
        const keys: string[] = [];
        while ((match = regex.exec(html)) !== null) {
            console.log(`${match[1]} : ${match[2]}`);
            keys.push(match[1]);
        }

    } catch (e) {
        console.error(e);
    }
}

discover();
