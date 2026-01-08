
import axios from 'axios';
import * as cheerio from 'cheerio';

// URL for Jan 08, 2026 Bangalore
const url = 'https://www.drikpanchang.com/panchang/day-panchang.html?date=08/01/2026&geoname-id=1277333';

async function inspect() {
    try {
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        console.log('Page Title:', $('title').text());

        // Check for tables
        console.log('\n--- Tables Found ---');
        $('.dpTableRow').each((j, row) => {
            const key = $(row).find('.dpTableKey').text().trim();
            const val = $(row).find('.dpTableValue').text().trim();
            if (key) console.log(`  Row ${j}: ${key} = ${val}`);
        });

        // Search specifically for Auspicious/Inauspicious
        console.log('\n--- Muhurtas & Times ---');
        const searchTerms = ['Abhijit', 'Rahu', 'Yamaganda', 'Gulika'];
        searchTerms.forEach(term => {
            const element = $(`div:contains("${term}")`).last();
            if (element.length) {
                console.log(`Found ${term}:`, element.text().trim().substring(0, 100));
                try {
                    console.log('  Parent class:', element.parent().attr('class'));
                } catch (e) { }
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

inspect();
